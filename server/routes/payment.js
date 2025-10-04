const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Public route - Get Razorpay key
router.get('/key', paymentController.getRazorpayKey);

// Create orders
router.post('/order/course', authMiddleware, paymentController.createCourseOrder);
router.post('/order/content', authMiddleware, paymentController.createContentOrder);
router.post('/order/subscription', authMiddleware, paymentController.createSubscriptionOrder);

// Verify payment
router.post('/verify', authMiddleware, paymentController.verifyPayment);

// Get user's payment history
router.get('/history', authMiddleware, paymentController.getPaymentHistory);

// Get specific payment
router.get('/:paymentId', authMiddleware, paymentController.getPaymentById);

// Admin routes
router.get('/admin/all', authMiddleware, roleMiddleware(['admin']), paymentController.getAllPayments);

module.exports = router;
