import Joi from "joi";

export const addResultReportSchema = Joi.object().keys({
    userId: Joi.string().required(),
    message: Joi.string().optional()
});

export const editResultReportSchema = Joi.object().keys({
    resultReportId: Joi.string().required(),
    userId: Joi.string().optional(),
    message: Joi.string().optional()
});

export const deleteResultReportSchema = Joi.object().keys({
    id: Joi.string().required(),
});

export const getResultReportSchema = Joi.object().keys({
    id: Joi.string().required(),
});