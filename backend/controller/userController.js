// const User = require("../model/User");
// const jwt = require("jsonwebtoken");

// // 🛠️ CHANGED: Extended to 60d lifecycle to drastically minimize repetitive OTP requests
// const generateToken = (id) => {
//     return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "60d" });
// };

// /**
//  * @desc    Register a brand new user via Firebase Verified Phone Number & Name Input
//  * @route   POST /api/user/register-otp
//  * @access  Public
//  */
// const registerUserWithOTP = async (req, res) => {
//     const { name, phoneNumber } = req.body;

//     if (!name || !phoneNumber) {
//         return res.status(400).json({ message: "Full name and phone number are required fields." });
//     }

//     try {
//         // 1. Verify if the caller account already exists in MongoDB
//         const existingUser = await User.findOne({ phoneNumber });
//         if (existingUser) {
//             return res.status(400).json({ message: "This phone number is already registered. Please go to the Login page instead." });
//         }

//         // 2. Create the clean account database document utilizing user parameters
//         const user = await User.create({
//             name,
//             phoneNumber,
//             role: "user"
//         });

//         // 3. Return the payload alongside the long-term 60-day token
//         return res.status(201).json({
//             _id: user._id,
//             name: user.name,
//             phoneNumber: user.phoneNumber,
//             role: user.role,
//             token: generateToken(user._id)
//         });

//     } catch (error) {
//         console.error("Registration Error:", error);
//         return res.status(500).json({ message: "Server error creating new user account.", error: error.message });
//     }
// };

// /**
//  * @desc    Login returning user via Firebase Verified Phone Number
//  * @route   POST /api/user/login-otp
//  * @access  Public
//  */
// const loginUserWithOTP = async (req, res) => {
//     const { phoneNumber } = req.body;

//     if (!phoneNumber) {
//         return res.status(400).json({ message: "Phone number is required from the payload." });
//     }

//     try {
//         // 1. Look for the user strictly by their unique verified mobile number
//         let user = await User.findOne({ phoneNumber });

//         // 2. Safety Check: If the account profile does not exist, block access and tell them to register
//         if (!user) {
//             return res.status(404).json({ message: "Account profile not found. Please create an account on the Register page first." });
//         }

//         // 3. Return the clean user user profile data array structure alongside the 60-day token
//         return res.json({
//             _id: user._id,
//             name: user.name,
//             phoneNumber: user.phoneNumber,
//             role: user.role,
//             token: generateToken(user._id)
//         });

//     } catch (error) {
//         console.error("Authentication Error:", error);
//         return res.status(500).json({ message: "Server error during phone authentication sync.", error: error.message });
//     }
// };

// /**
//  * @desc    Get all users (for administrative management panels)
//  * @route   GET /api/user/users
//  * @access  Private/Admin
//  */
// const getUsers = async (req, res) => {
//     try {
//         const users = await User.find({}).select('-password'); // Safeguard check just in case legacy models have data passwords
//         res.json(users);
//     } catch (error) {
//         res.status(500).json({ message: "Server database extraction error." });
//     }
// };

// module.exports = {
//     registerUserWithOTP, // 🛠️ Exported successfully for your routes configuration file
//     loginUserWithOTP,
//     getUsers
// };


const User = require("../model/User");
const OTP = require("../model/OTP");
const OTPRateLimit = require("../model/OTPRateLimit");

const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");


// JWT
const generateToken = (id) => {
    return jwt.sign(
        { id },
        process.env.JWT_SECRET,
        {
            expiresIn: "60d"
        }
    );
};


// EMAIL TRANSPORTER
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD
    }
});


// HELPERS
const generateOTP = () => {
    return crypto
        .randomInt(100000, 1000000)
        .toString();
};


const hashOTP = (otp) => {
    return crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");
};


const normalizeEmail = (email) => {
    return email.trim().toLowerCase();
};


