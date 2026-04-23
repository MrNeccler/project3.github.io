const Wishlist = require('../models/Wishlist');

exports.getAll = async (req, res) => {
    try {
        const items = await Wishlist.findByUserId(req.userId, false);
        res.json(items);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка получения вишлиста' });
    }
};

exports.getOne = async (req, res) => {
    const { id } = req.params;
    try {
        const item = await Wishlist.findById(parseInt(id), req.userId);
        if (!item) {
            return res.status(404).json({ error: 'Запись не найдена' });
        }
        res.json(item);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка получения записи' });
    }
};

exports.create = async (req, res) => {
    try {
        const newItem = await Wishlist.create(req.userId, req.body);
        res.status(201).json(newItem);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка создания' });
    }
};

exports.update = async (req, res) => {
    const { id } = req.params;
    try {
        const success = await Wishlist.update(parseInt(id), req.userId, req.body);
        if (!success) return res.status(404).json({ error: 'Запись не найдена' });
        res.json({ message: 'Обновлено' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка обновления' });
    }
};

exports.delete = async (req, res) => {
    const { id } = req.params;
    try {
        const success = await Wishlist.delete(parseInt(id), req.userId);
        if (!success) return res.status(404).json({ error: 'Запись не найдена' });
        res.json({ message: 'Удалено' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка удаления' });
    }
};