const mongoose = require('mongoose')

const illegalitySchema: any = new mongoose.Schema({
    illegality: { type: String },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true, versionKey: false })

export const illegalityModel = mongoose.model('illegality', illegalitySchema);