const Collection = require('../models/Collection');

exports.getAll = async (req, res) => {
    try {
        const items = await Collection.findByUserId(req.userId);
        res.json(items);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка получения коллекции' });
    }
};

exports.create = async (req, res) => {
    try {
        const newItem = await Collection.create(req.userId, req.body);
        res.status(201).json(newItem);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка создания предмета' });
    }
};

exports.update = async (req, res) => {
    const { id } = req.params;
    try {
        const success = await Collection.update(parseInt(id), req.userId, req.body);
        if (!success) return res.status(404).json({ error: 'Предмет не найден' });
        res.json({ message: 'Обновлено' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка обновления' });
    }
};

exports.delete = async (req, res) => {
    const { id } = req.params;
    try {
        const success = await Collection.delete(parseInt(id), req.userId);
        if (!success) return res.status(404).json({ error: 'Предмет не найден' });
        res.json({ message: 'Удалено' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка удаления' });
    }
};