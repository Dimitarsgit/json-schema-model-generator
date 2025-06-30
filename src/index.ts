import * as fs from 'fs';
import * as path from 'path';
import { FIELD_CLASSES, FIELD_TYPES, FORMAT_TO_FIELD } from './constants';
import { OpenApiSchema } from './types';
import { generateFieldAccessor, getFieldType, toPascalCase, hasType } from './utils';

export const extractRefName = (ref: string): string => toPascalCase(ref.split('/').pop()!);

export function generateModel(
  className: string,
  schema: OpenApiSchema
): {
  code: string;
  nestedSchemas: [string, OpenApiSchema][];
} {
  const dtoType = `${className}WebDto`;
  const objectSchema = schema.parameters || schema;

  const lines: string[] = [`import { ${dtoType} } from './api';`];
  const usedFieldClasses = new Set<string>([FIELD_CLASSES.MODEL]);
  const nestedModelImports = new Set<string>();
  const nestedSchemas: [string, OpenApiSchema][] = [];

  lines.push('');
  lines.push(`export class ${className} extends ${FIELD_CLASSES.MODEL}<${dtoType}> {`);

  // ✅ Handle root-level enums (e.g. type: string + enum)
  const isRootEnum =
    objectSchema.type === 'string' && Array.isArray(objectSchema.enum) && !objectSchema.properties;

  if (isRootEnum) {
    const returnType = getFieldType({
      isEnum: true,
      isString: true,
      propName: 'value',
      genericType: dtoType,
    });

    usedFieldClasses.add(FIELD_CLASSES.ENUM);
    lines.push(...generateFieldAccessor('value', returnType));
    lines.push('}');

    lines.unshift(`import { ${[...usedFieldClasses].join(', ')} } from '@gom/schema-engine-lib';`);
    return {
      code: lines.join('\n'),
      nestedSchemas: [],
    };
  }

  const properties = objectSchema.properties ?? {};
  for (const [propName, propSchema] of Object.entries(properties)) {
    const type = propSchema.type;
    const isString = hasType(type, FIELD_TYPES.STRING);
    const isInteger = hasType(type, FIELD_TYPES.INTEGER);
    const isNumber = hasType(type, FIELD_TYPES.NUMBER);
    const isBoolean = hasType(type, FIELD_TYPES.BOOLEAN);
    const isObject = hasType(type, FIELD_TYPES.OBJECT);
    const isArray = hasType(type, FIELD_TYPES.ARRAY);
    const isEnum = Array.isArray(propSchema.enum);

    // Add description as comment
    if (propSchema.description) {
      lines.push(`  // ${propSchema.description}`);
    }

    if (!isObject && !isArray) {
      const returnType = getFieldType({
        isString,
        isBoolean,
        isEnum,
        format: propSchema.format,
        genericType: dtoType,
        propName,
      });

      if (isEnum && isString) {
        usedFieldClasses.add(FIELD_CLASSES.ENUM);
      } else if (isBoolean) {
        usedFieldClasses.add(FIELD_CLASSES.BOOLEAN);
      } else if (isString || isInteger || isNumber) {
        usedFieldClasses.add(FORMAT_TO_FIELD[propSchema.format ?? ''] || FIELD_CLASSES.FIELD);
      }

      lines.push(...generateFieldAccessor(propName, returnType));
    } else if (isObject && propSchema.properties) {
      const nestedClassName = toPascalCase(propName);
      usedFieldClasses.add(FIELD_CLASSES.MODEL);
      nestedModelImports.add(nestedClassName);
      nestedSchemas.push([nestedClassName, propSchema]);

      lines.push(...generateFieldAccessor(propName, nestedClassName, nestedClassName));
    } else if (isArray && propSchema.items) {
      const itemSchema = propSchema.items;

      let itemClass: string;
      if ('$ref' in itemSchema && typeof itemSchema.$ref === 'string') {
        itemClass = extractRefName(itemSchema.$ref);
        nestedModelImports.add(itemClass);
      } else if (itemSchema.type === 'object' && itemSchema.properties) {
        itemClass = toPascalCase(propName.slice(0, -1));
        nestedModelImports.add(itemClass);
        nestedSchemas.push([itemClass, itemSchema]);
      } else {
        itemClass = 'unknown';
      }

      usedFieldClasses.add(FIELD_CLASSES.ARRAY);
      const returnType = getFieldType({
        isArray: true,
        genericType: itemClass,
      });

      lines.push(...generateFieldAccessor(propName, returnType, itemClass));
    } else {
      usedFieldClasses.add(FIELD_CLASSES.FIELD);
      console.warn(`Unsupported or unknown property "${propName}"`, propSchema);
      lines.push(...generateFieldAccessor(propName, getFieldType({})));
    }
  }

  lines.push('}');

  // Import nested models
  for (const importName of nestedModelImports) {
    lines.unshift(`import { ${importName} } from './${importName}';`);
  }

  // Import schema-engine classes
  lines.unshift(`import { ${[...usedFieldClasses].join(', ')} } from 'schema-engine';`);

  return {
    code: lines.join('\n'),
    nestedSchemas,
  };
}

function generateRecursively(
  className: string,
  schema: OpenApiSchema,
  outputDir: string,
  generatedClasses: Set<string>
) {
  if (generatedClasses.has(className)) return;
  generatedClasses.add(className);

  const { code, nestedSchemas } = generateModel(className, schema);

  try {
    const filePath = path.join(outputDir, `${className}.ts`);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, code, 'utf-8');
    console.log(`Generated ${className}.ts`);
  } catch (error) {
    console.error(`Failed to write file for ${className}:`, error);
  }

  for (const [nestedName, nestedSchema] of nestedSchemas) {
    generateRecursively(nestedName, nestedSchema, outputDir, generatedClasses);
  }
}

/**
 * Generates model classes.
 *
 * @param schemas - Object with keys as class names and values representing class fields.
 * @param outputDir - Directory to write generated model files.
 */
export function generateFromSchemas(schemas: Record<string, OpenApiSchema>, outputDir: string) {
  const generatedClasses = new Set<string>();

  for (const [key, schema] of Object.entries(schemas)) {
    generateRecursively(toPascalCase(key), schema, outputDir, generatedClasses);
  }
}
