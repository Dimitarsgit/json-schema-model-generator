export const FORMATS = {
  DECIMAL: 'decimal',
  DATE: 'date',
  DATE_TIME: 'date-time',
  PERCENTAGE: 'percentage',
} as const;

export const FIELD_TYPES = {
  STRING: 'string',
  BOOLEAN: 'boolean',
  OBJECT: 'object',
  ARRAY: 'array',
} as const;

export const FIELD_CLASSES = {
  DECIMAL: 'DecimalField',
  DATE: 'DateField',
  DATE_TIME: 'DateTimeField',
  PERCENTAGE: 'PercentageField',
  ENUM: 'EnumField',
  BOOLEAN: 'BooleanField',
  ARRAY: 'SchemaAwareArray',
  FIELD: 'SchemaAwareField',
  MODEL: 'SchemaAwareModel',
} as const;

export const FORMAT_TO_FIELD: Record<string, (typeof FIELD_CLASSES)[keyof typeof FIELD_CLASSES]> = {
  decimal: FIELD_CLASSES.DECIMAL,
  date: FIELD_CLASSES.DATE,
  'date-time': FIELD_CLASSES.DATE_TIME,
  percentage: FIELD_CLASSES.PERCENTAGE,
};
