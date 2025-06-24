<!-- Banner -->

<p align="center">
  <img src="https://raw.githubusercontent.com/your-org/jsonschema-ts-models/main/media/banner.png" alt="JSON Schema TS Models" width="600"/>
</p>

# JSON Schema → TypeScript Model Generator 🚀

> **A CLI tool** that transforms JSON Schemas into ready-to-use TypeScript model classes, with support for nested
> schemas, enums, and common formats.

<p align="right"><a href="#table-of-contents">⇨ Table of Contents</a></p>

---

## 📑 Table of Contents

1. [✨ Features](#-features)
2. [🔧 Installation](#-installation)
3. [🚀 Usage](#-usage)

    * [⚙️ Options](#️-options)
4. [📦 Example](#-example)
5. [🛠️ Programmatic API](#️-programmatic-api)
6. [👩‍💻 Development](#-development)
7. [🤝 Contributing](#-contributing)
8. [📄 License](#-license)

---

## ✨ Features

* 🔹 **One file per schema**: Generates a `.ts` file named after each PascalCase key.
* 🔹 **Schema‑engine integration**: Imports `Model<TDto>` plus field classes (`Field`, `Enum`, `Boolean`, `Array`, etc.).
* 🔹 **Nested schemas**: Recursively outputs nested models with relative imports.
* 🔹 **Format & enum support**: Detects `format`-based types (e.g. `date-time`), enums, booleans, strings, objects, and
  arrays.
* 🔹 **Validation warnings**: Logs clear warnings for unsupported property types.

<p align="right"><a href="#table-of-contents">⬆️ Back to top</a></p>

---

## 🔧 Installation

```bash
# Clone the repository
git clone https://github.com/your-org/jsonschema-ts-models.git
cd jsonschema-ts-models

# Install dependencies
npm install
# or
yarn install
```

<p align="right"><a href="#table-of-contents">⬆️ Back to top</a></p>

---

## 🚀 Usage

```bash
# Run via npx (if published on npm)
npx jsonschema-ts-models \
  --input path/to/schemaMap.json \
  --output src/models

# Or using the provided npm script
yarn run generate
# or
npm run generate

# Or from source build:
npm run build
node dist/cli.js \
  --input ./src/schemas/schemaMap.json \
  --output ./src/models
```

### ⚙️ Options

| Flag                   | Description                               | Default                        |
|------------------------|-------------------------------------------|--------------------------------|
| `-i`, `--input <path>` | Path to the JSON schema map file          | `./src/schemas/schemaMap.json` |
| `-o`, `--output <dir>` | Directory for generated model `.ts` files | `./src/models`                 |

<p align="right"><a href="#table-of-contents">⬆️ Back to top</a></p>

---

## 📦 Example

**schemaMap.json**

```json
{
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
```

Generates:

* 🗂️ `src/models/User.ts`
* 🗂️ `src/models/Roles.ts`
* 🗂️ `src/models/Settings.ts`

Each class extends `Model<YourDto>` with type-safe accessors.

<p align="right"><a href="#table-of-contents">⬆️ Back to top</a></p>

---

## 🛠️ Programmatic API

```ts
import path from 'path';
import { generateFromSchemas } from 'jsonschema-ts-models';
import { readFileSync } from 'fs';

const schemas = JSON.parse(readFileSync('schemaMap.json', 'utf-8'));

generateFromSchemas(
  schemas,
  path.resolve(__dirname, 'src/models')
);
```

<p align="right"><a href="#table-of-contents">⬆️ Back to top</a></p>

---

## 👩‍💻 Development

* **Lint**: `npm run lint`
* **Build**: `npm run build`
* **Test**: `npm test`

<p align="right"><a href="#table-of-contents">⬆️ Back to top</a></p>

---

## 🤝 Contributing

Contributions welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md).

1. Fork it
2. Create your feature branch (`git checkout -b feat/my-feature`)
3. Commit your changes (`git commit -m 'Add feature'`)
4. Push to the branch (`git push origin feat/my-feature`)
5. Open a Pull Request

<p align="right"><a href="#table-of-contents">⬆️ Back to top</a></p>

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.