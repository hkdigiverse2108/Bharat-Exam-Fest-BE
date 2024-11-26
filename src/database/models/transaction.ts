import { TRANSACTION_STATUS, TRANSACTION_TYPE } from "../../utils";

const mongoose = require('mongoose')

const transactionSchema: any = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", default: null },
    contestId: { type: mongoose.Schema.Types.ObjectId, ref: "contest", default: null },
    amount: { type: Number },
    transactionType: { type: String, enum: Object.values(TRANSACTION_TYPE), default: TRANSACTION_TYPE.DEPOSIT },
    transactionStatus: { type: String, enum: Object.values(TRANSACTION_STATUS), default: null },
    transactionId: { type: String, default: null },
    isDeleted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, default: null },
}, { timestamps: true, versionKey: false })

export const transactionModel = mongoose.model('transaction', transactionSchema);