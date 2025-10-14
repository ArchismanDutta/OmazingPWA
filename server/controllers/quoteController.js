const Quote = require("../models/Quote");

// Get all quotes (Admin)
exports.getAllQuotes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const isActive = req.query.isActive;
    const skip = (page - 1) * limit;

    let query = {};
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const quotes = await Quote.find(query)
      .sort({ displayPriority: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email');

    const totalQuotes = await Quote.countDocuments(query);
    const totalPages = Math.ceil(totalQuotes / limit);

    res.json({
      success: true,
      data: quotes,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalQuotes,
        itemsPerPage: limit,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Get quotes error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch quotes",
      error: error.message,
    });
  }
};

// Get single quote by ID
exports.getQuoteById = async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id).populate('createdBy', 'name email');

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: "Quote not found",
      });
    }

    res.json({
      success: true,
      data: quote,
    });
  } catch (error) {
    console.error("Get quote error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch quote",
      error: error.message,
    });
  }
};

// Create new quote
exports.createQuote = async (req, res) => {
  try {
    const { text, author, isActive, displayPriority, source } = req.body;

    const quote = new Quote({
      text,
      author,
      isActive: isActive !== undefined ? isActive : true,
      displayPriority: displayPriority || 0,
      source: source || "custom",
      isPredefined: source === "predefined",
      createdBy: req.user.id,
    });

    await quote.save();

    res.status(201).json({
      success: true,
      message: "Quote created successfully",
      data: quote,
    });
  } catch (error) {
    console.error("Create quote error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create quote",
      error: error.message,
    });
  }
};

// Update quote
exports.updateQuote = async (req, res) => {
  try {
    const { text, author, isActive, displayPriority } = req.body;

    const quote = await Quote.findByIdAndUpdate(
      req.params.id,
      {
        text,
        author,
        isActive,
        displayPriority,
        updatedAt: Date.now(),
      },
      { new: true, runValidators: true }
    );

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: "Quote not found",
      });
    }

    res.json({
      success: true,
      message: "Quote updated successfully",
      data: quote,
    });
  } catch (error) {
    console.error("Update quote error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update quote",
      error: error.message,
    });
  }
};

// Delete quote
exports.deleteQuote = async (req, res) => {
  try {
    const quote = await Quote.findByIdAndDelete(req.params.id);

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: "Quote not found",
      });
    }

    res.json({
      success: true,
      message: "Quote deleted successfully",
    });
  } catch (error) {
    console.error("Delete quote error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete quote",
      error: error.message,
    });
  }
};

// Toggle quote active status
exports.toggleQuoteStatus = async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: "Quote not found",
      });
    }

    quote.isActive = !quote.isActive;
    quote.updatedAt = Date.now();
    await quote.save();

    res.json({
      success: true,
      message: `Quote ${quote.isActive ? 'activated' : 'deactivated'} successfully`,
      data: quote,
    });
  } catch (error) {
    console.error("Toggle quote status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle quote status",
      error: error.message,
    });
  }
};

// Get daily quote (Public endpoint)
exports.getDailyQuote = async (req, res) => {
  try {
    const activeQuotes = await Quote.find({ isActive: true });

    if (activeQuotes.length === 0) {
      // Return a default quote if no active quotes exist
      return res.json({
        success: true,
        data: {
          text: "Feel less stressed and more mindful with meditation. Discover peace, balance, and renewed energy every day.",
          author: "Mindfulness Practice",
        },
      });
    }

    // Select a random quote from active quotes
    const randomQuote = activeQuotes[Math.floor(Math.random() * activeQuotes.length)];

    res.json({
      success: true,
      data: {
        text: randomQuote.text,
        author: randomQuote.author,
      },
    });
  } catch (error) {
    console.error("Get daily quote error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch daily quote",
      error: error.message,
    });
  }
};

// Seed predefined quotes (one-time setup)
exports.seedPredefinedQuotes = async (req, res) => {
  try {
    const predefinedQuotes = [
      {
        text: "Feel less stressed and more mindful with meditation. Discover peace, balance, and renewed energy every day.",
        author: "Mindfulness Practice",
        source: "predefined",
        isPredefined: true,
        isActive: true,
        displayPriority: 5,
      },
      {
        text: "Peace comes from within. Do not seek it without.",
        author: "Buddha",
        source: "predefined",
        isPredefined: true,
        isActive: true,
        displayPriority: 5,
      },
      {
        text: "The present moment is filled with joy and happiness. If you are attentive, you will see it.",
        author: "Thích Nhất Hạnh",
        source: "predefined",
        isPredefined: true,
        isActive: true,
        displayPriority: 5,
      },
      {
        text: "Meditation is not about stopping thoughts, but recognizing that we are more than our thoughts and our feelings.",
        author: "Arianna Huffington",
        source: "predefined",
        isPredefined: true,
        isActive: true,
        displayPriority: 5,
      },
      {
        text: "In today's rush, we all think too much — seek too much — want too much — and forget about the joy of just being.",
        author: "Eckhart Tolle",
        source: "predefined",
        isPredefined: true,
        isActive: true,
        displayPriority: 5,
      },
    ];

    // Check if quotes already exist
    const existingCount = await Quote.countDocuments({ isPredefined: true });
    if (existingCount > 0) {
      return res.json({
        success: true,
        message: "Predefined quotes already exist",
        count: existingCount,
      });
    }

    // Insert predefined quotes
    const quotes = await Quote.insertMany(predefinedQuotes);

    res.json({
      success: true,
      message: "Predefined quotes seeded successfully",
      data: quotes,
    });
  } catch (error) {
    console.error("Seed quotes error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to seed quotes",
      error: error.message,
    });
  }
};

// Get quote statistics
exports.getQuoteStats = async (req, res) => {
  try {
    const totalQuotes = await Quote.countDocuments();
    const activeQuotes = await Quote.countDocuments({ isActive: true });
    const customQuotes = await Quote.countDocuments({ source: "custom" });
    const predefinedQuotes = await Quote.countDocuments({ source: "predefined" });

    res.json({
      success: true,
      data: {
        totalQuotes,
        activeQuotes,
        customQuotes,
        predefinedQuotes,
      },
    });
  } catch (error) {
    console.error("Get quote stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch quote statistics",
      error: error.message,
    });
  }
};
