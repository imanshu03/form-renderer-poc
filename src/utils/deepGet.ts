export function deepGet(obj: any, path: string, defaultValue?: any): any {
  if (!obj || typeof path !== 'string') {
    return defaultValue;
  }

  // Handle array notation like 'items[0].name'
  const normalizedPath = path.replace(/\[(\d+)\]/g, '.$1');
  const keys = normalizedPath.split('.');
  
  let current = obj;
  
  for (const key of keys) {
    if (current == null) {
      return defaultValue;
    }
    
    // Handle array index
    if (!isNaN(Number(key))) {
      current = current[Number(key)];
    } else {
      current = current[key];
    }
  }
  
  return current !== undefined ? current : defaultValue;
}