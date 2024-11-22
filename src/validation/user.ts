import Joi from "joi";
import { GENDER_TYPES, ROLE_TYPES } from "../utils";

export const addUserSchema = Joi.object().keys({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    gender: Joi.string().valid(...Object.values(GENDER_TYPES)).required(),
    dob: Joi.date().required(),
    city: Joi.string().required(),
    language: Joi.string().optional(),
    referralCode: Joi.string().optional(),
    contact: Joi.object().keys({
        countryCode: Joi.string().optional(),
        mobile: Joi.string().optional()
    }).optional(),
    upscNumber: Joi.string().optional(),
    password: Joi.string().optional(),
    profileImage: Joi.string().optional()
});

export const editUserSchema = Joi.object().keys({
    userId: Joi.string().required(),
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    email: Joi.string().email().optional(),
    gender: Joi.string().valid(...Object.values(GENDER_TYPES)).optional(),
    dob: Joi.date().optional(),
    city: Joi.string().optional(),
    language: Joi.string().optional(),
    referralCode: Joi.string().optional(),
    contact: Joi.object().keys({
        countryCode: Joi.string().optional(),
        mobile: Joi.string().optional()
    }).optional(),
    upscNumber: Joi.string().optional(),
    password: Joi.string().optional(),
    profileImage: Joi.string().optional(),
    isBlocked: Joi.boolean().optional()
});

export const deleteUserSchema = Joi.object().keys({
    id: Joi.string().required(),
});

export const getUserSchema = Joi.object().keys({
    id: Joi.string().required(),
});