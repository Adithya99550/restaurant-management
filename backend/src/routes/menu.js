const express = require('express');
const router = express.Router();
const { getAllMenuItems, getMenuByCategory, createMenuItem, updateMenuItem, deleteMenuItem } = require('../controllers/menuController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', getAllMenuItems);
router.get('/category/:category', getMenuByCategory);
router.post('/', authMiddleware, roleMiddleware('ADMIN'), createMenuItem);
router.put('/:id', authMiddleware, roleMiddleware('ADMIN'), updateMenuItem);
router.delete('/:id', authMiddleware, roleMiddleware('ADMIN'), deleteMenuItem);

module.exports = router;