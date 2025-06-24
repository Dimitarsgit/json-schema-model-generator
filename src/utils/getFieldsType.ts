import { FORMATS } from '../constants';

type Options = {
  isArray?: boolean;
  isEnum?: boolean;
  isString?: boolean;
  isBoolean?: boolean;
  genericType?: string;
  propName?: string;
  format?: string;
};

/**
 * Returns the appropriate field type string based on the provided options.
 *
 * @param options - Configuration options for determining the field type.
 * @returns A string representing the field type.
 * @throws Error if required options for certain field types are missing.
 */
export const getFieldType: (options: Options) => string = ({
  isArray = false,
  isEnum = false,
  isString = false,
  isBoolean = false,
  propName,
  genericType,
  format,
}) => {
  const FORMAT_FIELD_MAP: Record<string, string> = {
    [FORMATS.DECIMAL]: 'DecimalField',
    [FORMATS.DATE]: 'DateField',
    [FORMATS.DATE_TIME]: 'DateTimeField',
    [FORMATS.PERCENTAGE]: 'PercentageField',
  };

  if (isEnum && isString) {
    if (!genericType || !propName) {
      throw new Error("EnumField requires both 'genericType' and 'propName'");
    }
    return `EnumField<${genericType}['${propName}']>`;
  }

  if (isString) {
    return FORMAT_FIELD_MAP[format ?? ''] || 'SchemaAwareField';
  }

  if (isBoolean) {
    return 'BooleanField';
  }

  if (isArray) {
    if (!genericType) {
      throw new Error("SchemaAwareArray requires 'genericType'");
    }
    return `SchemaAwareArray<${genericType}>`;
  }

  // Default fallback field type
  return 'SchemaAwareField';
};
