const mongoose = require('mongoose')

const resultReportSchema: any = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    resultId: { type: mongoose.Schema.Types.ObjectId, ref: "result" },
    message: { type: String },
    isDeleted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, default: null }
}, { timestamps: true, versionKey: false })

export const resultReportModel = mongoose.model('result-report', resultReportSchema);