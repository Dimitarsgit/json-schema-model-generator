/**
 * Checks if the given type (string or array of strings) includes the target type.
 *
 * @param type - The type or array of types to check.
 * @param target - The target type to find.
 * @returns True if the target type is found, false otherwise.
 */
export const hasType = (type: string | string[] | undefined, target: string): boolean =>
  typeof type === 'string' ? type === target : Array.isArray(type) ? type.includes(target) : false;
