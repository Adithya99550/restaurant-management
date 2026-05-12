const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const socketMiddleware = require('../middleware/socketMiddleware');
const {
  createOrder,
  getOrdersByTable,
  getActiveOrders,
  updateOrderStatus,
  addOrderItems,
  updateOrderItem,
  deleteOrderItem
} = require('../controllers/orderController');

router.post('/', authMiddleware, roleMiddleware('WAITER', 'ADMIN'), socketMiddleware, createOrder);
router.get('/table/:tableId', authMiddleware, getOrdersByTable);
router.get('/active', authMiddleware, roleMiddleware('KITCHEN', 'CASHIER', 'WAITER'), getActiveOrders);
router.patch('/:id/status', authMiddleware, roleMiddleware('WAITER', 'KITCHEN', 'ADMIN'), socketMiddleware, updateOrderStatus);
router.post('/:id/items', authMiddleware, roleMiddleware('WAITER', 'ADMIN'), socketMiddleware, addOrderItems);
router.patch('/:id/items/:itemId', authMiddleware, roleMiddleware('WAITER', 'KITCHEN', 'ADMIN'), socketMiddleware, updateOrderItem);
router.delete('/:id/items/:itemId', authMiddleware, roleMiddleware('WAITER', 'ADMIN'), socketMiddleware, deleteOrderItem);

module.exports = router;