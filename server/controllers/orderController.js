const Order = require("../models/Order");
const Product = require("../models/Product");

// POST /api/orders
const createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, itemsPrice, shippingPrice, totalPrice } = req.body;
    if (!orderItems || orderItems.length === 0)
      return res.status(400).json({ success: false, message: "No order items." });

    // Check stock
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(404).json({ success: false, message: `Product not found: ${item.name}` });
      if (product.stock < item.quantity)
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
    }

    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || "COD",
      paymentStatus: paymentMethod === "Online" ? "Paid" : "Pending",
      itemsPrice,
      shippingPrice: shippingPrice || 0,
      totalPrice,
    });

    // Deduct stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity, sold: item.quantity },
      });
    }

    res.status(201).json({ success: true, message: "Order placed successfully!", data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders/my
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("orderItems.product", "name images")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders/:id
const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email").populate("orderItems.product", "name images");
    if (!order) return res.status(404).json({ success: false, message: "Order not found." });
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin")
      return res.status(403).json({ success: false, message: "Not authorized." });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders (admin)
const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { orderStatus: status } : {};
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, data: orders, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/orders/:id/status (admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus, ...(orderStatus === "Delivered" ? { deliveredAt: Date.now(), paymentStatus: "Paid" } : {}) },
      { new: true }
    );
    if (!order) return res.status(404).json({ success: false, message: "Order not found." });
    res.json({ success: true, message: "Order status updated!", data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders/admin/stats
const getOrderStats = async (req, res) => {
  try {
    const total = await Order.countDocuments();
    const revenue = await Order.aggregate([{ $group: { _id: null, total: { $sum: "$totalPrice" } } }]);
    const byStatus = await Order.aggregate([{ $group: { _id: "$orderStatus", count: { $sum: 1 } } }]);
    const recent = await Order.find().populate("user", "name").sort({ createdAt: -1 }).limit(5);
    res.json({ success: true, stats: { total, revenue: revenue[0]?.total || 0, byStatus, recent } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createOrder, getMyOrders, getOrder, getAllOrders, updateOrderStatus, getOrderStats };
