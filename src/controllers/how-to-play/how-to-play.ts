import { howToPlayModel } from "../../database";
import { reqInfo, responseMessage } from "../../helper";
import { apiResponse } from "../../utils";
import { addHowToPlaySchema, deleteHowToPlaySchema, editHowToPlaySchema, getHowToPlaySchema } from "../../validation";

const ObjectId = require('mongoose').Types.ObjectId;

export const add_how_to_play = async (req, res) => {
    reqInfo(req)
    let { user } = req.headers
    try {
        const { error, value } = addHowToPlaySchema.validate(req.body)
        if (error) {
            return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))
        }

        value.createdBy = new ObjectId(user._id)
        value.updatedBy = new ObjectId(user._id)

        const response = await new howToPlayModel(value).save();
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.addDataError, {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.addDataSuccess("how to play"), response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const edit_how_to_play_by_id = async (req, res) => {
    reqInfo(req)
    let { user } = req.headers
    try {
        const { error, value } = editHowToPlaySchema.validate(req.body)
        if (error) {
            return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))
        }
        value.updatedBy = new ObjectId(user._id)

        const response = await howToPlayModel.findOneAndUpdate({ _id: new ObjectId(value.bannerId) }, value, { new: true })
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.updateDataError("how to play"), {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.updateDataSuccess("how to play"), response, {}))
    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const delete_how_to_play_by_id = async (req, res) => {
    reqInfo(req)
    try {
        const { error, value } = deleteHowToPlaySchema.validate(req.params)
        if (error) {
            return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))
        }

        const response = await howToPlayModel.findOneAndUpdate({ _id: new ObjectId(value.id) }, { isDeleted: true }, { new: true })
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("how to play"), {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.deleteDataSuccess("how to play"), response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const get_all_how_to_play = async (req, res) => {
    reqInfo(req)
    let match: any = {}, { page, limit } = req.query
    try {
        page = Number(page)
        limit = Number(limit)

        match.isDeleted = false

        const response = await howToPlayModel.aggregate([
            { $match: match },
            {
                $facet: {
                    data: [
                        { $sort: { createdAt: -1 } },
                        { $skip: (page - 1) * limit },
                        { $limit: limit }
                    ],
                    data_count: [{ $count: "count" }]
                }
            }
        ])

        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("how to play"), {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("how to play"), {
            how_to_play_data: response[0]?.data || [],
            totalData: response[0]?.data_count[0]?.count || 0,
            state: {
                page: page,
                limit: limit,
                page_limit: Math.ceil(response[0]?.data_count[0]?.count / limit) || 1,
            },
        }, {}))
    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const get_how_to_play_by_id = async (req, res) => {
    reqInfo(req)
    try {
        const { error, value } = getHowToPlaySchema.validate(req.params)
        if (error) {
            return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))
        }

        const response = await howToPlayModel.findOne({ _id: new ObjectId(value.id) })
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("how to play"), {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("how to play"), response, {}))
    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}