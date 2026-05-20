const Product = require("../models/Product");
const path = require("path");
const fs = require("fs");

// GET /api/products
const getProducts = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, rating, sort, platform, page = 1, limit = 12, featured } = req.query;
    const query = {};
    if (search) query.$or = [
      { name: { $regex: search, $options: "i" } },
      { brand: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
    if (category) query.category = category;
    if (platform) query.platform = { $regex: platform, $options: "i" };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (rating) query.rating = { $gte: Number(rating) };
    if (featured === "true") query.featured = true;

    const sortOptions = {
      newest: { createdAt: -1 },
      "price-asc": { price: 1 },
      "price-desc": { price: -1 },
      rating: { rating: -1 },
      popular: { sold: -1 },
    };
    const sortBy = sortOptions[sort] || { createdAt: -1 };

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortBy)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select("-reviews");

    res.json({
      success: true,
      data: products,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit), limit: Number(limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/products/:id
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("reviews.user", "name avatar");
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/products (admin)
const createProduct = async (req, res) => {
  try {
    const images = req.files?.map(f => `/uploads/${f.filename}`) || [];
    const product = await Product.create({ ...req.body, images, createdBy: req.user._id });
    res.status(201).json({ success: true, message: "Product created!", data: product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/products/:id (admin)
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });
    const newImages = req.files?.map(f => `/uploads/${f.filename}`) || [];
    const data = { ...req.body };
    if (newImages.length > 0) data.images = [...(product.images || []), ...newImages];
    const updated = await Product.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    res.json({ success: true, message: "Product updated!", data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/products/:id (admin)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });
    product.images.forEach(img => {
      const p = path.join(__dirname, "..", img);
      if (fs.existsSync(p)) fs.unlinkSync(p);
    });
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Product deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/products/:id/review
const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || !comment) return res.status(400).json({ success: false, message: "Rating and comment required." });
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });
    const already = product.reviews.find(r => r.user.toString() === req.user._id.toString());
    if (already) return res.status(400).json({ success: false, message: "Already reviewed." });
    product.reviews.push({ user: req.user._id, name: req.user.name, rating: Number(rating), comment });
    product.calcRating();
    await product.save();
    res.status(201).json({ success: true, message: "Review added!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/products/stats (admin)
const getStats = async (req, res) => {
  try {
    const total = await Product.countDocuments();
    const outOfStock = await Product.countDocuments({ stock: 0 });
    const categories = await Product.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]);
    const topSelling = await Product.find().sort({ sold: -1 }).limit(5).select("name sold price images");
    res.json({ success: true, stats: { total, outOfStock, categories, topSelling } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/products/seed (admin - seed sample products)
const seedProducts = async (req, res) => {
  try {
    const count = await Product.countDocuments();
    if (count > 0) return res.json({ success: true, message: `Already have ${count} products.` });

    const samples = [
      { name: "Cyberpunk 2077 Ultimate Edition", description: "Experience Night City in its full glory. The ultimate edition includes all DLCs and expansion packs.", price: 2499, originalPrice: 3499, category: "Games", brand: "CD Projekt Red", stock: 50, featured: true, platform: "PC", rating: 4.5, numReviews: 128, sold: 340, tags: ["RPG", "Open World", "Cyberpunk"] },
      { name: "Elden Ring GOTY Edition", description: "FromSoftware's masterpiece. Includes Shadow of the Erdtree expansion.", price: 3299, originalPrice: 3999, category: "Games", brand: "FromSoftware", stock: 35, featured: true, platform: "PC", rating: 4.9, numReviews: 256, sold: 520, tags: ["Action RPG", "Soulslike"] },
      { name: "Red Dead Redemption 2", description: "An epic tale of life in America's unforgiving heartland.", price: 1999, originalPrice: 2499, category: "Games", brand: "Rockstar Games", stock: 60, platform: "PC", rating: 4.8, numReviews: 198, sold: 410, tags: ["Open World", "Western"] },
      { name: "Logitech G Pro X Superlight 2", description: "Legendary lightweight gaming mouse. 60g, HERO 25K sensor, 5 programmable buttons.", price: 12999, originalPrice: 15999, category: "Mice", brand: "Logitech", stock: 25, featured: true, platform: "PC", rating: 4.7, numReviews: 89, sold: 156, tags: ["Wireless", "Lightweight", "Pro"] },
      { name: "SteelSeries Arctis Nova Pro", description: "Premium wireless gaming headset with active noise cancellation and 360° Spatial Audio.", price: 24999, originalPrice: 29999, category: "Headsets", brand: "SteelSeries", stock: 18, featured: true, platform: "PC", rating: 4.6, numReviews: 67, sold: 98, tags: ["Wireless", "ANC", "Hi-Res"] },
      { name: "ASUS ROG Strix Scope RX", description: "Optical mechanical gaming keyboard with ROG RX Red switches. RGB per-key lighting.", price: 8999, originalPrice: 10999, category: "Keyboards", brand: "ASUS ROG", stock: 30, platform: "PC", rating: 4.5, numReviews: 54, sold: 87, tags: ["Mechanical", "RGB", "Optical"] },
      { name: "Xbox Elite Series 2 Controller", description: "The most advanced Xbox controller ever. Hair trigger locks, adjustable tension thumbsticks.", price: 13999, originalPrice: 16999, category: "Controllers", brand: "Microsoft", stock: 22, featured: true, platform: "PC/Xbox", rating: 4.4, numReviews: 112, sold: 203, tags: ["Elite", "Pro", "Wireless"] },
      { name: "NVIDIA RTX 4070 Ti Super", description: "Next-gen 4K gaming GPU. DLSS 3, Frame Generation, Ray Tracing excellence.", price: 79999, originalPrice: 89999, category: "GPUs", brand: "NVIDIA", stock: 8, featured: true, platform: "PC", rating: 4.8, numReviews: 43, sold: 67, tags: ["4K", "Ray Tracing", "DLSS"] },
      { name: "LG 27GP850-B 27\" Monitor", description: "165Hz IPS gaming monitor. 1ms response, G-Sync Compatible, HDR10.", price: 32999, originalPrice: 38999, category: "Monitors", brand: "LG", stock: 15, platform: "PC", rating: 4.6, numReviews: 78, sold: 134, tags: ["165Hz", "IPS", "HDR"] },
      { name: "PlayStation 5 Digital Edition", description: "Experience lightning-fast loading, deeper immersion with haptic feedback.", price: 44999, originalPrice: 49999, category: "Consoles", brand: "Sony", stock: 10, featured: true, platform: "PS5", rating: 4.9, numReviews: 312, sold: 445, tags: ["Next-Gen", "4K", "Console"] },
      { name: "Razer BlackShark V2 Pro", description: "THX Spatial Audio, 50mm drivers, 70-hour battery life.", price: 14999, originalPrice: 17999, category: "Headsets", brand: "Razer", stock: 20, platform: "PC/Console", rating: 4.5, numReviews: 91, sold: 167, tags: ["Wireless", "THX", "Pro"] },
      { name: "Hogwarts Legacy Deluxe Edition", description: "Live the unwritten. Your legacy is what you make of it in the wizarding world.", price: 2799, originalPrice: 3499, category: "Games", brand: "Portkey Games", stock: 45, platform: "PC", rating: 4.6, numReviews: 143, sold: 289, tags: ["RPG", "Harry Potter", "Open World"] },
    ];

    await Product.insertMany(samples);
    res.json({ success: true, message: `Seeded ${samples.length} products!` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct, addReview, getStats, seedProducts };
