const express = require("express");
const { protect, admin } = require("../middleware/userMiddleware");
const {addOrderItems, getOrders, getMyOrder, updateOrderStatus} = require("../controller/orderController");

const router = express.Router();

router.route('/')
.post(protect, addOrderItems)
.get(protect, admin, getOrders);

router.route('/myorders')
.get(protect, getMyOrder);

router.route('/:id/status')
.put(protect, admin, updateOrderStatus);

module.exports = router;
