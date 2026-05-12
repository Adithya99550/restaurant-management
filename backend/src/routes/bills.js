const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const socketMiddleware = require('../middleware/socketMiddleware');
const {
  generateBill,
  payBill,
  getTodayRevenue,
  getAllBills
} = require('../controllers/billController');

router.post('/generate/:orderId', authMiddleware, roleMiddleware('CASHIER', 'ADMIN'), socketMiddleware, generateBill);
router.post('/:id/pay', authMiddleware, roleMiddleware('CASHIER', 'ADMIN'), socketMiddleware, payBill);
router.get('/revenue/today', authMiddleware, roleMiddleware('CASHIER', 'ADMIN'), getTodayRevenue);
router.get('/', authMiddleware, roleMiddleware('CASHIER', 'ADMIN'), getAllBills);

module.exports = router;