import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectionLimit: 1
});

async function main() {
  const targetCount = 20;
  const clubId = 1;

  const [existing] = await pool.query(
    'SELECT COUNT(*) AS count FROM memberships WHERE club_id = ? AND status = ?',
    [clubId, 'ACTIVE']
  );
  const currentCount = existing[0]?.count || 0;
  console.log('Current Photography Club active members:', currentCount);
  if (currentCount >= targetCount) {
    console.log('No changes needed.');
    return;
  }

  const needed = targetCount - currentCount;
  const newUsers = Array.from({ length: needed }, (_, index) => ({
    full_name: `Photography Member ${index + 1}`,
    email: `photomember${index + 1}@college.ca`,
    password_hash: 'password123',
    role: 'STUDENT',
    status: 'ACTIVE'
  }));

  const values = newUsers.map((user) => [user.full_name, user.email, user.password_hash, user.role, user.status]);
  const [insertResult] = await pool.query(
    'INSERT INTO users (full_name, email, password_hash, role, status) VALUES ?',
    [values]
  );
  console.log('Inserted users:', insertResult.affectedRows);

  const [userRows] = await pool.query(
    'SELECT user_id FROM users WHERE email LIKE ? ORDER BY user_id',
    ['photomember%@college.ca']
  );
  const userIds = userRows.map((row) => row.user_id);

  const membershipValues = userIds.map((userId) => [userId, clubId, 'ACTIVE']);
  const [membershipResult] = await pool.query(
    'INSERT INTO memberships (user_id, club_id, status) VALUES ?',
    [membershipValues]
  );
  console.log('Inserted memberships:', membershipResult.affectedRows);

  const [finalCountRows] = await pool.query(
    'SELECT COUNT(*) AS count FROM memberships WHERE club_id = ? AND status = ?',
    [clubId, 'ACTIVE']
  );
  console.log('Final Photography Club active members:', finalCountRows[0]?.count || 0);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
