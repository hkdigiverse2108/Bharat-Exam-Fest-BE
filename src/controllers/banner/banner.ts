import { bannerModel } from "../../database";
import { reqInfo, responseMessage } from "../../helper";
import { apiResponse } from "../../utils";
import { addBannerSchema, deleteBannerSchema, editBannerSchema, getBannerSchema } from "../../validation";

const ObjectId = require('mongoose').Types.ObjectId;

export const add_banner = async (req, res) => {
    reqInfo(req)
    let { user } = req.headers
    try {
        const { error, value } = addBannerSchema.validate(req.body)
        if (error) {
            return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))
        }

        value.createdBy = new ObjectId(user._id)
        value.updatedBy = new ObjectId(user._id)

        const response = await new bannerModel(value).save();
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.addDataError, {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.addDataSuccess("banner"), response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const edit_banner_by_id = async (req, res) => {
    reqInfo(req)
    let { user } = req.headers
    try {
        const { error, value } = editBannerSchema.validate(req.body)
        if (error) {
            return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))
        }
        value.updatedBy = new ObjectId(user._id)

        const response = await bannerModel.findOneAndUpdate({ _id: new ObjectId(value.bannerId) }, value, { new: true })
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.updateDataError("banner"), {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.updateDataSuccess("banner"), response, {}))
    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const delete_banner_by_id = async (req, res) => {
    reqInfo(req)
    try {
        const { error, value } = deleteBannerSchema.validate(req.params)
        if (error) {
            return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))
        }

        const response = await bannerModel.findOneAndUpdate({ _id: new ObjectId(value.id) }, { isDeleted: true }, { new: true })
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("classes"), {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.deleteDataSuccess("classes"), response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const get_all_banner = async (req, res) => {
    reqInfo(req)
    let match: any = {}
    try {
        match.isDeleted = false

        const response = await bannerModel.aggregate([
            { $match: match },
            {
                $facet: {
                    data: [
                        { $sort: { createdAt: -1 } }
                    ],
                    data_count: [{ $count: "count" }]
                }
            }
        ])

        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("banner"), {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("banner"), {
            banner_data: response[0]?.data || [],
            totalData: response[0]?.data_count[0]?.count || 0
        }, {}))
    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const get_banner_by_id = async (req, res) => {
    reqInfo(req)
    try {
        const { error, value } = getBannerSchema.validate(req.params)
        if (error) {
            return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))
        }

        const response = await bannerModel.findOne({ _id: new ObjectId(value.id) })
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("banner"), {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("banner"), response, {}))
    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}