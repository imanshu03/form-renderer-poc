import { FormSchema, Rule, Section, SubSection, FieldBase, DependencyGraph } from '../types/schema';
import { extractVariablePaths } from './jsonlogic';

/**
 * Builds a dependency graph from the form schema
 */
export function buildDependencyGraph(schema: FormSchema): DependencyGraph {
  const byField: Record<string, string[]> = {};
  const rules: Record<string, { rule: Rule; reads: string[] }> = {};
  
  // Process form-level rules
  if (schema.formRules) {
    schema.formRules.forEach(rule => {
      const reads = extractVariablePaths(rule.when);
      rules[rule.id] = { rule, reads };
      
      // Map fields to rules
      reads.forEach(fieldPath => {
        // Skip globals and params paths for field dependency tracking
        if (fieldPath.startsWith('globals.') || fieldPath.startsWith('params.')) {
          return;
        }
        // Extract field ID from path (e.g., "fieldId" or "values.fieldId")
        const fieldId = fieldPath.split('.').pop() || fieldPath;
        if (!byField[fieldId]) {
          byField[fieldId] = [];
        }
        byField[fieldId].push(rule.id);
      });
    });
  }
  
  // Process section and field rules
  schema.sections.forEach(section => {
    // Process section visibility rules
    if (section.visibilityRule) {
      const ruleId = `section_${section.id}_visibility`;
      const rule: Rule = {
        id: ruleId,
        when: section.visibilityRule,
        then: [
          { type: 'SHOW_SECTION', target: section.id, value: true }
        ],
        else: [
          { type: 'HIDE_SECTION', target: section.id, value: false }
        ]
      };
      
      const reads = extractVariablePaths(rule.when);
      rules[ruleId] = { rule, reads };
      
      reads.forEach(fieldPath => {
        // Skip globals and params paths for field dependency tracking
        if (fieldPath.startsWith('globals.') || fieldPath.startsWith('params.')) {
          return;
        }
        const fieldId = fieldPath.split('.').pop() || fieldPath;
        if (!byField[fieldId]) {
          byField[fieldId] = [];
        }
        byField[fieldId].push(ruleId);
      });
    }
    
    // Process subsection visibility rules
    if (section.subsections) {
      section.subsections.forEach(subsection => {
        if (subsection.visibilityRule) {
          const ruleId = `subsection_${subsection.id}_visibility`;
          const rule: Rule = {
            id: ruleId,
            when: subsection.visibilityRule,
            then: [
              { type: 'SHOW_SECTION', target: `subsection_${subsection.id}`, value: true }
            ],
            else: [
              { type: 'HIDE_SECTION', target: `subsection_${subsection.id}`, value: false }
            ]
          };
          
          const reads = extractVariablePaths(rule.when);
          rules[ruleId] = { rule, reads };
          
          reads.forEach(fieldPath => {
            // Skip globals and params paths for field dependency tracking
            if (fieldPath.startsWith('globals.') || fieldPath.startsWith('params.')) {
              return;
            }
            const fieldId = fieldPath.split('.').pop() || fieldPath;
            if (!byField[fieldId]) {
              byField[fieldId] = [];
            }
            byField[fieldId].push(ruleId);
          });
        }
      });
    }
    
    // Process fields
    const fields = getFieldsFromSection(section);
    fields.forEach(field => {
      // Field visibility rules
      if (field.visibilityRule) {
        const ruleId = `field_${field.id}_visibility`;
        const rule: Rule = {
          id: ruleId,
          when: field.visibilityRule,
          then: [
            { type: 'SHOW_FIELD', target: field.id, value: true }
          ],
          else: [
            { type: 'HIDE_FIELD', target: field.id, value: false }
          ]
        };
        
        const reads = extractVariablePaths(rule.when);
        rules[ruleId] = { rule, reads };
        
        reads.forEach(fieldPath => {
          const fieldId = fieldPath.split('.').pop() || fieldPath;
          if (!byField[fieldId]) {
            byField[fieldId] = [];
          }
          byField[fieldId].push(ruleId);
        });
      }
      
      // Field-specific rules
      if (field.rules) {
        field.rules.forEach(rule => {
          const reads = extractVariablePaths(rule.when);
          rules[rule.id] = { rule, reads };
          
          reads.forEach(fieldPath => {
            // Skip globals and params paths for field dependency tracking
            if (fieldPath.startsWith('globals.') || fieldPath.startsWith('params.')) {
              return;
            }
            const fieldId = fieldPath.split('.').pop() || fieldPath;
            if (!byField[fieldId]) {
              byField[fieldId] = [];
            }
            byField[fieldId].push(rule.id);
          });
        });
      }
    });
  });
  
  // Detect cycles
  const cycles = detectCycles(rules);
  if (cycles.length > 0) {
    console.warn('Dependency cycles detected:', cycles);
  }
  
  return { byField, rules };
}

