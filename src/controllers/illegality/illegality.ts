import { reqInfo, responseMessage } from "../../helper";
import { illegalityModel } from "../../database/models";
import { apiResponse } from "../../utils";
import { addEditIllegalitySchema } from "../../validation";


export const add_edit_illegality = async (req, res) => {
    reqInfo(req)

    try {
        const { error, value } = addEditIllegalitySchema.validate(req.body)
        if (error) return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))

        const response = await illegalityModel.findOneAndUpdate({ isDeleted: false }, value, { new: true, upsert: true })
        return res.status(200).json(new apiResponse(200, responseMessage?.updateDataSuccess("illegality"), response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const get_illegality = async (req, res) => {
    reqInfo(req)
    try {
        const response = await illegalityModel.findOne({ isDeleted: false })
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("illegality"), {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("illegality"), response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}