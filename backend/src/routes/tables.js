const express = require('express');
const router = express.Router();
const { getAllTables, getTable, updateTableStatus } = require('../controllers/tableController');
const authMiddleware = require('../middleware/authMiddleware');
const socketMiddleware = require('../middleware/socketMiddleware');

router.get('/', authMiddleware, getAllTables);
router.get('/:id', authMiddleware, getTable);
router.patch('/:id/status', authMiddleware, socketMiddleware, updateTableStatus);

module.exports = router;