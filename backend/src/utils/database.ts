import { Sequelize } from 'sequelize';
import env from './env.ts';

const url = env.DATABASE_URL;
if (url.startsWith('postgres') || url.startsWith('postgresql')) {
  throw new Error(
    'DATABASE_URL must be a MySQL URL (mysql://...). This project uses MySQL only. ' +
      'Update your .env file.'
  );
}

/**
 * Database configuration and connection setup
 * Uses Sequelize ORM with MySQL
 */
const sequelize = new Sequelize(url, {
  dialect: 'mysql',
  logging: env.APP_ENV === 'dev' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  },
});

/**
 * Test database connection
 * @returns Promise<boolean> - true if connection successful
 */
export const testConnection = async (): Promise<boolean> => {
  try {
    await sequelize.authenticate();
    console.log('MySQL database connection established successfully.');
    return true;
  } catch (error) {
    console.error('Unable to connect to the MySQL database:', error);
    return false;
  }
};

/**
 * Close database connection
 * @returns Promise<void>
 */
export const closeConnection = async (): Promise<void> => {
  try {
    await sequelize.close();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
};

export default sequelize;
