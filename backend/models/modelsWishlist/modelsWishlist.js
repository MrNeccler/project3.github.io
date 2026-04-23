const pool = require('../config/db');

class Wishlist {
    static async findByUserId(userId, acquired = false) {
        const [rows] = await pool.query(
            'SELECT * FROM wishlist WHERE user_id = ? AND acquired = ? ORDER BY created_at DESC',
            [userId, acquired]
        );
        return rows;
    }

    static async findById(id, userId) {
        const [rows] = await pool.query(
            'SELECT * FROM wishlist WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        return rows[0];
    }

    static async create(userId, data) {
        const { name, category, desired_price, priority } = data;
        const [result] = await pool.query(
            `INSERT INTO wishlist (user_id, name, category, desired_price, priority)
             VALUES (?, ?, ?, ?, ?)`,
            [userId, name, category || null, desired_price || 0, priority || 'Средний']
        );
        return { id: result.insertId, ...data, userId, acquired: false };
    }

    static async update(id, userId, data) {
        const { name, category, desired_price, priority, acquired } = data;
        const [result] = await pool.query(
            `UPDATE wishlist
             SET name = ?, category = ?, desired_price = ?, priority = ?, acquired = ?
             WHERE id = ? AND user_id = ?`,
            [name, category || null, desired_price || 0, priority || 'Средний', acquired || false, id, userId]
        );
        return result.affectedRows > 0;
    }

    static async delete(id, userId) {
        const [result] = await pool.query('DELETE FROM wishlist WHERE id = ? AND user_id = ?', [id, userId]);
        return result.affectedRows > 0;
    }
}

module.exports = Wishlist;