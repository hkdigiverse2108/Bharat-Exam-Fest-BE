import Joi from "joi";

export const addSubjectSchema = Joi.object().keys({
    name: Joi.string().required(),
    image: Joi.string().optional(),
    subTopicIds: Joi.array().items(Joi.string()).optional(),
});

export const editSubjectSchema = Joi.object().keys({
    subjectId: Joi.string().required(),
    name: Joi.string().optional(),
    image: Joi.string().optional(),
    subTopicIds: Joi.array().items(Joi.string()).optional(),
});

export const deleteSubjectSchema = Joi.object().keys({
    id: Joi.string().required(),
});

export const getSubjectSchema = Joi.object().keys({
    id: Joi.string().required(),
});