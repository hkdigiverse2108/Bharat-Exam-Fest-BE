const mongoose = require('mongoose')

const pdfSchema: any = new mongoose.Schema({
    type: { type: String },
    link: { type: String },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false })

export const pdfModel = mongoose.model('pdf', pdfSchema);