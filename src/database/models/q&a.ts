import { ID_PROOF, KYC_STATUS, Q_A_TYPE, WHY_FALSE } from "../../utils";

const mongoose = require('mongoose')

const qaSchema: any = new mongoose.Schema({
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'question' },
    contentId: { type: mongoose.Schema.Types.ObjectId, ref: 'content' },
    classesId: { type: mongoose.Schema.Types.ObjectId, ref: 'classes' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    type: { type: String, enum: Object.values(Q_A_TYPE) },
    answer: { type: String, default: null },
    whyFalse: { type: String, enum: Object.values(WHY_FALSE), default: null },
    isDeleted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }
}, { timestamps: true, versionKey: false })

export const qaModel = mongoose.model('qa', qaSchema);