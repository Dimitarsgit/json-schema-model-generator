import fs from 'fs';
import yaml from 'yaml';

export const loadOpenApiYamlSchemas = (input: string) => {
  // Load and parse OpenAPI 3.1.0 YAML file
  const file = fs.readFileSync(input, 'utf8');
  const openApiDoc = yaml.parse(file);

  // Extract sourceExamples
  return openApiDoc.components?.schemas ?? {};
};
