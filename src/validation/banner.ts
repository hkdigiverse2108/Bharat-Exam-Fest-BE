import Joi from "joi";
import { BANNER_TYPE } from "../utils";

export const addBannerSchema = Joi.object().keys({
    image: Joi.string().required(),
    type: Joi.string().valid(...Object.values(BANNER_TYPE)).required(),
    link: Joi.string().optional()
});

export const editBannerSchema = Joi.object().keys({
    bannerId: Joi.string().required(),
    image: Joi.string().optional(),
    type: Joi.string().valid(...Object.values(BANNER_TYPE)).optional(),
    link: Joi.string().optional()
});

export const deleteBannerSchema = Joi.object().keys({
    id: Joi.string().required(),
});

export const getBannerSchema = Joi.object().keys({
    id: Joi.string().required(),
});