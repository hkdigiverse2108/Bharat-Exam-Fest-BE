import Joi from "joi";

export const addSubTopicSchema = Joi.object().keys({
    name: Joi.string().required(),
});

export const editSubTopicSchema = Joi.object().keys({
    subTopicId: Joi.string().required(),
    name: Joi.string().optional(),
});

export const deleteSubTopicSchema = Joi.object().keys({
    id: Joi.string().required(),
});

export const getSubTopicSchema = Joi.object().keys({
    id: Joi.string().required(),
});