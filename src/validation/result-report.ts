import Joi from "joi";

export const addResultReportSchema = Joi.object().keys({
    qaId: Joi.string().optional(),
    contestId: Joi.string().optional(),
    questionId: Joi.string().optional(),
    message: Joi.string().optional()
});

export const editResultReportSchema = Joi.object().keys({
    resultReportId: Joi.string().required(),
    contestId: Joi.string().optional(),
    qaId: Joi.string().optional(),
    questionId: Joi.string().optional(),
    message: Joi.string().optional()
});

export const deleteResultReportSchema = Joi.object().keys({
    id: Joi.string().required(),
});

export const getResultReportSchema = Joi.object().keys({
    id: Joi.string().required(),
});