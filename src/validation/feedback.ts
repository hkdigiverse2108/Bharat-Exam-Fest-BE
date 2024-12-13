import Joi from "joi";

export const addFeedbackSchema = Joi.object().keys({
    feedback: Joi.string().required(),
});

export const editFeedbackSchema = Joi.object().keys({
    feedbackId: Joi.string().required(),
    feedback: Joi.string().optional(),
});

export const deleteFeedbackSchema = Joi.object().keys({
    id: Joi.string().required(),
});

export const getFeedbackSchema = Joi.object().keys({
    id: Joi.string().required(),
});