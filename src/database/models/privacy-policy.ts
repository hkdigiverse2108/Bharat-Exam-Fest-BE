const mongoose = require('mongoose')

const privacyPolicySchema: any = new mongoose.Schema({
    privacyPolicy: { type: String },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true, versionKey: false })

export const privacyPolicyModel = mongoose.model('privacy-policy', privacyPolicySchema);