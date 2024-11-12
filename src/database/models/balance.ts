import { BALANCE_STATUS, BALANCE_TYPE } from "../../utils";

const mongoose = require('mongoose')

const balanceSchema: any = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    name: { type: String },
    amount: { type: Number },
    utrId: { type: String },
    status: { type: String, enum: Object.values(BALANCE_STATUS) },
    type: { type: String, enum: Object.values(BALANCE_TYPE) },
    isDeleted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, default: null }
}, { timestamps: true, versionKey: false })

export const balanceModel = mongoose.model('balance', balanceSchema);