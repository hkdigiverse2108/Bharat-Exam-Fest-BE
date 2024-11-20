const mongoose = require('mongoose')

const contestTypeSchema: any = new mongoose.Schema({
    name: { type: String },
    isDeleted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, default: null },
}, { timestamps: true, versionKey: false })

export const contestTypeModel = mongoose.model('contest-type', contestTypeSchema);