import { JsonLogicExpression, GlobalContext } from '../types/schema';
import { deepGet } from '../utils/deepGet';

export interface EvaluationContext {
  data?: Record<string, any>;
  globals?: GlobalContext;
  params?: Record<string, any>;
}

/**
 * Evaluates a JSONLogic expression
 */
export function evaluate(
  expr: JsonLogicExpression,
  context: EvaluationContext = {}
): any {
  // Handle null/undefined
  if (expr === null || expr === undefined) {
    return expr;
  }

  // Handle primitives
  if (typeof expr === 'string' || typeof expr === 'number' || typeof expr === 'boolean') {
    return expr;
  }

  // Handle variable references
  if (typeof expr === 'object' && 'var' in expr) {
    const path = expr.var;
    
    // Handle specific context prefixes
    if (path.startsWith('globals.')) {
      const globalPath = path.substring('globals.'.length);
      if (context.globals) {
        const value = deepGet(context.globals, globalPath);
        if (value !== undefined) return value;
      }
      return undefined;
    }
    
    if (path.startsWith('params.')) {
      const paramPath = path.substring('params.'.length);
      if (context.params) {
        const value = deepGet(context.params, paramPath);
        if (value !== undefined) return value;
      }
      return undefined;
    }
    
    // Default to data context (no prefix means field value)
    if (context.data) {
      const value = deepGet(context.data, path);
      if (value !== undefined) return value;
    }
    
    // Fallback: try globals without prefix (for backward compatibility)
    if (context.globals) {
      const value = deepGet(context.globals, path);
      if (value !== undefined) return value;
    }
    
    // Fallback: try params without prefix (for backward compatibility)
    if (context.params) {
      const value = deepGet(context.params, path);
      if (value !== undefined) return value;
    }
    
    return undefined;
  }

  // Handle operators
  if (typeof expr === 'object') {
    const entries = Object.entries(expr);
    if (entries.length === 0) return expr;
    
    const [operator, operands] = entries[0];
    
    switch (operator) {
      // Comparison operators
      case '==':
        return handleEquals(operands, context);
      case '!=':
        return !handleEquals(operands, context);
      case '>':
        return handleComparison(operands, context, (a, b) => a > b);
      case '>=':
        return handleComparison(operands, context, (a, b) => a >= b);
      case '<':
        return handleComparison(operands, context, (a, b) => a < b);
      case '<=':
        return handleComparison(operands, context, (a, b) => a <= b);
      
      // Logical operators
      case 'and':
        return handleAnd(operands, context);
      case 'or':
        return handleOr(operands, context);
      case 'not':
        return !evaluate(operands, context);
      
      // Array/String operators
      case 'in':
        return handleIn(operands, context);
      case 'empty':
        return handleEmpty(operands, context);
      case 'contains':
        return handleContains(operands, context);
      case 'startsWith':
        return handleStartsWith(operands, context);
      case 'endsWith':
        return handleEndsWith(operands, context);
      case 'count':
        return handleCount(operands, context);
      
      // Conditional
      case 'if':
        return handleIf(operands, context);
      
      default:
        console.warn(`Unknown JSONLogic operator: ${operator}`);
        return false;
    }
  }

  return expr;
}

function handleEquals(operands: any, context: EvaluationContext): boolean {
  if (!Array.isArray(operands) || operands.length !== 2) return false;
  const [a, b] = operands.map(op => evaluate(op, context));
  return a === b;
}

function handleComparison(
  operands: any,
  context: EvaluationContext,
  compareFn: (a: any, b: any) => boolean
): boolean {
  if (!Array.isArray(operands) || operands.length !== 2) return false;
  const [a, b] = operands.map(op => evaluate(op, context));
  
  // Try to convert to numbers for comparison
  const numA = Number(a);
  const numB = Number(b);
  
  if (!isNaN(numA) && !isNaN(numB)) {
    return compareFn(numA, numB);
  }
  
  return compareFn(a, b);
}

