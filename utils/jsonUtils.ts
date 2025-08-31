
/**
 * Sets a value in a nested object or array immutably.
 * Creates new objects/arrays for the path segments.
 * @param obj The object to update.
 * @param path An array of keys/indices representing the path to the value.
 * @param value The new value to set.
 * @returns A new object with the updated value.
 */
export const setAtPath = (obj: any, path: (string | number)[], value: any): any => {
  if (path.length === 0) {
    return value;
  }

  const [head, ...tail] = path;
  
  // Ensure we don't try to set a key on a non-object
  const currentLevelIsObject = typeof obj === 'object' && obj !== null;

  const newRoot = Array.isArray(obj) ? [...obj] : { ...(currentLevelIsObject ? obj : {}) };

  const nextObj = currentLevelIsObject ? obj[head] : undefined;

  if (tail.length > 0) {
    newRoot[head] = setAtPath(nextObj, tail, value);
  } else {
    newRoot[head] = value;
  }

  return newRoot;
};