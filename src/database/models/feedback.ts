const mongoose = require('mongoose')

const feedbackSchema: any = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    feedback: { type: String },
    isDeleted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user", default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user", default: null },
}, { timestamps: true, versionKey: false })

export const feedbackModel = mongoose.model('feedback', feedbackSchema);