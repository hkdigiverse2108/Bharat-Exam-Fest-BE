import { BANNER_TYPE } from "../../utils";

const mongoose = require('mongoose')

const bannerSchema: any = new mongoose.Schema({
    image: { type: String },
    type: { type: String, enum: Object.values(BANNER_TYPE) },
    link: { type: String },
    isDeleted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, default: null }
}, { timestamps: true, versionKey: false })

export const bannerModel = mongoose.model('banner', bannerSchema);