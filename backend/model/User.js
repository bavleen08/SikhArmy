const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user"
        },

        // User's saved/default shipping address
        defaultAddress: {
            fullName: {
                type: String,
                trim: true,
                default: ""
            },

            street: {
                type: String,
                trim: true,
                default: ""
            },

            city: {
                type: String,
                trim: true,
                default: ""
            },

            state: {
                type: String,
                trim: true,
                default: ""
            },

            postalCode: {
                type: String,
                trim: true,
                default: ""
            },

            country: {
                type: String,
                trim: true,
                default: "India"
            }
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);