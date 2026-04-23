const pool = require('../config/db');
const bcrypt = require('bcrypt');

class User {
    static async findByEmail(email) {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    }

    static async create({ email, password, name }) {
        const hashed = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
            'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
            [email, hashed, name]
        );
        return { id: result.insertId, email, name };
    }

    static async comparePassword(plain, hashed) {
        return bcrypt.compare(plain, hashed);
    }
}

module.exports = User;