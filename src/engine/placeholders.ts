import { deepGet } from '../utils/deepGet';
import { GlobalContext } from '../types/schema';

export interface PlaceholderContext {
  globals?: GlobalContext;
  values?: Record<string, any>;
  [key: string]: any;
}

/**
 * Resolves placeholders in a string value
 * Supports ${path.to.value} syntax
 */
export function resolvePlaceholders(
  template: string,
  context: PlaceholderContext
): string {
  if (typeof template !== 'string') {
    return String(template);
  }

  // Match ${...} patterns
  return template.replace(/\$\{([^}]+)\}/g, (match, path) => {
    const trimmedPath = path.trim();
    
    // Try to resolve from different context sources in order of priority
    // 1. Direct context properties
    if (context[trimmedPath] !== undefined) {
      return String(context[trimmedPath]);
    }
    
    // 2. Values (form values)
    if (context.values) {
      const value = deepGet(context.values, trimmedPath);
      if (value !== undefined) {
        return String(value);
      }
    }
    
    // 3. Globals
    if (context.globals) {
      const value = deepGet(context.globals, trimmedPath);
      if (value !== undefined) {
        return String(value);
      }
    }
    
    // 4. Deep path in entire context
    const value = deepGet(context, trimmedPath);
    if (value !== undefined) {
      return String(value);
    }
    
    // Return original placeholder if not found
    return match;
  });
}

/**
 * Recursively resolves placeholders in an object/array/string
 */
export function resolvePlaceholdersDeep(
  input: any,
  context: PlaceholderContext
): any {
  // Handle null/undefined
  if (input == null) {
    return input;
  }
  
  // Handle strings
  if (typeof input === 'string') {
    return resolvePlaceholders(input, context);
  }
  
  // Handle arrays
  if (Array.isArray(input)) {
    return input.map(item => resolvePlaceholdersDeep(item, context));
  }
  
  // Handle objects
  if (typeof input === 'object') {
    const result: any = {};
    for (const [key, value] of Object.entries(input)) {
      // Resolve placeholders in keys as well
      const resolvedKey = typeof key === 'string' 
        ? resolvePlaceholders(key, context)
        : key;
      result[resolvedKey] = resolvePlaceholdersDeep(value, context);
    }
    return result;
  }
  
  // Return primitives as-is
  return input;
}

/**
 * Extracts placeholder paths from a template string
 */
export function extractPlaceholderPaths(template: string): string[] {
  if (typeof template !== 'string') {
    return [];
  }
  
  const paths: string[] = [];
  const regex = /\$\{([^}]+)\}/g;
  let match;
  
  while ((match = regex.exec(template)) !== null) {
    paths.push(match[1].trim());
  }
  
  return paths;
}

/**
 * Extracts all placeholder paths from an object recursively
 */
export function extractPlaceholderPathsDeep(input: any): string[] {
  const paths: string[] = [];
  
  function traverse(value: any) {
    if (value == null) {
      return;
    }
    
    if (typeof value === 'string') {
      paths.push(...extractPlaceholderPaths(value));
    } else if (Array.isArray(value)) {
      value.forEach(traverse);
    } else if (typeof value === 'object') {
      Object.values(value).forEach(traverse);
    }
  }
  
  traverse(input);
  return [...new Set(paths)]; // Remove duplicates
}