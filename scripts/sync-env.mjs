import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadEnv } from 'dotenv';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = resolve(rootDir, '.env');
const browserEnvPath = resolve(rootDir, 'src/environments/environment.ts');
const browserProdEnvPath = resolve(rootDir, 'src/environments/environment.prod.ts');

loadEnv({ path: envPath });

const applicationName = process.env.APPLICATION_NAME?.trim() || 'GrayviX';
const quote = (value) => `'${value.replaceAll('\\', '\\\\').replaceAll("'", "\\'")}'`;

const renderEnvironment = (production) => `export const environment = {
  production: ${production},
  apiUrl: ${quote('/api')},
  applicationName: ${quote(applicationName)},
};
`;

writeFileSync(browserEnvPath, renderEnvironment(false));
writeFileSync(browserProdEnvPath, renderEnvironment(true));

console.log(`Synced environment files from ${envPath}`);
