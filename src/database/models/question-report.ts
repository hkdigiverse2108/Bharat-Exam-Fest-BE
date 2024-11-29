const mongoose = require('mongoose')

const questionReportSchema: any = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    contestId: { type: mongoose.Schema.Types.ObjectId, ref: 'contest' },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'subject' },
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'question' },
    message: { type: String },
    isDeleted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, default: null }
}, { timestamps: true, versionKey: false })

export const questionReportModel = mongoose.model('question-report', questionReportSchema);