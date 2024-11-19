import { ID_PROOF, KYC_STATUS } from "../../utils";

const mongoose = require('mongoose')

const kycSchema: any = new mongoose.Schema({
    idNumber: { type: String },
    idProof: { type: String, enum: Object.values(ID_PROOF) },
    frontSideImage: { type: String },
    backSideImage: { type: String },
    status: { type: String, enum: Object.values(KYC_STATUS), default: KYC_STATUS.PENDING },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    isDeleted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }
}, { timestamps: true, versionKey: false })

export const kycModel = mongoose.model('kyc', kycSchema);