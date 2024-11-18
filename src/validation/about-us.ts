import Joi from "joi";

export const addEditAboutUsSchema = Joi.object().keys({
    aboutUs: Joi.string().required()
})