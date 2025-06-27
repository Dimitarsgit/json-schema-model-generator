import fs from 'fs';

export const loadJsonSchema = (input: string) => {
  // Load and parse JSON Schema file
  const file = fs.readFileSync(input, 'utf8');

  return JSON.parse(file);
};
