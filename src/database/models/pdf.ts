const mongoose = require('mongoose')

const pdfSchema: any = new mongoose.Schema({
    type: { type: String, enum: ["terms-condition", "privacy-policy"] },
    link: { type: String },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false })

export const pdfModel = mongoose.model('pdf', pdfSchema);