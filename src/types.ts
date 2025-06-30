export type OpenApiSchemaType =
  | 'string'
  | 'number'
  | 'integer'
  | 'boolean'
  | 'object'
  | 'array'
  | 'null';

export type OpenApiSchema = {
  type?: OpenApiSchemaType | OpenApiSchemaType[];
  format?: string;
  description?: string;
  title?: string;
  enum?: (string | number | boolean)[];
  default?: any;
  examples?: any[];
  required?: string[];
  properties?: Record<string, OpenApiSchema>;
  items?: OpenApiSchema;
  additionalProperties?: boolean | OpenApiSchema;
  parameters?: OpenApiSchema;
};
