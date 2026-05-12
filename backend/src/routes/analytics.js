const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/sales-overview', authMiddleware, roleMiddleware('ADMIN', 'CASHIER'), analyticsController.getSalesOverview);
router.get('/sales-by-period', authMiddleware, roleMiddleware('ADMIN', 'CASHIER'), analyticsController.getSalesByPeriod);
router.get('/popular-items', authMiddleware, roleMiddleware('ADMIN'), analyticsController.getPopularItems);
router.get('/waiter-performance', authMiddleware, roleMiddleware('ADMIN'), analyticsController.getWaiterPerformance);
router.get('/table-utilization', authMiddleware, roleMiddleware('ADMIN'), analyticsController.getTableUtilization);
router.get('/category-breakdown', authMiddleware, roleMiddleware('ADMIN'), analyticsController.getCategoryBreakdown);

module.exports = router;