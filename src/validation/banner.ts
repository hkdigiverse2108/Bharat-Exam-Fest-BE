import Joi from "joi";
import { GENDER_TYPES, ROLE_TYPES } from "../utils";

export const addBannerSchema = Joi.object().keys({
    image: Joi.string().required()
});

export const editBannerSchema = Joi.object().keys({
    bannerId: Joi.string().required(),
    image: Joi.string().optional()
});

export const deleteBannerSchema = Joi.object().keys({
    id: Joi.string().required(),
});

export const getBannerSchema = Joi.object().keys({
    id: Joi.string().required(),
});