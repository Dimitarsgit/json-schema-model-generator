import { parse } from 'yaml';
import axios from 'axios';

export async function loadOpenApiYamlSchemas(url: string): Promise<any> {
  try {
    const response = await axios.get(url);
    const openApiDoc = parse(response.data);
    return openApiDoc.components?.schemas ?? {};
  } catch (error) {
    console.error(`Error loading YAML from: ${url}`, error);
    throw error;
  }
}
