import { Sequelize } from 'sequelize';

const dbUrl = process.env.DATABASE_URL || 'postgres://postgres:postgres@127.0.0.1:5432/innovative_dating';

const sequelize = new Sequelize(dbUrl, {
  dialect: 'postgres',
  logging: false,
  pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
});

let dbReady = false;

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL Connected');
    await sequelize.sync({ alter: true });
    console.log('Database synced');
    dbReady = true;
  } catch (error) {
    console.error(`Database error: ${error.message}`);
    throw error;
  }
};

export const isDBReady = () => dbReady;

export { sequelize };
export default connectDB;
