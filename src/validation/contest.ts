import Joi from "joi";

export const addContestSchema = Joi.object().keys({
    name: Joi.string().required(),
    contestTypeId: Joi.string().optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    totalSpots: Joi.number().optional(),
    fees: Joi.number().optional(),
    winningAmountPerFee: Joi.number().optional(),
    winnerPercentage: Joi.number().optional(),
    ranks: Joi.array().items(Joi.object().keys({
        startPlace: Joi.string().optional(),
        endPlace: Joi.string().optional(),
        price: Joi.number().optional()
    })).optional(),
    classesFees: Joi.number().optional(),
    totalQuestions: Joi.number().optional(),
    totalTime: Joi.string().optional(), // e.g., "2 hours"
    totalMarks: Joi.number().optional(),
    classesId: Joi.string().optional()
});

export const editContestSchema = Joi.object().keys({
    contestId: Joi.string().required(),
    name: Joi.string().optional(),
    contestTypeId: Joi.string().optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    totalSpots: Joi.number().optional(),
    fees: Joi.number().optional(),
    winningAmountPerFee: Joi.number().optional(),
    winnerPercentage: Joi.number().optional(),
    ranks: Joi.array().items(Joi.object().keys({
        startPlace: Joi.string().optional(),
        endPlace: Joi.string().optional(),
        price: Joi.number().optional()
    })).optional(),
    classesFees: Joi.number().optional(),
    totalQuestions: Joi.number().optional(),
    totalTime: Joi.string().optional(),
    totalMarks: Joi.number().optional(),
    classesId: Joi.string().optional()
});

export const deleteContestSchema = Joi.object().keys({
    id: Joi.string().required(),
});

export const getContestSchema = Joi.object().keys({
    id: Joi.string().required(),
});