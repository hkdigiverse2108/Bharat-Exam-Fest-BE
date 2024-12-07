const mongoose = require('mongoose')

const resultReportSchema: any = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    contestId: { type: mongoose.Schema.Types.ObjectId, ref: "contest" },
    qaId: { type: mongoose.Schema.Types.ObjectId, ref: "qa" },
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: "question" },
    message: { type: String },
    isDeleted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, default: null }
}, { timestamps: true, versionKey: false })

export const resultReportModel = mongoose.model('result-report', resultReportSchema);