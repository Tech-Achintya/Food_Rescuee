const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'food_rescue',
  });

  const addColumn = async (sql) => {
    try {
      await pool.query(sql);
      console.log(`✅ Success: ${sql}`);
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log(`ℹ️ Column already exists: ${sql}`);
      } else {
        console.error(`❌ Error executing ${sql}:`, err.message);
      }
    }
  };

  try {
    console.log('Adding missing columns to packages table...');
    await addColumn('ALTER TABLE packages ADD COLUMN accepted_by INT');
    await addColumn('ALTER TABLE packages ADD COLUMN rating INT DEFAULT 0');
    await addColumn('ALTER TABLE packages ADD COLUMN feedback VARCHAR(255)');
    await addColumn('ALTER TABLE packages ADD COLUMN feedback_by INT');
    console.log('✅ Schema update complete!');
  } catch (err) {
    console.error('❌ Critical Error:', err.message);
  } finally {
    await pool.end();
  }
})();
