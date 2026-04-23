const express = require('express');
const { getAll, create, update, delete: deleteItem } = require('../controllers/collectionController');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);
router.get('/', getAll);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', deleteItem);

module.exports = router;