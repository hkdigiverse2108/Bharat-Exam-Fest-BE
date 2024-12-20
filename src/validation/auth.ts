import Joi from "joi";

export const signUpSchema = Joi.object().keys({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    contact: Joi.object().keys({
        countryCode: Joi.string().optional(),
        mobile: Joi.string().optional()
    }).optional(),
    password: Joi.string().optional(),
});

export const loginSchema = Joi.object().keys({
    uniqueId: Joi.string().required(),
    countryCode: Joi.string().optional(),
    password: Joi.string().required(),
    userType: Joi.string().required(),
});

export const resetPasswordSchema = Joi.object().keys({
    uniqueId: Joi.string().required(),
    password: Joi.string().required(),
    userType: Joi.string().required(),
});

export const otpVerifySchema = Joi.object().keys({
    otp: Joi.string().pattern(/^\d{6}$/).required(),
    userType: Joi.string().required(),
});

export const forgotPasswordSchema = Joi.object().keys({
    uniqueId: Joi.string().required(),
    userType: Joi.string().required(),
});