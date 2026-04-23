const express = require('express');
const { getAll, getOne, create, update, delete: deleteItem } = require('../controllers/wishlistController');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);
router.get('/', getAll);
router.get('/:id', getOne);      // <-- добавлено для получения одного элемента
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', deleteItem);

module.exports = router;