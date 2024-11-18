import Joi from "joi";

export const addEditIllegalitySchema = Joi.object().keys({
    illegality: Joi.string().required()
})