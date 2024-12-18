import { ROLE_TYPES } from "../../utils";

const mongoose = require('mongoose')

const classesSchema: any = new mongoose.Schema({
    name: { type: String },
    ownerName: { type: String },
    title: { type: String },
    contact: {
        countryCode: { type: String },
        mobile: { type: String }
    },
    email: { type: String },
    country: { type: String },
    account: {
        accountNumber: { type: String },
        ifscCode: { type: String },
        bankName: { type: String },
        upiId: { type: String },
        swiftCode: { type: String }
    },
    referralCode: { type: String },
    termsAndConditions: { type: String },
    privacyPolicy: { type: String },
    password: { type: String },
    image: { type: String },
    userType: { type: String, enum: Object.values(ROLE_TYPES), default: ROLE_TYPES.CLASSES },
    otp: { type: String },
    isForAllUsers: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, default: null }
}, { timestamps: true, versionKey: false })

export const classesModel = mongoose.model('classes', classesSchema);