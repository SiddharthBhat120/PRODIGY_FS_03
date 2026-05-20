const User = require("../models/User");

// POST /api/wishlist/toggle/:productId
const toggleWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const productId = req.params.productId;
    const idx = user.wishlist.indexOf(productId);
    if (idx === -1) {
      user.wishlist.push(productId);
    } else {
      user.wishlist.splice(idx, 1);
    }
    await user.save();
    res.json({ success: true, wishlist: user.wishlist, added: idx === -1 });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/wishlist
const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("wishlist", "name price images rating category");
    res.json({ success: true, data: user.wishlist });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { toggleWishlist, getWishlist };
