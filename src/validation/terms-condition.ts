import Joi from "joi";

export const addEditTermsConditionSchema = Joi.object().keys({
    termsCondition: Joi.string().required()
})