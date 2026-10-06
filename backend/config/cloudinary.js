require("dotenv").config();
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

cloudinary.config()

const storage = multer.diskStorage({});

const upload = multer({ storage: storage });

module.exports = { cloudinary, upload };
