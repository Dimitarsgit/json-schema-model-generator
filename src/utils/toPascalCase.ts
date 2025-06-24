/**
 * Converts a string to PascalCase.
 * Example: "my_variable_name" -> "MyVariableName"
 *
 * @param str - The string to convert.
 * @returns The PascalCase version of the string.
 */
export const toPascalCase = (str: string): string => {
  return str.replace(/(^\w|_\w)/g, (match) => match.replace('_', '').toUpperCase());
};
