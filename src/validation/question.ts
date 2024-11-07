import Joi from "joi";
import { questionAnswer, questionType } from "../utils";

export const addQuestionSchema = Joi.object().keys({
    subjectId: Joi.string().required(),
    subtopic: Joi.string().required(),
    questionBank: Joi.string().required(),
    type: Joi.string().valid(...Object.values(questionType)).required(),
    englishQuestion: Joi.object().keys({
        question: Joi.string().required(),
        options: Joi.object().keys({
            A: Joi.boolean().required(),
            B: Joi.boolean().required(),
            C: Joi.boolean().required(),
            D: Joi.boolean().required()
        }).required(),
        answer: Joi.string().valid(...Object.values(questionAnswer)).required(),
        solution: Joi.string().required()
    }).required(),
    hindiQuestion: Joi.object().keys({
        question: Joi.string().required(),
        options: Joi.object().keys({
            A: Joi.boolean().required(),
            B: Joi.boolean().required(),
            C: Joi.boolean().required(),
            D: Joi.boolean().required()
        }).required(),
        answer: Joi.string().valid(...Object.values(questionAnswer)).required(),
        solution: Joi.string().required()
    }).required()
});

export const editQuestionSchema = Joi.object().keys({
    questionId: Joi.string().required(),
    subjectId: Joi.string(),
    subtopic: Joi.string(),
    questionBank: Joi.string(),
    type: Joi.string().valid(...Object.values(questionType)).optional(),
    englishQuestion: Joi.object().keys({
        question: Joi.string().required(),
        options: Joi.object().keys({
            A: Joi.boolean().optional(),
            B: Joi.boolean().optional(),
            C: Joi.boolean().optional(),
            D: Joi.boolean().optional()
        }).required(),
        answer: Joi.string().valid(...Object.values(questionAnswer)).optional(),
        solution: Joi.string().optional()
    }).required(),
    hindiQuestion: Joi.object().keys({
        question: Joi.string().optional(),
        options: Joi.object().keys({
            A: Joi.boolean().optional(),
            B: Joi.boolean().optional(),
            C: Joi.boolean().optional(),
            D: Joi.boolean().optional()
        }).required(),
        answer: Joi.string().valid(...Object.values(questionAnswer)).optional(),
        solution: Joi.string().optional()
    }).required()
});

export const deleteQuestionSchema = Joi.object().keys({
    id: Joi.string().required(),
});

export const getQuestionSchema = Joi.object().keys({
    id: Joi.string().required(),
});