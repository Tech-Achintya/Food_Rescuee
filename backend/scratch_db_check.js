const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'food_rescue',
  });

  try {
    const [rows] = await pool.query('SHOW TABLES');
    console.log('Tables:', rows);
    
    for (const row of rows) {
        const tableName = Object.values(row)[0];
        const [columns] = await pool.query(`DESCRIBE ${tableName}`);
        console.log(`Columns for ${tableName}:`, columns);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
})();
