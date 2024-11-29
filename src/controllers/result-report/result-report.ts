import { resultReportModel } from "../../database";
import { reqInfo, responseMessage } from "../../helper";
import { apiResponse, ROLE_TYPES } from "../../utils";
import { addResultReportSchema, deleteResultReportSchema, editResultReportSchema, getResultReportSchema } from "../../validation";

const ObjectId = require('mongoose').Types.ObjectId;

export const add_result_report = async (req, res) => {
    reqInfo(req)
    let { user } = req.headers
    try {
        const { error, value } = addResultReportSchema.validate(req.body)
        if (error) {
            return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))
        }

        value.createdBy = new ObjectId(user._id)
        value.updatedBy = new ObjectId(user._id)

        if (user.userType === ROLE_TYPES.USER) {
            value.userId = new ObjectId(user._id)
        }

        const response = await new resultReportModel(value).save();
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.addDataError, {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.addDataSuccess("result report"), response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const edit_result_report_by_id = async (req, res) => {
    reqInfo(req)
    let { user } = req.headers
    try {
        const { error, value } = editResultReportSchema.validate(req.body)
        if (error) {
            return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))
        }
        value.updatedBy = new ObjectId(user._id)

        const response = await resultReportModel.findOneAndUpdate({ _id: new ObjectId(value.resultReportId) }, value, { new: true })
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.updateDataError("result report"), {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.updateDataSuccess("result report"), response, {}))
    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const delete_result_report_by_id = async (req, res) => {
    reqInfo(req)
    try {
        const { error, value } = deleteResultReportSchema.validate(req.params)
        if (error) {
            return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))
        }

        const response = await resultReportModel.findOneAndUpdate({ _id: new ObjectId(value.id) }, { isDeleted: true }, { new: true })
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("result report"), {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.deleteDataSuccess("result report"), response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const get_all_result_report = async (req, res) => {
    reqInfo(req)
    let match: any = {}, { page, limit } = req.query, { user } = req.headers
    try {
        page = Number(page)
        limit = Number(limit)

        if (user.userType === ROLE_TYPES.USER) {
            match.userId = new ObjectId(user._id)
        }

        match.isDeleted = false
        const response = await resultReportModel.aggregate([
            { $match: match },
            {
                $lookup: {
                    from: 'contests',
                    let: { contestId: "$contestId" },
                    pipeline: [
                        { $match: { $expr: { $and: [{ $eq: ["$_id", "$$contestId"] }] } } },
                        { $project: { createdBy: 0, updatedBy: 0, createdAt: 0, updatedAt: 0, isBlocked: 0, isDeleted: 0 } },
                    ],
                    as: 'contest'
                }
            },
            {
                $unwind: { path: "$contest", preserveNullAndEmptyArrays: true }
            },
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

        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("result report"), {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("result report"), {
            result_report_data: response[0]?.data || [],
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

export const get_result_report_by_id = async (req, res) => {
    reqInfo(req)
    try {
        const { error, value } = getResultReportSchema.validate(req.params)
        if (error) {
            return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))
        }

        const response = await resultReportModel.findOne({ _id: new ObjectId(value.id) })
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("result report"), {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("result report"), response, {}))
    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}