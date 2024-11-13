import Joi from "joi";
import { GENDER_TYPES, ROLE_TYPES } from "../utils";

export const addHowToPlaySchema = Joi.object().keys({
    title: Joi.string().required(),
    link: Joi.string().required(),
    image: Joi.string().required()
});

export const editHowToPlaySchema = Joi.object().keys({
    howToPlayId: Joi.string().required(),
    title: Joi.string().optional(),
    link: Joi.string().optional(),
    image: Joi.string().optional()
});

export const deleteHowToPlaySchema = Joi.object().keys({
    id: Joi.string().required(),
});

export const getHowToPlaySchema = Joi.object().keys({
    id: Joi.string().required(),
});