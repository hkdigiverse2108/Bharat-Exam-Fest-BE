const mongoose = require('mongoose')

const aboutUsSchema: any = new mongoose.Schema({
    aboutUs: { type: String },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true, versionKey: false })

export const aboutUsModel = mongoose.model('about-us', aboutUsSchema);