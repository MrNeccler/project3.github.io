const pool = require('../config/db');

exports.getStats = async (req, res) => {
    const userId = req.userId;
    try {
        const [collectionStats] = await pool.query(
            `SELECT COUNT(*) as totalItems, COALESCE(SUM(price), 0) as totalValue
             FROM collections WHERE user_id = ?`,
            [userId]
        );
        const [wishlistCount] = await pool.query(
            `SELECT COUNT(*) as wishlistCount FROM wishlist WHERE user_id = ? AND acquired = 0`,
            [userId]
        );
        res.json({
            totalItems: collectionStats[0].totalItems,
            totalValue: parseFloat(collectionStats[0].totalValue),
            wishlistCount: wishlistCount[0].wishlistCount
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка получения статистики' });
    }
};

exports.getReportData = async (req, res) => {
    const userId = req.userId;
    const { category } = req.query;
    let query = 'SELECT * FROM collections WHERE user_id = ?';
    const params = [userId];
    if (category) {
        query += ' AND category = ?';
        params.push(category);
    }
    try {
        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка отчёта' });
    }
};