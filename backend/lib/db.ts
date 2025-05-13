import mysql from 'mysql2/promise';

const pool = mysql.createPool({
	host: process.env.DB_HOST || 'localhost',
	port: Number(process.env.DB_PORT) || 3306,
	user: process.env.DB_USER || 'root',
	password: process.env.DB_PASSWORD || 'root123456',
	database: process.env.DB_NAME || 'docs_hub',
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0,
	// debug: true,
});

export default pool;
