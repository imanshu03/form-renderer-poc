export function resolvePlaceholders<T>(input: T, context: Record<string, any>): T {
  if (typeof input === 'string') {
    return input.replace(/{{(.*?)}}/g, (_, path) => {
      const value = getByPath(context, path.trim());
      return value != null ? String(value) : '';
    }) as unknown as T;
  }
  if (Array.isArray(input)) {
    return input.map((item) => resolvePlaceholders(item, context)) as unknown as T;
  }
  if (input && typeof input === 'object') {
    const result: any = {};
    for (const [key, value] of Object.entries(input as any)) {
      result[key] = resolvePlaceholders(value, context);
    }
    return result;
  }
  return input;
}

function getByPath(obj: any, path: string): any {
  return path.split('.').reduce((acc, part) => (acc ? acc[part] : undefined), obj);
}
