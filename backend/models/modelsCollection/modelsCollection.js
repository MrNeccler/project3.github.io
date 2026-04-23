const pool = require('../config/db');

class Collection {
    static async findByUserId(userId) {
        const [rows] = await pool.query(
            'SELECT * FROM collections WHERE user_id = ? ORDER BY date DESC',
            [userId]
        );
        return rows;
    }

    static async findById(id, userId) {
        const [rows] = await pool.query(
            'SELECT * FROM collections WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        return rows[0];
    }

    static async create(userId, data) {
        const { name, category, date, price, description } = data;
        const [result] = await pool.query(
            `INSERT INTO collections (user_id, name, category, date, price, description)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, name, category || null, date || null, price || 0, description || null]
        );
        return { id: result.insertId, ...data, userId };
    }

    static async update(id, userId, data) {
        const { name, category, date, price, description } = data;
        const [result] = await pool.query(
            `UPDATE collections
             SET name = ?, category = ?, date = ?, price = ?, description = ?
             WHERE id = ? AND user_id = ?`,
            [name, category || null, date || null, price || 0, description || null, id, userId]
        );
        return result.affectedRows > 0;
    }

    static async delete(id, userId) {
        const [result] = await pool.query('DELETE FROM collections WHERE id = ? AND user_id = ?', [id, userId]);
        return result.affectedRows > 0;
    }
}

module.exports = Collection;