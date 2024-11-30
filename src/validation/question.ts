import Joi from "joi";
import { QUESTION_ANSWER, QUESTION_TYPE, TYPE_QUESTION } from "../utils";

export const addQuestionSchema = Joi.object().keys({
    subjectId: Joi.string().required(),
    classesId: Joi.string().required(),
    subtopicIds: Joi.array().items(Joi.string()).required(),
    questionBank: Joi.string().optional(),
    type: Joi.string().valid(...Object.values(TYPE_QUESTION)).required(),
    questionType: Joi.string().valid(...Object.values(QUESTION_TYPE)).required(),
    englishQuestion: Joi.object().keys({
        question: Joi.string().required(),
        statementQuestion: Joi.array().items(Joi.string()).optional(),
        pairQuestion: Joi.object().unknown(true).optional(),
        lastQuestion: Joi.string().optional(),
        options: Joi.object().keys({
            A: Joi.string().optional(),
            B: Joi.string().optional(),
            C: Joi.string().optional(),
            D: Joi.string().optional()
        }).required(),
        answer: Joi.string().valid(...Object.values(QUESTION_ANSWER)).required(),
        solution: Joi.string().optional()
    }).required(),
    hindiQuestion: Joi.object().keys({
        question: Joi.string().required(),
        statementQuestion: Joi.array().items(Joi.string()).optional(),
        pairQuestion: Joi.object().unknown(true).optional(),
        lastQuestion: Joi.string().optional(),
        options: Joi.object().keys({
            A: Joi.string().optional(),
            B: Joi.string().optional(),
            C: Joi.string().optional(),
            D: Joi.string().optional()
        }).required(),
        answer: Joi.string().valid(...Object.values(QUESTION_ANSWER)).required(),
        solution: Joi.string().optional()
    }).required()
});

export const editQuestionSchema = Joi.object().keys({
    questionId: Joi.string().required(),
    subjectId: Joi.string().optional(),
    classesId: Joi.string().optional(),
    subtopicIds: Joi.array().items(Joi.string()).optional(),
    questionBank: Joi.string().optional(),
    type: Joi.string().valid(...Object.values(TYPE_QUESTION)).optional(),
    questionType: Joi.string().valid(...Object.values(QUESTION_TYPE)).optional(),
    englishQuestion: Joi.object().keys({
        question: Joi.string().optional(),
        statementQuestion: Joi.array().items(Joi.string()).optional(),
        pairQuestion: Joi.object().unknown(true).optional(),
        lastQuestion: Joi.string().optional(),
        options: Joi.object().keys({
            A: Joi.string().optional(),
            B: Joi.string().optional(),
            C: Joi.string().optional(),
            D: Joi.string().optional()
        }).required(),
        answer: Joi.string().valid(...Object.values(QUESTION_ANSWER)).optional(),
        solution: Joi.string().optional()
    }).required(),
    hindiQuestion: Joi.object().keys({
        question: Joi.string().optional(),
        statementQuestion: Joi.array().items(Joi.string()).optional(),
        pairQuestion: Joi.object().unknown(true).optional(),
        lastQuestion: Joi.string().optional(),
        options: Joi.object().keys({
            A: Joi.string().optional(),
            B: Joi.string().optional(),
            C: Joi.string().optional(),
            D: Joi.string().optional()
        }).required(),
        answer: Joi.string().valid(...Object.values(QUESTION_ANSWER)).optional(),
        solution: Joi.string().optional()
    }).required()
});

export const deleteQuestionSchema = Joi.object().keys({
    id: Joi.string().required(),
});

export const getQuestionSchema = Joi.object().keys({
    id: Joi.string().required(),
});