import { ID_PROOF, KYC_STATUS, Q_A_TYPE, WHY_FALSE } from "../../utils";

const mongoose = require('mongoose')

const qaSchema: any = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    classesId: { type: mongoose.Schema.Types.ObjectId, ref: 'classes', default: null },
    contestId: { type: mongoose.Schema.Types.ObjectId, ref: 'contest' },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'subject' },
    subTopicId: { type: mongoose.Schema.Types.ObjectId, ref: "sub-topic", default: null },
    stackNumber: { type: Number, default: 0 },
    totalPoints: { type: Number, default: 0 },
    totalRightAnswer: { type: Number, default: 0 },
    totalWrongAnswer: { type: Number, default: 0 },
    totalSkippedAnswer: { type: Number, default: 0 },
    contestStartDate: { type: Date, default: null },
    contestEndDate: { type: Date, default: null },
    isPaid: { type: Boolean, default: false},
    answers: [
        {
            questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'question', default: null },
            type: { type: String, enum: Object.values(Q_A_TYPE), default: null },
            answer: { type: String, default: null },
            rightAnswer: { type: String, default: null },
            is2XStack: { type: Boolean, default: false },
            whyFalse: { type: String, enum: Object.values(WHY_FALSE), default: null },
            isAnsweredTrue: { type: Boolean, default: false },
        }
    ],
    isDeleted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }
}, { timestamps: true, versionKey: false })

export const qaModel = mongoose.model('qa', qaSchema);