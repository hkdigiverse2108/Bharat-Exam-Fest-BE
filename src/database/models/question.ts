import { questionAnswer, questionType, typeQuestion } from "../../utils";

const mongoose = require('mongoose')

const questionSchema: any = new mongoose.Schema({
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "subject" },
    classesId: { type: mongoose.Schema.Types.ObjectId, ref: "classes" },
    subtopicId: { type: mongoose.Schema.Types.ObjectId, ref: "sub-topic" },
    questionBank: { type: String },
    type: { type: String, enum: Object.values(typeQuestion) },
    questionType: { type: String, enum: Object.values(questionType) },
    englishQuestion: {
        question: { type: String },
        options: {
            A: { type: String, default: false },
            B: { type: String, default: false },
            C: { type: String, default: false },
            D: { type: String, default: false }
        },
        answer: { type: String, enum: Object.values(questionAnswer) },
        solution: { type: String }
    },
    hindiQuestion: {
        question: { type: String, required: true },
        options: {
            A: { type: String, default: false },
            B: { type: String, default: false },
            C: { type: String, default: false },
            D: { type: String, default: false }
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