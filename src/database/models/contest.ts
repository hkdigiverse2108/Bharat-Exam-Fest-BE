const mongoose = require('mongoose')

const contestSchema: any = new mongoose.Schema({
    classesId: { type: mongoose.Schema.Types.ObjectId, ref: "classes", default: null },
    name: { type: String },
    contestTypeId: { type: mongoose.Schema.Types.ObjectId, ref: "contest-type", default: null },
    startDate: { type: Date },
    endDate: { type: Date },
    totalSpots: { type: Number, default: 0 },
    filledSpots: { type: Number, default: 0 },
    fees: { type: Number },
    classesFees: { type: Number },
    winningAmountPerFee: { type: Number },
    pricePool: { type: Number, default: 0 },
    ranks: [
        {
            startPlace: { type: String, default: null },
            endPlace: { type: String, default: null },
            price: { type: Number, default: null }
        }
    ],
    slots: [{ type: Date }],
    winnerPercentage: { type: Number },
    totalQuestions: { type: Number },
    totalTime: { type: String },
    totalMarks: { type: Number },
    isDeleted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, default: null },
}, { timestamps: true, versionKey: false })

export const contestModel = mongoose.model('contest', contestSchema);