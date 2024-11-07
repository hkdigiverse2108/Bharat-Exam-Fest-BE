import Joi from "joi";
import { GENDER_TYPES, ROLE_TYPES } from "../utils";

export const signUpSchema = Joi.object().keys({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    contact: Joi.object().keys({
        countryCode: Joi.string().optional(),
        mobile: Joi.string().optional()
    }).optional(),
    password: Joi.string().min(6).max(15).optional(),
});

export const loginSchema = Joi.object().keys({
    uniqueId: Joi.string().email().required(),
    password: Joi.string().required(),
    userType: Joi.string().required(),
});

export const resetPasswordSchema = Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

export const otpVerifySchema = Joi.object().keys({
    otp: Joi.string().pattern(/^\d{6}$/).required(),
});

export const forgotPasswordSchema = Joi.object().keys({
    email: Joi.string().email().required(),
});