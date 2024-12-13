import { ID_PROOF, KYC_STATUS, Q_A_TYPE, SKIP_ELIMINATE, WHY_FALSE } from "../../utils";

const mongoose = require('mongoose')

const qaSchema: any = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    classesId: { type: mongoose.Schema.Types.ObjectId, ref: 'classes', default: null },
    contestId: { type: mongoose.Schema.Types.ObjectId, ref: 'contest' },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'subject' },
    stackNumber: { type: Number, default: 0 },
    totalPoints: { type: Number, default: 0 },
    totalRightAnswer: { type: Number, default: 0 },
    totalWrongAnswer: { type: Number, default: 0 },
    totalSkippedAnswer: { type: Number, default: 0 },
    contestStartDate: { type: Date, default: null },// user contest start date ex:- 12/12/2024 08:00 AM
    contestEndDate: { type: Date, default: null },// user contest end date ex:- 12/12/2024 09:00 AM
    contestStartTime: { type: Date, default: null },// user play start time ex: - 8: 20 AM
    contestEndTime: { type: Date, default: null },// user play end time ex:- 8: 50 AM
    isPaid: { type: Boolean, default: false},
    rank: { type: Number, default: null },
    contestRankId: { type: mongoose.Schema.Types.ObjectId, ref: 'contest-rank', default: null },
    answers: [
        {
            questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'question', default: null },
            type: { type: String, enum: Object.values(Q_A_TYPE), default: null },
            answer: { type: String, default: null },
            rightAnswer: { type: String, default: null },
            is2XStack: { type: Boolean, default: false },
            eliminateOption: { type: Number, default: null },
            eliminateOptionA: { type: Boolean, default: false },
            eliminateOptionB: { type: Boolean, default: false },
            eliminateOptionC: { type: Boolean, default: false },
            eliminateOptionD: { type: Boolean, default: false },
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