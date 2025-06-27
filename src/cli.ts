#!/usr/bin/env node

import { loadOpenApiYamlSchemas } from './utils/loadOpenapiYaml';
import { generateFromSchemas } from './index';
import { Command } from 'commander';
import { text, select, isCancel, cancel, intro, outro } from '@clack/prompts';
import fs from 'fs';
import path from 'path';
import { loadJsonSchema } from './utils/loadJsonSchema';

/**
 * Entry point for the CLI tool.
 * Parses options, prompts the user if necessary, validates paths,
 * and triggers model generation.
 */
async function runCli() {
  const program = new Command();

  // Define CLI options
  program
    .option('-i, --input <input>', 'Input file path')
    .option('-o, --output <output>', 'Output directory for generated models')
    .option('-t, --type <type>', 'Type of input file: yaml or json');

  program.parse(process.argv);
  let { input, output, type } = program.opts();

  intro('OpenAPI / JSON Schema to Models');

  // Validate --type if provided
  if (type && !['yaml', 'json'].includes(type)) {
    console.error('❌ Invalid type specified. Use "yaml" or "json".');
    process.exit(1);
  }

  // Prompt for file type if not provided
  let fileType = type;
  if (!fileType) {
    fileType = await select({
      message: 'What type of input file are you using?',
      options: [
        { value: 'yaml', label: 'OpenAPI YAML' },
        { value: 'json', label: 'JSON Schema' },
      ],
    });

    if (isCancel(fileType)) {
      cancel('Operation cancelled.');
      process.exit(0);
    }
  }

  // Prompt for input path if not provided
  if (!input) {
    const inputPrompt = await text({
      message: 'Enter the input file path:',
      placeholder: fileType === 'yaml' ? './openapi.yaml' : './schema.json',
    });
    if (isCancel(inputPrompt)) {
      cancel('Operation cancelled.');
      process.exit(0);
    }
    input = inputPrompt;
  }

  // Prompt for output path if not provided
  if (!output) {
    const outputPrompt = await text({
      message: 'Enter the output directory for generated models:',
      placeholder: './src/models',
      initialValue: './src/models',
    });
    if (isCancel(outputPrompt)) {
      cancel('Operation cancelled.');
      process.exit(0);
    }
    output = outputPrompt;
  }

  // Resolve paths relative to where the command is run
  const resolvedInput = path.resolve(process.cwd(), input);
  const resolvedOutput = path.resolve(process.cwd(), output);

  // Validate input file existence and extension
  if (!fs.existsSync(resolvedInput) || !fs.statSync(resolvedInput).isFile()) {
    console.error(`❌ Input file not found or not a valid file: ${resolvedInput}`);
    process.exit(1);
  }

  const ext = path.extname(resolvedInput).toLowerCase();
  if (fileType === 'yaml' && !['.yaml', '.yml'].includes(ext)) {
    console.error('❌ Expected a YAML file with .yaml or .yml extension.');
    process.exit(1);
  }
  if (fileType === 'json' && ext !== '.json') {
    console.error('❌ Expected a JSON file with .json extension.');
    process.exit(1);
  }

  try {
    // Load sourceExamples depending on file type
    const schemas =
      fileType === 'yaml' ? loadOpenApiYamlSchemas(resolvedInput) : loadJsonSchema(resolvedInput);

    // Generate TypeScript models
    generateFromSchemas(schemas, resolvedOutput);

    outro('✅ Models generated successfully.');
  } catch (error) {
    console.error('❌ Error reading input or generating models:', error);
    process.exit(1);
  }
}

// Execute the CLI only if this script is run directly
if (require.main === module) {
  runCli();
}