// OTP RATE LIMIT
const checkOTPRateLimit = async (email) => {

    const now = new Date();

    const record = await OTPRateLimit.findOne({ email });

    if (!record) {

        await OTPRateLimit.create({
            email,
            lastSentAt: now,
            windowStartedAt: now,
            sendCount: 1
        });

        return {
            allowed: true
        };
    }

    const oneHour = 60 * 60 * 1000;

    const windowExpired =
        now.getTime() - record.windowStartedAt.getTime() >= oneHour;

    if (windowExpired) {

        record.windowStartedAt = now;
        record.lastSentAt = now;
        record.sendCount = 1;

        await record.save();

        return {
            allowed: true
        };
    }

    const thirtySeconds =
        30 * 1000;

    const timeSinceLastSend =
        now.getTime() - record.lastSentAt.getTime();

    if (timeSinceLastSend < thirtySeconds) {

        const secondsLeft = Math.ceil(
            (thirtySeconds - timeSinceLastSend) / 1000
        );

        return {
            allowed: false,
            message: `Please wait ${secondsLeft} seconds before requesting another OTP.`
        };
    }

    if (record.sendCount >= 5) {

        const minutesLeft = Math.ceil(
            (oneHour -
                (now.getTime() - record.windowStartedAt.getTime())) /
                60000
        );

        return {
            allowed: false,
            message: `Too many OTP requests. Please try again in about ${minutesLeft} minutes.`
        };
    }

    record.lastSentAt = now;
    record.sendCount += 1;

    await record.save();

    return {
        allowed: true
    };
};


// SEND OTP EMAIL
const sendOTPEmail = async (email, otp, type) => {
  const isRegister = type === "register";

  const subject = isRegister
    ? `Your Sikh Army Store verification code: ${otp}`
    : `Your Sikh Army Store login code: ${otp}`;

  const message = isRegister
    ? "Use the verification code below to complete your Sikh Army Store registration."
    : "Use the login code below to sign in to your Sikh Army Store account.";

  await transporter.sendMail({
    from: `"Sikh Army Store" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject,

    text: `
Sikh Army Store

${message}

Your verification code is: ${otp}

This code will expire in 5 minutes.

If you did not request this code, you can safely ignore this email.

Sikh Army Store
    `.trim(),

    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Sikh Army Store OTP</title>
        </head>

        <body
          style="
            margin:0;
            padding:0;
            background:#18181b;
            font-family:Arial,Helvetica,sans-serif;
          "
        >

          <div
            style="
              width:100%;
              padding:40px 15px;
              box-sizing:border-box;
              background:#303066;
            "
          >

            <div
              style="
                max-width:560px;
                margin:0 auto;
                background:#18181b;
                border:1px solid #27272a;
                border-radius:12px;
                padding:35px 30px;
                box-sizing:border-box;
              "
            >

              <!-- BRAND -->
              <div
                style="
                  text-align:center;
                  margin-bottom:30px;
                "
              >
                <h1
                  style="
                    margin:0;
                    color:#ffffff;
                    font-size:26px;
                    font-weight:700;
                  "
                >
                  Sikh Army Store
                </h1>
              </div>


              <!-- MESSAGE -->
              <p
                style="
                  margin:0 0 20px;
                  color:#a1a1aa;
                  font-size:15px;
                  line-height:1.6;
                "
              >
                ${message}
              </p>


              <!-- OTP BOX -->
              <div
                style="
                  background:#18181b;
                  border:1px solid #3f3f46;
                  border-radius:10px;
                  padding:24px 15px;
                  text-align:center;
                  margin:25px 0;
                "
              >

                <p
                  style="
                    margin:0 0 12px;
                    color:#a1a1aa;
                    font-size:13px;
                  "
                >
                  Your verification code
                </p>

                <div
                  style="
                    color:#ffffff;
                    font-size:32px;
                    font-weight:700;
                    letter-spacing:7px;
                    line-height:1.2;
                  "
                >
                  ${otp}
                </div>

              </div>


              <!-- EXPIRY -->
              <p
                style="
                  margin:0;
                  color:#ffffff;
                  font-size:14px;
                  line-height:1.6;
                "
              >
                This code will expire in <strong style="color:#ffffff;">5 minutes</strong>.
              </p>



              <!-- SECURITY -->
              <p
                style="
                  margin:25px 0 0;
                  color:#ffffff;
                  font-size:12px;
                  line-height:1.6;
                  text-align:center;
                "
              >
                If you did not request this code, you can safely ignore this email.
              </p>


              <!-- FOOTER -->
              <div
                style="
                  margin-top:30px;
                  padding-top:20px;
                  border-top:1px solid #27272a;
                  text-align:center;
                "
              >
                <p
                  style="
                    margin:0;
                    color:#a1a1aa;
                    font-size:12px;
                  "
                >
                  Sikh Army Store
                </p>
              </div>

            </div>

          </div>

        </body>
      </html>
    `
  });
};



