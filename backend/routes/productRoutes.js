const express = require("express");
const { createProduct, getProductById, getProducts, updateProduct, deleteProduct } = require("../controller/productController");
const { protect, admin } = require("../middleware/userMiddleware");
const router = express.Router();

// Import the direct upload middleware tool from your config
const { upload } = require("../config/cloudinary");

router.route('/')
    .get(getProducts)
    // Use the native, safe upload handler directly
    .post(protect, admin, upload.single("imageUrl"), createProduct);

router.route('/:id')
    .get(getProductById)
    .put(protect, admin, upload.single("imageUrl"), updateProduct)
    .delete(protect, admin, deleteProduct);

module.exports = router;
