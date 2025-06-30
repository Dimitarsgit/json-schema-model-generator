export const hasType = (type: string | string[] | undefined, target: string): boolean =>
  typeof type === 'string' ? type === target : Array.isArray(type) ? type.includes(target) : false;
