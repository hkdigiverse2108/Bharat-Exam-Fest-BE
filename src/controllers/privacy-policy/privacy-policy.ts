import { reqInfo, responseMessage } from "../../helper";
import { privacyPolicyModel } from "../../database/models";
import { apiResponse } from "../../utils";
import { addEditPrivacyPolicySchema } from "../../validation";

let ObjectId = require('mongoose').Types.ObjectId

export const add_edit_privacy_policy = async (req, res) => {
    reqInfo(req)
    let { user } = req.headers

    try {
        const { error, value } = addEditPrivacyPolicySchema.validate(req.body)
        if (error) return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))

        const response = await privacyPolicyModel.findOneAndUpdate({ isDeleted: false }, value, { new: true, upsert: true })
        return res.status(200).json(new apiResponse(200, responseMessage?.updateDataSuccess("privacy policy"), response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const get_privacy_policy = async (req, res) => {
    reqInfo(req)
    try {
        const response = await privacyPolicyModel.findOne({ isDeleted: false })
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("privacy policy"), {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("privacy policy"), response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}