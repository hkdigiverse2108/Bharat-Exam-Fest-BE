import { QUESTION_ANSWER, QUESTION_TYPE, TYPE_QUESTION } from "../../utils";

const mongoose = require('mongoose')

const questionSchema: any = new mongoose.Schema({
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "subject" },
    classesId: { type: mongoose.Schema.Types.ObjectId, ref: "classes" },
    subtopicIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "sub-topic" }],
    questionBank: { type: String },
    type: { type: String, enum: Object.values(TYPE_QUESTION) },
    questionType: { type: String, enum: Object.values(QUESTION_TYPE) },
    englishQuestion: {
        question: { type: String },
        statementQuestion: { type: Array },
        pairQuestion: { type: Array },
        lastQuestion: { type: String },
        options: {
            A: { type: String },
            B: { type: String },
            C: { type: String },
            D: { type: String }
        },
        answer: { type: String, enum: Object.values(QUESTION_ANSWER) },
        solution: { type: String }
    },
    hindiQuestion: {
        question: { type: String },
        statementQuestion: { type: Array },
        pairQuestion: { type: Array },
        lastQuestion: { type: String },
        options: {
            A: { type: String },
            B: { type: String },
            C: { type: String },
            D: { type: String }
        },
        answer: { type: String, enum: Object.values(QUESTION_ANSWER), required: true },
        solution: { type: String, required: true }
    },
    isDeleted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, default: null }
}, { timestamps: true, versionKey: false })

export const questionModel = mongoose.model('question', questionSchema);