import { reqInfo, responseMessage } from "../../helper";
import { termsConditionModel } from "../../database/models";
import { apiResponse } from "../../utils";
import { addEditTermsConditionSchema } from "../../validation";

export const add_edit_terms_condition = async (req, res) => {
    reqInfo(req)
    let { user } = req.headers

    try {
        const { error, value } = addEditTermsConditionSchema.validate(req.body)

        if (error) return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))

        const response = await termsConditionModel.findOneAndUpdate({ isDeleted: false }, value, { new: true, upsert: true })
        return res.status(200).json(new apiResponse(200, responseMessage?.updateDataSuccess("terms condition"), response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const get_terms_condition = async (req, res) => {
    reqInfo(req)
    try {
        const response = await termsConditionModel.findOne({ isDeleted: false })
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("terms condition"), {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("terms condition"), response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}