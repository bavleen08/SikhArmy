const jwt = require("jsonwebtoken");
const User = require("../model/User");

const protect = async (req, res, next) => {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            req.user = await User.findById(decoded.id).select('-password');
            
            if (!req.user) {
                return res.status(401).json({ message: "Not authorized, user not found" });
            }

            return next(); // 🔴 Added explicit return
        }
        catch (error) {
            // 🔴 Added return here so execution stops immediately on token failure
            return res.status(401).json({ 
                message: "Not authorized, token failed", 
                error: error.message 
            });
        }
    } 

    if (!token) {
        // 🔴 Added return here to prevent any hanging middleware execution
        return res.status(401).json({ message: "Not authorized, no token" });
    }
};

const admin = async (req, res, next) => {
    // Check if user object exists and role strictly matches 'admin'
    if (req.user && req.user.role === 'admin') {
        return next(); // 🔴 Added explicit return for standard execution hygiene
    } else {
        return res.status(403).json({ message: "Access denied, admin only!" });
    }
};

module.exports = { protect, admin };
