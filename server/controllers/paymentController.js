const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const User = require('../models/User');
const Course = require('../models/Course');
const Content = require('../models/Content');

// Initialize Razorpay
let razorpay;
try {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.warn('WARNING: Razorpay credentials not found in environment variables');
    console.warn('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? 'Set' : 'Not set');
    console.warn('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? 'Set' : 'Not set');
  }

  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'test_key',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'test_secret'
  });
} catch (error) {
  console.error('Failed to initialize Razorpay:', error);
}

// Create order for course purchase
exports.createCourseOrder = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id || req.user._id;

    console.log('Create course order - User:', userId, 'Course:', courseId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required'
      });
    }

    // Find course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if course is paid
    if (course.pricing.type === 'free') {
      return res.status(400).json({
        success: false,
        message: 'This course is free'
      });
    }

    // Calculate amount (use discount price if available)
    const amount = course.pricing.discountPrice || course.pricing.amount;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course price'
      });
    }

    // Create Razorpay order
    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: course.pricing.currency || 'INR',
      receipt: `course_${courseId}_${Date.now()}`,
      notes: {
        courseId: courseId,
        userId: userId,
        type: 'course'
      }
    };

    console.log('Creating Razorpay order with options:', options);

    // Check if Razorpay is properly initialized
    if (!razorpay) {
      throw new Error('Razorpay is not initialized. Please check your environment variables.');
    }

    // Development mode - skip actual Razorpay API call if credentials are not set
    const isDevelopmentMode = !process.env.RAZORPAY_KEY_ID ||
                              process.env.RAZORPAY_KEY_ID === 'your_razorpay_key_id_here' ||
                              process.env.RAZORPAY_KEY_ID === 'rzp_test_1234567890';

    let razorpayOrder;

    if (isDevelopmentMode) {
      console.warn('🔧 DEVELOPMENT MODE: Using mock payment (Razorpay not configured)');
      // Create a mock order for development
      razorpayOrder = {
        id: `order_mock_${Date.now()}`,
        amount: options.amount,
        currency: options.currency,
        receipt: options.receipt
      };
    } else {
      razorpayOrder = await razorpay.orders.create(options);
    }

    console.log('Razorpay order created:', razorpayOrder.id);

    // Create payment record
    const payment = new Payment({
      user: userId,
      type: 'course',
      relatedItem: {
        itemType: 'Course',
        itemId: courseId
      },
      amount: amount,
      currency: options.currency,
      razorpay: {
        orderId: razorpayOrder.id
      },
      status: 'pending'
    });

    await payment.save();

    console.log('Payment record created:', payment._id);

    res.status(201).json({
      success: true,
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        paymentId: payment._id
      },
      course: {
        id: course._id,
        title: course.title,
        amount: amount
      }
    });
  } catch (error) {
    console.error('Create course order error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};

// Create order for content purchase
exports.createContentOrder = async (req, res) => {
  try {
    const { contentId } = req.body;
    const userId = req.user.id || req.user._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!contentId) {
      return res.status(400).json({
        success: false,
        message: 'Content ID is required'
      });
    }

    // Find content
    const content = await Content.findById(contentId);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Check if content is premium
    if (!content.isPremium || content.price === 0) {
      return res.status(400).json({ message: 'This content is free' });
    }

    // Create Razorpay order
    const options = {
      amount: content.price * 100,
      currency: 'INR',
      receipt: `content_${contentId}_${Date.now()}`,
      notes: {
        contentId: contentId.toString(),
        userId: userId.toString(),
        type: 'content'
      }
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Create payment record
    const payment = new Payment({
      user: userId,
      type: 'content',
      relatedItem: {
        itemType: 'Content',
        itemId: contentId
      },
      amount: content.price,
      currency: 'INR',
      razorpay: {
        orderId: razorpayOrder.id
      },
      status: 'pending'
    });

    await payment.save();

    res.status(201).json({
      success: true,
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        paymentId: payment._id
      },
      content: {
        id: content._id,
        title: content.title,
        amount: content.price
      }
    });
  } catch (error) {
    console.error('Create content order error:', error);
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
};

// Create order for subscription
exports.createSubscriptionOrder = async (req, res) => {
  try {
    const { plan, duration } = req.body; // plan: 'premium', duration: 'monthly' or 'yearly'
    const userId = req.user.id || req.user._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Define subscription prices
    const subscriptionPrices = {
      premium: {
        monthly: 299,
        yearly: 2999
      }
    };

    const amount = subscriptionPrices[plan]?.[duration];
    if (!amount) {
      return res.status(400).json({ message: 'Invalid subscription plan or duration' });
    }

    // Create Razorpay order
    const options = {
      amount: amount * 100,
      currency: 'INR',
      receipt: `subscription_${plan}_${duration}_${Date.now()}`,
      notes: {
        userId: userId.toString(),
        plan,
        duration,
        type: 'subscription'
      }
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Create payment record
    const payment = new Payment({
      user: userId,
      type: 'subscription',
      relatedItem: {
        itemType: 'Subscription',
        itemId: null
      },
      amount: amount,
      currency: 'INR',
      razorpay: {
        orderId: razorpayOrder.id
      },
      status: 'pending',
      metadata: {
        plan,
        duration
      }
    });

    await payment.save();

    res.status(201).json({
      success: true,
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        paymentId: payment._id
      },
      subscription: {
        plan,
        duration,
        amount
      }
    });
  } catch (error) {
    console.error('Create subscription order error:', error);
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
};

// Verify payment
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId } = req.body;
    const userId = req.user.id || req.user._id;

    // Find payment record
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    // Verify signature
    const isDevelopmentMode = !process.env.RAZORPAY_KEY_SECRET ||
                              process.env.RAZORPAY_KEY_SECRET === 'your_test_secret_key_here' ||
                              razorpay_order_id.startsWith('order_mock_');

    if (!isDevelopmentMode) {
      const sign = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSign = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(sign)
        .digest('hex');

      if (razorpay_signature !== expectedSign) {
        await payment.markAsFailed();
        return res.status(400).json({
          success: false,
          message: 'Invalid payment signature'
        });
      }
    } else {
      console.warn('🔧 DEVELOPMENT MODE: Skipping signature verification');
    }

    // Mark payment as completed
    await payment.markAsCompleted(razorpay_payment_id, razorpay_signature);

    // Handle post-payment actions based on payment type
    const user = await User.findById(payment.user);

    if (payment.type === 'subscription') {
      // Update user subscription
      const duration = payment.metadata.duration;
      const endDate = new Date();

      if (duration === 'monthly') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else if (duration === 'yearly') {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      user.subscription = {
        type: 'premium',
        status: 'active',
        startDate: new Date(),
        endDate: endDate,
        autoRenew: false
      };
      await user.save();
    } else if (payment.type === 'course') {
      // Enroll user in course
      const courseId = payment.relatedItem.itemId;

      // Check if already enrolled
      const alreadyEnrolled = user.activities.completedCourses.some(
        c => c.courseId.toString() === courseId.toString()
      );

      if (!alreadyEnrolled) {
        // Add to user's enrolled courses (you might want a separate enrollments collection)
        // For now, we'll just mark it as accessible
        await Course.findByIdAndUpdate(courseId, {
          $inc: { 'metrics.enrollmentCount': 1 }
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      payment: {
        id: payment._id,
        type: payment.type,
        amount: payment.amount,
        status: payment.status
      }
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Failed to verify payment', error: error.message });
  }
};

// Get user's payment history
exports.getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { status, type, limit = 20, page = 1 } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (type) filters.type = type;

    const payments = await Payment.findUserPayments(userId, filters)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Payment.countDocuments({ user: userId, ...filters });

    res.status(200).json({
      success: true,
      payments,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ message: 'Failed to fetch payment history', error: error.message });
  }
};

// Get payment by ID
exports.getPaymentById = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user.id || req.user._id;

    const payment = await Payment.findOne({ _id: paymentId, user: userId })
      .populate('relatedItem.itemId');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.status(200).json({
      success: true,
      payment
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ message: 'Failed to fetch payment', error: error.message });
  }
};

// Admin: Get all payments
exports.getAllPayments = async (req, res) => {
  try {
    const { status, type, limit = 20, page = 1 } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (type) filters.type = type;

    const payments = await Payment.find(filters)
      .populate('user', 'name email')
      .populate('relatedItem.itemId')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Payment.countDocuments(filters);

    // Calculate statistics
    const stats = await Payment.aggregate([
      { $match: filters },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      payments,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      },
      statistics: stats
    });
  } catch (error) {
    console.error('Get all payments error:', error);
    res.status(500).json({ message: 'Failed to fetch payments', error: error.message });
  }
};

// Get Razorpay key (for client-side integration)
exports.getRazorpayKey = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch Razorpay key' });
  }
};