// ===============================
// REGISTER - SEND OTP
// ===============================

const sendRegisterOTP = async (req, res) => {

    try {

        const { name, email } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Please enter your full name."
            });
        }

        if (!email || !email.trim()) {
            return res.status(400).json({
                message: "Please enter your email."
            });
        }

        const normalizedEmail = normalizeEmail(email);

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                code: "USER_EXISTS",
                message: "This email is already registered. Please log in instead."
            });
        }

        const rateLimit =
            await checkOTPRateLimit(normalizedEmail);

        if (!rateLimit.allowed) {
            return res.status(429).json({
                code: "OTP_RATE_LIMIT",
                message: rateLimit.message
            });
        }

        const otp = generateOTP();

        const otpHash = hashOTP(otp);

        await OTP.findOneAndUpdate(
            { email: normalizedEmail },

            {
                email: normalizedEmail,
                otpHash,
                expiresAt: new Date(
                    Date.now() + 5 * 60 * 1000
                ),
                attempts: 0
            },

            {
                upsert: true,
                new: true
            }
        );

        await sendOTPEmail(
            normalizedEmail,
            otp,
            "register"
        );

        res.status(200).json({
            success: true,
            message: "OTP sent successfully."
        });

    } catch (error) {

        console.error(
            "Register OTP Error:",
            error
        );

        res.status(500).json({
            message: "Unable to send OTP right now. Please try again."
        });
    }
};


// ===============================
// REGISTER - VERIFY OTP
// ===============================

const verifyRegisterOTP = async (req, res) => {

    try {

        const {
            name,
            email,
            otp
        } = req.body;

        if (!name || !email || !otp) {
            return res.status(400).json({
                message: "Name, email and OTP are required."
            });
        }

        const normalizedEmail =
            normalizeEmail(email);

        const otpRecord =
            await OTP.findOne({
                email: normalizedEmail
            });

        if (!otpRecord) {
            return res.status(400).json({
                message: "OTP not found or expired. Please request a new OTP."
            });
        }

        if (
            otpRecord.expiresAt.getTime() <
            Date.now()
        ) {

            await OTP.deleteOne({
                email: normalizedEmail
            });

            return res.status(400).json({
                message: "OTP has expired. Please request a new one."
            });
        }

        if (otpRecord.attempts >= 5) {

            await OTP.deleteOne({
                email: normalizedEmail
            });

            return res.status(400).json({
                message: "Too many incorrect attempts. Please request a new OTP."
            });
        }

        const hashedInput =
            hashOTP(otp);

        if (
            hashedInput !==
            otpRecord.otpHash
        ) {

            otpRecord.attempts += 1;

            await otpRecord.save();

            return res.status(400).json({
                message: "Incorrect OTP. Please check the code and try again."
            });
        }

        const existingUser =
            await User.findOne({
                email: normalizedEmail
            });

        if (existingUser) {

            await OTP.deleteOne({
                email: normalizedEmail
            });

            return res.status(409).json({
                code: "USER_EXISTS",
                message: "This email is already registered. Please log in instead."
            });
        }

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail
        });

        await OTP.deleteOne({
            email: normalizedEmail
        });

        res.status(201).json({
            success: true,

            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                defaultAddress: user.defaultAddress
            },

            token: generateToken(user._id)
        });

    } catch (error) {

        console.error(
            "Register Verification Error:",
            error
        );

        res.status(500).json({
            message: "Unable to create your account."
        });
    }
};


// ===============================
// LOGIN - SEND OTP
// ===============================