function handleAnd(operands: any, context: EvaluationContext): boolean {
  if (!Array.isArray(operands)) {
    return !!evaluate(operands, context);
  }
  
  for (const operand of operands) {
    if (!evaluate(operand, context)) {
      return false;
    }
  }
  return true;
}

function handleOr(operands: any, context: EvaluationContext): boolean {
  if (!Array.isArray(operands)) {
    return !!evaluate(operands, context);
  }
  
  for (const operand of operands) {
    if (evaluate(operand, context)) {
      return true;
    }
  }
  return false;
}

function handleIn(operands: any, context: EvaluationContext): boolean {
  if (!Array.isArray(operands) || operands.length !== 2) return false;
  const [needle, haystack] = operands.map(op => evaluate(op, context));
  
  if (Array.isArray(haystack)) {
    return haystack.includes(needle);
  }
  
  if (typeof haystack === 'string' && typeof needle === 'string') {
    return haystack.includes(needle);
  }
  
  return false;
}

function handleEmpty(operands: any, context: EvaluationContext): boolean {
  const value = evaluate(operands, context);
  
  if (value === null || value === undefined) return true;
  if (value === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === 'object' && Object.keys(value).length === 0) return true;
  
  return false;
}

function handleContains(operands: any, context: EvaluationContext): boolean {
  if (!Array.isArray(operands) || operands.length !== 2) return false;
  const [container, item] = operands.map(op => evaluate(op, context));
  
  if (Array.isArray(container)) {
    return container.includes(item);
  }
  
  if (typeof container === 'string' && typeof item === 'string') {
    return container.includes(item);
  }
  
  return false;
}

function handleStartsWith(operands: any, context: EvaluationContext): boolean {
  if (!Array.isArray(operands) || operands.length !== 2) return false;
  const [str, prefix] = operands.map(op => evaluate(op, context));
  
  if (typeof str === 'string' && typeof prefix === 'string') {
    return str.startsWith(prefix);
  }
  
  return false;
}

function handleEndsWith(operands: any, context: EvaluationContext): boolean {
  if (!Array.isArray(operands) || operands.length !== 2) return false;
  const [str, suffix] = operands.map(op => evaluate(op, context));
  
  if (typeof str === 'string' && typeof suffix === 'string') {
    return str.endsWith(suffix);
  }
  
  return false;
}

function handleCount(operands: any, context: EvaluationContext): number {
  const value = evaluate(operands, context);
  
  // Handle null/undefined
  if (value === null || value === undefined) return 0;
  
  // Handle arrays
  if (Array.isArray(value)) {
    return value.length;
  }
  
  // Handle strings
  if (typeof value === 'string') {
    return value.length;
  }
  
  // Handle objects (count properties)
  if (typeof value === 'object') {
    return Object.keys(value).length;
  }
  
  // For primitives, return 1 if truthy, 0 if falsy
  return value ? 1 : 0;
}

function handleIf(operands: any, context: EvaluationContext): any {
  if (!Array.isArray(operands) || operands.length < 2) {
    return undefined;
  }
  
  const [condition, thenBranch, elseBranch] = operands;
  
  if (evaluate(condition, context)) {
    return evaluate(thenBranch, context);
  } else if (elseBranch !== undefined) {
    return evaluate(elseBranch, context);
  }
  
  return undefined;
}

/**
 * Extracts all variable paths referenced in a JSONLogic expression
 */
export function extractVariablePaths(expr: JsonLogicExpression): string[] {
  const paths: string[] = [];
  
  function traverse(value: any) {
    if (value === null || value === undefined) {
      return;
    }
    
    if (typeof value === 'object' && 'var' in value) {
      paths.push(value.var);
      return;
    }
    
    if (Array.isArray(value)) {
      value.forEach(traverse);
    } else if (typeof value === 'object') {
      Object.values(value).forEach(traverse);
    }
  }
  
  traverse(expr);
  return [...new Set(paths)]; // Remove duplicates
}