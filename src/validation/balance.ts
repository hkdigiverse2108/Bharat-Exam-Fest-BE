import Joi from "joi";
import { BALANCE_STATUS, BALANCE_TYPE } from "../utils";

export const addBalanceSchema = Joi.object().keys({
    userId: Joi.string().required(),
    name: Joi.string().optional(),
    amount: Joi.number().optional(),
    status: Joi.string().valid(...Object.values(BALANCE_STATUS)).optional(),
    type: Joi.string().valid(...Object.values(BALANCE_TYPE)).optional()
});