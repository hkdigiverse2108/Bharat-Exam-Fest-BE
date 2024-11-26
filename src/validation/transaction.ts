import Joi from "joi";
import { TRANSACTION_STATUS, TRANSACTION_TYPE } from "../utils";

export const addTransactionSchema = Joi.object().keys({
    contestId: Joi.string().required(),
    amount: Joi.number().required(),
    transactionType: Joi.string().optional().valid(...Object.values(TRANSACTION_TYPE)),
    transactionStatus: Joi.string().optional().valid(...Object.values(TRANSACTION_STATUS)),
    transactionId: Joi.string().optional(),
});

export const deleteTransactionSchema = Joi.object().keys({
    id: Joi.string().required(),
});

export const getTransactionSchema = Joi.object().keys({
    id: Joi.string().required(),
});