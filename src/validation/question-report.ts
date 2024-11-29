import Joi from "joi";

export const addQuestionReportSchema = Joi.object().keys({
    contestId: Joi.string().required(),
    subjectId: Joi.string().required(),
    questionId: Joi.string().required(),
    message: Joi.string().optional()
});

export const editQuestionReportSchema = Joi.object().keys({
    questionReportId: Joi.string().required(),
    contestId: Joi.string().optional(),
    subjectId: Joi.string().optional(),
    questionId: Joi.string().optional(),
    message: Joi.string().optional()
});

export const deleteQuestionReportSchema = Joi.object().keys({
    id: Joi.string().required(),
});

export const getQuestionReportSchema = Joi.object().keys({
    id: Joi.string().required(),
});