const sendLoginOTP = async (req, res) => {

    try {

        const { email } = req.body;

        if (!email || !email.trim()) {
            return res.status(400).json({
                message: "Please enter your email."
            });
        }

        const normalizedEmail =
            normalizeEmail(email);

        const existingUser =
            await User.findOne({
                email: normalizedEmail
            });

        if (!existingUser) {
            return res.status(404).json({
                code: "USER_NOT_FOUND",
                message: "No account found with this email. Please register first."
            });
        }

        const rateLimit =
            await checkOTPRateLimit(normalizedEmail);

        if (!rateLimit.allowed) {
            return res.status(429).json({
                code: "OTP_RATE_LIMIT",
                message: rateLimit.message
            });
        }

        const otp = generateOTP();

        const otpHash = hashOTP(otp);

        await OTP.findOneAndUpdate(
            { email: normalizedEmail },

            {
                email: normalizedEmail,
                otpHash,
                expiresAt: new Date(
                    Date.now() + 5 * 60 * 1000
                ),
                attempts: 0
            },

            {
                upsert: true,
                new: true
            }
        );

        await sendOTPEmail(
            normalizedEmail,
            otp,
            "login"
        );

        res.status(200).json({
            success: true,
            message: "Login OTP sent successfully."
        });

    } catch (error) {

        console.error(
            "Login OTP Error:",
            error
        );

        res.status(500).json({
            message: "Unable to send login OTP right now."
        });
    }
};


// ===============================
// LOGIN - VERIFY OTP
// ===============================

const verifyLoginOTP = async (req, res) => {

    try {

        const {
            email,
            otp
        } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and OTP are required."
            });
        }

        const normalizedEmail =
            normalizeEmail(email);

        const otpRecord =
            await OTP.findOne({
                email: normalizedEmail
            });

        if (!otpRecord) {
            return res.status(400).json({
                message: "OTP not found or expired. Please request a new OTP."
            });
        }

        if (
            otpRecord.expiresAt.getTime() <
            Date.now()
        ) {

            await OTP.deleteOne({
                email: normalizedEmail
            });

            return res.status(400).json({
                message: "OTP has expired. Please request a new one."
            });
        }

        if (otpRecord.attempts >= 5) {

            await OTP.deleteOne({
                email: normalizedEmail
            });

            return res.status(400).json({
                message: "Too many incorrect attempts. Please request a new OTP."
            });
        }

        const hashedInput =
            hashOTP(otp);

        if (
            hashedInput !==
            otpRecord.otpHash
        ) {

            otpRecord.attempts += 1;

            await otpRecord.save();

            return res.status(400).json({
                message: "Incorrect OTP. Please check the code and try again."
            });
        }

        const user =
            await User.findOne({
                email: normalizedEmail
            });

        if (!user) {

            await OTP.deleteOne({
                email: normalizedEmail
            });

            return res.status(404).json({
                code: "USER_NOT_FOUND",
                message: "No account found. Please register first."
            });
        }

        await OTP.deleteOne({
            email: normalizedEmail
        });

        res.status(200).json({
            success: true,

            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                defaultAddress: user.defaultAddress
            },

            token: generateToken(user._id)
        });

    } catch (error) {

        console.error(
            "Login Verification Error:",
            error
        );

        res.status(500).json({
            message: "Unable to verify login OTP."
        });
    }
};


// ===============================
// GET CURRENT USER
// ===============================

const getMyProfile = async (req, res) => {

    try {

        const user = await User.findById(
            req.user._id
        ).select("-__v");

        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        res.json({
            success: true,
            user
        });

    } catch (error) {

        console.error(
            "Get Profile Error:",
            error
        );

        res.status(500).json({
            message: "Unable to load your profile."
        });
    }
};


// ===============================
// ADMIN - GET USERS
// ===============================

const getUsers = async (req, res) => {

    try {

        const users = await User
            .find({})
            .select("-__v")
            .sort({ createdAt: -1 });

        res.json(users);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });
    }
};


module.exports = {
    sendRegisterOTP,
    verifyRegisterOTP,
    sendLoginOTP,
    verifyLoginOTP,
    getMyProfile,
    getUsers
};