const mongoose = require('mongoose')

const subjectSchema: any = new mongoose.Schema({
    name: { type: String },
    image: { type: String },
    subTopicIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "sub-topic", default: [] }],
    isDeleted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, default: null }
}, { timestamps: true, versionKey: false })

export const subjectModel = mongoose.model('subject', subjectSchema);   