/**
 * @fileoverview Database Connection Module
 * 
 * This module sets up a connection to the PostgreSQL database using the `pg` library
 * and initializes a connection pool for managing database connections.
 * 
 * @module db-connection
 */
import pg from 'pg';
import { PGUSER, PGDATABASE, PGPASSWORD, PGPORT } from '$env/static/private';

// const PGHOST = fs.readFileSync('/data/IP', 'utf-8').trim();
const PGHOST = "jared-lemma.cvkau8oio5je.us-east-2.rds.amazonaws.com";

/**
 * Creates a Postgres client pool for managing connections to the PostgreSQL database.
 * The pool manages multiple client connections and reuses them to optimize database access.
 *
 * @constant
 * @type {pg.Pool}
 * @property {string} host - The IP address or hostname of the PostgreSQL server.
 * @property {string} user - The username for authentication to the database.
 * @property {string} password - The password used for authentication, decoded from base64.
 * @property {number} port - The port on which the PostgreSQL server is listening.
 * @property {number} connectionTimeoutMillis - The timeout duration (in milliseconds) for establishing a connection to the server.
 * 
 */
export const pool = new pg.Pool({
    host: PGHOST,
    user: PGUSER,
    database: PGDATABASE,
    password: PGPASSWORD,
    port: parseInt(PGPORT),
    ssl: { rejectUnauthorized: false }, // Enables SSL (disables certificate validation in development)
    connectionTimeoutMillis: 5000, // 5 sec timeout
})
