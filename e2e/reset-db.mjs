import { readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendDir = path.resolve(__dirname, '../backend');

process.chdir(backendDir);
process.loadEnvFile(path.join(backendDir, '.env'));

const { default: connectDB, sequelize } = await import('../backend/src/config/db.js');

const modelFiles = readdirSync(path.join(backendDir, 'src/models'))
  .filter((f) => f.endsWith('.js') && !f.startsWith('associations'))
  .sort();

for (const file of modelFiles) {
  await import(`../backend/src/models/${file}`);
}
await import('../backend/src/models/associations.js');

await connectDB();
await sequelize.sync({ force: true });
await sequelize.close();

console.log('Database schema recreated (force sync).');