export function deepSet(obj: any, path: string, value: any): any {
  if (!obj || typeof path !== 'string') {
    return obj;
  }

  // Clone the object to avoid mutations
  const result = structuredClone ? structuredClone(obj) : JSON.parse(JSON.stringify(obj));
  
  // Handle array notation like 'items[0].name'
  const normalizedPath = path.replace(/\[(\d+)\]/g, '.$1');
  const keys = normalizedPath.split('.');
  const lastKey = keys.pop();
  
  if (!lastKey) {
    return result;
  }
  
  let current = result;
  
  // Navigate to the parent of the target
  for (const key of keys) {
    const isArrayIndex = !isNaN(Number(key));
    
    if (isArrayIndex) {
      const index = Number(key);
      // Ensure array exists and is large enough
      if (!Array.isArray(current)) {
        throw new Error(`Expected array at path segment: ${key}`);
      }
      // Extend array if necessary
      while (current.length <= index) {
        current.push(undefined);
      }
      // Create nested object if it doesn't exist
      if (current[index] == null) {
        // Check if next key is array index to determine what to create
        const nextKeyIndex = keys.indexOf(key) + 1;
        const nextKey = keys[nextKeyIndex];
        current[index] = nextKey && !isNaN(Number(nextKey)) ? [] : {};
      }
      current = current[index];
    } else {
      // Create nested object if it doesn't exist
      if (current[key] == null) {
        // Check if next key is array index to determine what to create
        const nextKeyIndex = keys.indexOf(key) + 1;
        const nextKey = keys[nextKeyIndex];
        current[key] = nextKey && !isNaN(Number(nextKey)) ? [] : {};
      }
      current = current[key];
    }
  }
  
  // Set the final value
  if (!isNaN(Number(lastKey))) {
    const index = Number(lastKey);
    if (!Array.isArray(current)) {
      throw new Error(`Expected array at path segment: ${lastKey}`);
    }
    current[index] = value;
  } else {
    current[lastKey] = value;
  }
  
  return result;
}