/**
 * Gets all fields from a section (handles both rows and legacy fields)
 */
function getFieldsFromSection(section: Section): FieldBase[] {
  const fields: FieldBase[] = [];
  
  // Add fields directly from the section
  if (section.fields) {
    fields.push(...section.fields);
  }
  
  // Add fields from subsections
  if (section.subsections) {
    section.subsections.forEach(subsection => {
      if (subsection.fields) {
        fields.push(...subsection.fields);
      }
    });
  }
  
  return fields;
}

/**
 * Detects cycles in the dependency graph
 */
function detectCycles(
  rules: Record<string, { rule: Rule; reads: string[] }>
): string[][] {
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const stack = new Set<string>();
  
  function visit(ruleId: string, path: string[] = []): void {
    if (stack.has(ruleId)) {
      // Found a cycle
      const cycleStart = path.indexOf(ruleId);
      cycles.push(path.slice(cycleStart).concat(ruleId));
      return;
    }
    
    if (visited.has(ruleId)) {
      return;
    }
    
    visited.add(ruleId);
    stack.add(ruleId);
    path.push(ruleId);
    
    const ruleData = rules[ruleId];
    if (ruleData) {
      // Find rules that depend on the outputs of this rule
      const actions = Array.isArray(ruleData.rule.then) 
        ? ruleData.rule.then 
        : ruleData.rule.then ? [ruleData.rule.then] : [];
      
      const elseActions = Array.isArray(ruleData.rule.else)
        ? ruleData.rule.else
        : ruleData.rule.else ? [ruleData.rule.else] : [];
      
      [...actions, ...elseActions].forEach(action => {
        if (action.type === 'SET_VALUE') {
          // Find rules that read from this field
          Object.entries(rules).forEach(([depRuleId, depRuleData]) => {
            if (depRuleData.reads.includes(action.target)) {
              visit(depRuleId, [...path]);
            }
          });
        }
      });
    }
    
    stack.delete(ruleId);
  }
  
  Object.keys(rules).forEach(ruleId => {
    if (!visited.has(ruleId)) {
      visit(ruleId);
    }
  });
  
  return cycles;
}

/**
 * Gets all rules that should be evaluated when a field changes
 */
export function getRulesForField(
  fieldId: string,
  deps: DependencyGraph
): string[] {
  return deps.byField[fieldId] || [];
}

/**
 * Topologically sorts rules for evaluation order
 */
export function sortRulesForEvaluation(
  ruleIds: string[],
  deps: DependencyGraph
): string[] {
  // For most cases, the order doesn't matter much since rules should be independent
  // We'll just ensure that rules that SET_VALUE are evaluated before rules that read those values
  
  const sorted: string[] = [];
  const visited = new Set<string>();
  
  // Build a map of which rules write to which fields
  const writesTo: Record<string, string[]> = {};
  ruleIds.forEach(ruleId => {
    const ruleData = deps.rules[ruleId];
    if (ruleData && ruleData.rule) {
      const actions = [
        ...(Array.isArray(ruleData.rule.then) ? ruleData.rule.then : ruleData.rule.then ? [ruleData.rule.then] : []),
        ...(Array.isArray(ruleData.rule.else) ? ruleData.rule.else : ruleData.rule.else ? [ruleData.rule.else] : [])
      ];
      
      actions.forEach(action => {
        if (action.type === 'SET_VALUE') {
          if (!writesTo[action.target]) {
            writesTo[action.target] = [];
          }
          writesTo[action.target].push(ruleId);
        }
      });
    }
  });
  
  function visit(ruleId: string): void {
    if (visited.has(ruleId)) {
      return;
    }
    
    visited.add(ruleId);
    
    // First visit rules that write values this rule reads
    const ruleData = deps.rules[ruleId];
    if (ruleData) {
      ruleData.reads.forEach(fieldPath => {
        // Skip globals and params
        if (fieldPath.startsWith('globals.') || fieldPath.startsWith('params.')) {
          return;
        }
        
        const fieldId = fieldPath.split('.').pop() || fieldPath;
        const writerRules = writesTo[fieldId] || [];
        
        writerRules.forEach(writerId => {
          if (writerId !== ruleId && ruleIds.includes(writerId) && !visited.has(writerId)) {
            visit(writerId);
          }
        });
      });
    }
    
    sorted.push(ruleId);
  }
  
  ruleIds.forEach(visit);
  return sorted;
}