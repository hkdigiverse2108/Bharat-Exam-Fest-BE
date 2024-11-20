import Joi from "joi";

export const addContestTypeSchema = Joi.object().keys({
    name: Joi.string().required(),
});

export const editContestTypeSchema = Joi.object().keys({
    contestTypeId: Joi.string().required(),
    name: Joi.string().optional(),
});

export const deleteContestTypeSchema = Joi.object().keys({
    id: Joi.string().required(),
});

export const getContestTypeSchema = Joi.object().keys({
    id: Joi.string().required(),
});