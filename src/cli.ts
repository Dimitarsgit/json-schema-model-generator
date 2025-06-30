#!/usr/bin/env node

import { loadOpenApiYamlSchemas } from './utils/loadOpenapiYaml';
import { generateFromSchemas } from './index';
import { Command } from 'commander';
import { text, isCancel, cancel, intro, outro } from '@clack/prompts';
import path from 'path';

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
    .option('-o, --output <output>', 'Output directory for generated models');

  program.parse(process.argv);
  let { input, output } = program.opts();

  intro('Model Generator');

  // Prompt for input path if not provided
  if (!input) {
    const inputPrompt = await text({
      message: 'Enter the url for input file:',
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
  const resolvedOutput = path.resolve(process.cwd(), output);

  try {
    // Load sourceExamples depending on file type
    const schemas = await loadOpenApiYamlSchemas(input);
    console.table(schemas);
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
