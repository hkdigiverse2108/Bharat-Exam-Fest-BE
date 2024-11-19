import Joi from "joi";
import { ID_PROOF, KYC_STATUS } from "../utils";

export const addKycSchema = Joi.object().keys({
    idNumber: Joi.string().required(),
    idProof: Joi.string().optional().valid(...Object.values(ID_PROOF)),
    frontSideImage: Joi.string().optional(),
    backSideImage: Joi.string().optional(),
    status: Joi.string().optional().valid(...Object.values(KYC_STATUS)),
    userId: Joi.string().optional()
});

export const editKycSchema = Joi.object().keys({
    kycId: Joi.string().required(),
    idNumber: Joi.string().optional(),
    idProof: Joi.string().optional().valid(...Object.values(ID_PROOF)),
    frontSideImage: Joi.string().optional(),
    backSideImage: Joi.string().optional(),
    status: Joi.string().optional().valid(...Object.values(KYC_STATUS)),
    userId: Joi.string().optional()
});

export const deleteKycSchema = Joi.object().keys({
    id: Joi.string().required(),
});

export const getKycSchema = Joi.object().keys({
    id: Joi.string().required(),
});