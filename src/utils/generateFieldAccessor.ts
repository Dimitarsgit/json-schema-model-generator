export const generateFieldAccessor = (
  propName: string,
  returnType: string,
  castType?: string
): string[] => {
  const cast = castType ? `, ${castType}` : '';

  return [
    `  get ${propName}(): ${returnType} {`,
    `    return this.getProperty("${propName}"${cast});`,
    `  }`,
  ];
};
