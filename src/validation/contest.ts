import Joi from "joi";

export const addContestSchema = Joi.object().keys({
    contestName: Joi.string().required(),
    contestType: Joi.string().required(),
    contestStartDate: Joi.date().required(),
    contestEndDate: Joi.date().required(),
    totalSpots: Joi.number().required(),
    fees: Joi.number().required(),
    winningAmountPerFee: Joi.number().required(),
    winnerPercentage: Joi.number().required(),
    ranks: Joi.array().items(Joi.object().keys({
        place: Joi.string().required()
    })).optional(),
    totalQuestions: Joi.number().required(),
    totalTime: Joi.string().required(), // e.g., "2 hours"
    totalMarks: Joi.number().required(),
});

export const editContestSchema = Joi.object().keys({
    contestId: Joi.string().required(),
    contestName: Joi.string().optional(),
    contestType: Joi.string().optional(),
    contestStartDate: Joi.date().optional(),
    contestEndDate: Joi.date().optional(),
    totalSpots: Joi.number().optional(),
    fees: Joi.number().optional(),
    winningAmountPerFee: Joi.number().optional(),
    winnerPercentage: Joi.number().optional(),
    ranks: Joi.array().items(Joi.object().keys({
        place: Joi.string().optional()
    })).optional(),
    totalQuestions: Joi.number().optional(),
    totalTime: Joi.string().optional(),
    totalMarks: Joi.number().optional(),
});

export const deleteContestSchema = Joi.object().keys({
    id: Joi.string().required(),
});

export const getContestSchema = Joi.object().keys({
    id: Joi.string().required(),
});