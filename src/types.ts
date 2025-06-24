export type JsonSchemaType =
  | 'string'
  | 'number'
  | 'integer'
  | 'boolean'
  | 'object'
  | 'array'
  | 'null';

export type JsonSchema = {
  type?: JsonSchemaType | JsonSchemaType[];
  format?: string;
  description?: string;
  title?: string;
  enum?: (string | number | boolean)[];
  default?: any;
  examples?: any[];
  required?: string[];
  properties?: Record<string, JsonSchema>;
  items?: JsonSchema;
  additionalProperties?: boolean | JsonSchema;
  parameters?: JsonSchema;
};
