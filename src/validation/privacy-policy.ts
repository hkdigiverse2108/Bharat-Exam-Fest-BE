import Joi from "joi";

export const addEditPrivacyPolicySchema = Joi.object().keys({
    privacyPolicy: Joi.string().required()
})