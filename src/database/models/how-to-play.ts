const mongoose = require('mongoose')

const howToPlaySchema: any = new mongoose.Schema({
    title: { type: String },
    link: { type: String },
    image: { type: String },    
    isDeleted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, default: null }
}, { timestamps: true, versionKey: false })

export const howToPlayModel = mongoose.model('how-to-play', howToPlaySchema);