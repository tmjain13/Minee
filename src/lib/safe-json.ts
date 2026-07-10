export const safeStringify = (obj: any, replacer?: (this: any, key: string, value: any) => any, space?: string | number): string => {
  const cache = new WeakSet();

  function customReplacer(this: any, key: string, value: any) {
    // 1. Handle Circularity
    if (typeof value === 'object' && value !== null) {
      if (cache.has(value)) return undefined; // Remove circular reference
      cache.add(value);
    }

    // 2. Handle Firestore/Complex Types (only if it's an object)
    if (typeof value === 'object' && value !== null) {
      if (typeof value.toDate === 'function') return value.toDate().toISOString();
      const constructorName = value.constructor?.name;
      
      if (
        (['DocumentReference', 'Query', 'Firestore', 'DocumentSnapshot', 'QuerySnapshot', 'Y2', 'Ka', 'Xi', 'Si'].includes(constructorName || '')) ||
        (value.type === 'document' || value.type === 'collection' || value.firestore || value._delegate)
      ) {
        return `[FirebaseObject:${constructorName || 'Complex'}]`;
      }
    }

    // 3. Chain with original replacer (if provided)
    return replacer ? replacer.call(this, key, value) : value;
  }

  try {
    return JSON.stringify(obj, customReplacer, space);
  } catch (e) {
    console.error('SafeStringify Error:', e);
    return `[Unserializable Structure]`;
  }
};
