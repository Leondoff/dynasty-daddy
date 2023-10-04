import dotenv from 'dotenv';

require('events').EventEmitter.defaultMaxListeners = 15;

dotenv.config();
export const connectionString = process.env.DATABASE_URL || process.env.CONNECTION_STRING;

export const DB_USER = process.env.DO_DB_USER;
export const DB_PWD = process.env.DO_DB_PASSWORD;
export const DB_HOST = process.env.DO_DB_HOST;
export const DB_DB = process.env.DO_DATABASE;
export const DB_PORT = process.env.DO_DB_PORT;
export const patreonClientSecret = process.env.PATREON_CLIENT_SECRET;
export const patreonClientId = process.env.PATREON_CLIENT_ID;
export const patreonRedirectUri = 'https://dynasty-daddy.com/';

// local values to database
// export const DB_USER = 'postgres';
// export const DB_PWD = 'postgres';
// export const DB_HOST = 'localhost';
// export const DB_DB = 'dynasty_daddy';
// export const DB_PORT = 5432;
// export const patreonClientSecret = '';
// export const patreonClientId = '';
// export const patreonRedirectUri = 'http://localhost:4200/';
