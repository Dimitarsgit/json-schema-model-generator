# JSON Schema / OpenAPI YAML → TypeScript Model Generator 🚀

> **Model Generator** is a CLI tool that transforms JSON Schema or OpenAPI YAML files into ready-to-use TypeScript model
> classes, with support for nested
> schemas, enums, and common formats.

---

## 📁 Table of Contents

1. [✨ Features](#-features)
2. [🔧 Installation](#-installation)
3. [🚀 Usage](#-usage)
   - [⚙️ Options](#%ef%b8%8f-options)

4. [📦 Example](#-example)
5. [🛠️ Programmatic API](#%ef%b8%8f-programmatic-api)
6. [👩‍💻 Development](#-development)
7. [🤝 Contributing](#-contributing)
8. [📄 License](#-license)

---

## ✨ Features

- 🔹 **YAML or JSON input**: Supports OpenAPI YAML and JSON Schema files following the OpenAPI 3.1 standard.
- 🔹 **One file per schema**: Generates a `.ts` file named after each PascalCase key.
- 🔹 **Schema‑engine integration**: Imports `Model<TDto>` plus field classes (`Field`, `Enum`, `Boolean`, `Array`, etc.).
- 🔹 **Nested schemas**: Recursively outputs nested models with relative imports.
- 🔹 **Format & enum support**: Detects `format`-based types (e.g. `date-time`), enums, booleans, strings, objects, and
  arrays.
- 🔹 **Validation warnings**: Logs clear warnings for unsupported property types.

---

## 🔧 Installation

```bash
# Clone the repository
git clone https://github.com/your-org/model-generator.git
cd model-generator

# Install dependencies
npm install
# or
yarn install
```

---

## 🚀 Usage

The `model-generator` CLI transforms OpenAPI YAML or JSON Schema (OpenAPI 3.1-compliant) files into organized TypeScript
model classes. It supports interactive prompts when arguments are omitted, and resolves paths relative to the current
working directory.

```bash
# Run via npx (if published on npm)
npx model-generator \
  --input path/to/schema.yaml \
  --output src/models \
  --type yaml

# Or using the provided npm script
yarn run generate
# or
npm run generate

# Or from source build:
npm run build
npx model-generator \
  --input ./src/sourceExamples/schemaMap.json \
  --output ./src/models \
  --type json
```

### ⚙️ Options

| Flag                   | Description                               | Default                        |
| ---------------------- | ----------------------------------------- | ------------------------------ |
| `-i`, `--input <path>` | Path to the input file (YAML or JSON)     | `./src/schemas/schemaMap.json` |
| `-o`, `--output <dir>` | Directory for generated model `.ts` files | `./src/models`                 |
| `-t`, `--type <type>`  | Type of input file: `yaml` or `json`      | Prompted if omitted            |

---

## 📦 Example

**schemaMap.json** (following OpenAPI 3.1 structure)

```json
{
  "openapi": "3.1.0",
  "components": {
    "schemas": {
      "user": {
        "properties": {
          "id": {
            "type": "string",
            "format": "uuid"
          },
          "name": {
            "type": "string"
          },
          "roles": {
            "type": "array",
            "items": {
              "type": "string",
              "enum": [
                "admin",
                "user",
                "guest"
              ]
            }
          },
          "settings": {
            "type": "object",
            "properties": {
              "theme": {
                "type": "string",
                "enum": [
                  "light",
                  "dark"
                ]
              },
              "notifications": {
                "type": "boolean"
              }
            }
          }
        }
      }
    }
  }
```

Generates:

- 📂 `src/models/User.ts`
- 📂 `src/models/Roles.ts`
- 📂 `src/models/Settings.ts`

Each class extends `SchemaAwareModel<YourDto>` with type-safe accessors.

---

### 🧩 Sample Output (`User.ts`)

```ts
import { SchemaAwareModel, SchemaAwareField, SchemaAwareArray } from 'schema-engine';
import { Settings } from './Settings';
import { Roles } from './Roles';
import { UserDto } from 'api';

export class User extends SchemaAwareModel<UserDto> {
  get id(): SchemaAwareField {
    return this.getProperty('id');
  }

  get name(): SchemaAwareField {
    return this.getProperty('name');
  }

  get roles(): SchemaAwareArray<Roles> {
    return this.getProperty('roles', Roles);
  }

  get settings(): Settings {
    return this.getProperty('settings', Settings);
  }
}
```

---

## 🛠️ Programmatic API

```ts
import path from 'path';
import { generateFromSchemas } from 'model-generator';
import { readFileSync } from 'fs';

const schemas = JSON.parse(readFileSync('schemaMap.json', 'utf-8'));

generateFromSchemas(schemas, path.resolve(__dirname, 'src/models'));
```

---

## 👩‍💻 Development

- **Build**: `npm run build`
- **Generate**: `npm run generate`
- **Format**: `npm run prettify`

---

## 🤝 Contributing

Contributions welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md).

1. Fork it
2. Create your feature branch (`git checkout -b feat/my-feature`)
3. Commit your changes (`git commit -m 'Add feature'`)
4. Push to the branch (`git push origin feat/my-feature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.
