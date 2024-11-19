const mongoose = require('mongoose')

const contestSchema: any = new mongoose.Schema({
    classesId: { type: mongoose.Schema.Types.ObjectId, ref: "classes", default: null },
    name: { type: String },
    subTopicId: { type: mongoose.Schema.Types.ObjectId, ref: "sub-topic", default: null },
    startDate: { type: Date },
    endDate: { type: Date },
    totalSpots: { type: Number },
    fees: { type: Number },
    winningAmountPerFee: { type: Number },
    winnerPercentage: { type: Number },
    ranks: [{ place: { type: String } }],
    totalQuestions: { type: Number },
    totalTime: { type: String },
    totalMarks: { type: Number },
    isDeleted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, default: null },
}, { timestamps: true, versionKey: false })

export const contestModel = mongoose.model('contest', contestSchema);