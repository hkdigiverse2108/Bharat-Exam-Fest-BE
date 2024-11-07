import { questionAnswer, questionType } from "../../utils";

const mongoose = require('mongoose')

const questionSchema: any = new mongoose.Schema({
    subject: { type: String, required: true },
    subtopic: { type: String, required: true },
    questionBank: { type: String, required: true },
    type: { type: String, enum: Object.values(questionType), required: true },
    englishQuestion: {
        question: { type: String, required: true },
        options: {
            A: { type: Boolean, default: false },
            B: { type: Boolean, default: false },
            C: { type: Boolean, default: false },
            D: { type: Boolean, default: false }
        },
        answer: { type: String, enum: Object.values(questionAnswer), required: true },
        solution: { type: String, required: true }
    },
    hindiQuestion: {
        question: { type: String, required: true },
        options: {
            A: { type: Boolean, default: false },
            B: { type: Boolean, default: false },
            C: { type: Boolean, default: false },
            D: { type: Boolean, default: false }
        },
        answer: { type: String, enum: Object.values(questionAnswer), required: true },
        solution: { type: String, required: true }
    },
    isDeleted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, default: null }
}, { timestamps: true, versionKey: false })

export const questionModel = mongoose.model('question', questionSchema);