import * as fs from 'fs';
import * as path from 'path';
import { FIELD_CLASSES, FIELD_TYPES, FORMAT_TO_FIELD } from './constants';
import { OpenApiSchema } from './types';
import { generateFieldAccessor, getFieldType, toPascalCase, hasType } from './utils';

/**
 * Generates a TypeScript model class from a schema.
 * Adds imports for nested models automatically.
 *
 * @param className - Name of the model class to generate.
 * @param schema - Schema object.
 * @returns Object containing the generated code string and any nested sourceExamples found.
 */
function generateModel(
  className: string,
  schema: OpenApiSchema
): { code: string; nestedSchemas: [string, OpenApiSchema][] } {
  const dtoType = `${className}WebDto`;
  const objectSchema = schema.parameters || schema;
  const nestedSchemas: [string, OpenApiSchema][] = [];
  const lines: string[] = [`import { ${dtoType} } from 'api';`];

  const usedSchemaEngineTypes = new Set<string>();
  usedSchemaEngineTypes.add(FIELD_CLASSES.MODEL);

  const nestedModelImports = new Set<string>();

  lines.push('');
  lines.push(`export class ${className} extends ${FIELD_CLASSES.MODEL}<${dtoType}> {`);

  if (!objectSchema.properties) {
    lines.push(`}`);
    const importLine = `import { ${[...usedSchemaEngineTypes].join(', ')} } from 'schema-engine';`;
    lines.unshift(importLine);
    return { code: lines.join('\n'), nestedSchemas };
  }

  for (const [propName, propSchema] of Object.entries(objectSchema.properties) as [
    string,
    OpenApiSchema,
  ][]) {
    const propType = propSchema.type;

    const isString = hasType(propType, FIELD_TYPES.STRING);
    const isInteger = hasType(propType, FIELD_TYPES.INTEGER);
    const isNumber = hasType(propType, FIELD_TYPES.NUMBER);
    const isBoolean = hasType(propType, FIELD_TYPES.BOOLEAN);
    const isObject = hasType(propType, FIELD_TYPES.OBJECT);
    const isArray = hasType(propType, FIELD_TYPES.ARRAY);
    const isEnum = Boolean(propSchema?.enum);

    let fieldClassType: string;

    if (isString || isNumber || isInteger) {
      fieldClassType = isEnum
        ? FIELD_CLASSES.ENUM
        : FORMAT_TO_FIELD[propSchema.format ?? ''] || FIELD_CLASSES.FIELD;

      lines.push(
        ...generateFieldAccessor(
          propName,
          getFieldType({
            format: propSchema.format,
            isString,
            isEnum,
            propName,
            genericType: dtoType,
          })
        )
      );
    } else if (isBoolean) {
      fieldClassType = FIELD_CLASSES.BOOLEAN;
      lines.push(...generateFieldAccessor(propName, getFieldType({ isBoolean })));
    } else if (isObject && propSchema.properties) {
      fieldClassType = FIELD_CLASSES.FIELD;
      const nestedClassName = toPascalCase(propName);
      nestedSchemas.push([nestedClassName, propSchema]);
      lines.push(...generateFieldAccessor(propName, nestedClassName, nestedClassName));
      nestedModelImports.add(nestedClassName);
    } else if (isArray && propSchema.items) {
      fieldClassType = FIELD_CLASSES.ARRAY;
      const itemSchema = propSchema.items;
      const itemClassName = toPascalCase(propName).slice(0, -1);
      nestedSchemas.push([itemClassName, itemSchema]);
      lines.push(
        ...generateFieldAccessor(
          propName,
          getFieldType({ isArray, genericType: itemClassName }),
          itemClassName
        )
      );
      nestedModelImports.add(itemClassName);
    } else {
      fieldClassType = FIELD_CLASSES.FIELD;
      console.warn(
        `Warning: Unknown or unsupported property type for "${propName}". Full schema:`,
        JSON.stringify(propSchema, null, 2)
      );
      lines.push(...generateFieldAccessor(propName, getFieldType({})));
    }

    usedSchemaEngineTypes.add(fieldClassType);
  }

  lines.push(`}`);

  // Add imports for nested models (relative imports)
  for (const importName of nestedModelImports) {
    lines.unshift(`import { ${importName} } from './${importName}';`);
  }

  const importLine = `import { ${[...usedSchemaEngineTypes].join(', ')} } from 'schema-engine';`;
  lines.unshift(importLine);

  return { code: lines.join('\n'), nestedSchemas };
}

/**
 * Recursively generates model files from sourceExamples.
 *
 * @param className - The current model class name.
 * @param schema - schema for the current model.
 * @param outputDir - Directory to write generated files.
 * @param generatedClasses - Set of already generated class names to avoid duplicates.
 */
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
