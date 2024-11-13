const mongoose = require('mongoose')

const termsConditionSchema: any = new mongoose.Schema({
    termsCondition: { type: String },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, default: null },
}, { timestamps: true, versionKey: false })

export const termsConditionModel = mongoose.model('terms-condition', termsConditionSchema);