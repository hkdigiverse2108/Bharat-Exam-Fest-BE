const mongoose = require('mongoose')

const subTopicSchema: any = new mongoose.Schema({
    name: { type: String },
    isDeleted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, default: null }
}, { timestamps: true, versionKey: false })

export const subTopicModel = mongoose.model('sub-topic', subTopicSchema);