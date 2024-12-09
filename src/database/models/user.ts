import { GENDER_TYPES, ROLE_TYPES } from "../../utils";

const mongoose = require('mongoose')

const userSchema: any = new mongoose.Schema({
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String },
    gender: { type: String, enum: Object.values(GENDER_TYPES) },
    dob: { type: Date },
    city: { type: String },
    language: { type: String },
    referralCode: { type: String },
    contact: {
        countryCode: { type: String },
        mobile: { type: String }
    },
    walletBalance: { type: Number, default: 0 },
    uniqueId: { type: String },
    upscNumber: { type: String },
    password: { type: String, default: null },
    profileImage: { type: String, default: null },
    friendReferralCode: { type: String, default: null },
    otp: { type: Number, default: null },
    userType: { type: String, enum: Object.values(ROLE_TYPES), default: ROLE_TYPES.USER },
    isDeleted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, default: null },
    isMobileVerified: { type: Boolean },
    isEmailVerified: { type: Boolean },
}, { timestamps: true, versionKey: false })

export const userModel = mongoose.model('user', userSchema);