import { kycModel } from "../../database";
import { reqInfo, responseMessage } from "../../helper";
import { apiResponse } from "../../utils";
import { addKycSchema, deleteKycSchema, editKycSchema, getKycSchema } from "../../validation";

const ObjectId = require('mongoose').Types.ObjectId;

export const add_kyc = async (req, res) => {
    reqInfo(req)
    let { user } = req.headers
    try {
        const { error, value } = addKycSchema.validate(req.body)
        if (error) {
            return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))
        }

        value.createdBy = new ObjectId(user._id)
        value.updatedBy = new ObjectId(user._id)

        let isExist = await kycModel.findOne({ idNumber: value?.idNumber, isDeleted: false })
        if (isExist) return res.status(404).json(new apiResponse(404, responseMessage?.dataAlreadyExist("number"), {}, {}))

        const response = await new kycModel(value).save();
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.addDataError, {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.addDataSuccess("kyc"), response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const edit_kyc_by_id = async (req, res) => {
    reqInfo(req)
    let { user } = req.headers
    try {
        const { error, value } = editKycSchema.validate(req.body)
        if (error) {
            return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))
        }
        value.updatedBy = new ObjectId(user._id)

        let isExist = await kycModel.findOne({ idNumber: value.idNumber, isDeleted: false })
        if (isExist) return res.status(404).json(new apiResponse(404, responseMessage?.dataAlreadyExist("Number"), {}, {}))

        const response = await kycModel.findOneAndUpdate({ _id: new ObjectId(value.kycId) }, value, { new: true })
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.updateDataError("kyc"), {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.updateDataSuccess("kyc"), response, {}))
    } catch (error) {
        console.log("error", error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const delete_kyc_by_id = async (req, res) => {
    reqInfo(req)
    try {
        const { error, value } = deleteKycSchema.validate(req.params)
        if (error) {
            return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))
        }

        const response = await kycModel.findOneAndUpdate({ _id: new ObjectId(value.id) }, { isDeleted: true }, { new: true })
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("kyc"), {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.deleteDataSuccess("kyc"), response, {}))
    } catch (error) {
        console.log("error", error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const get_all_kyc = async (req, res) => {
    reqInfo(req)
    let match: any = {}, { page, limit, statusFilter, userFilter } = req.query
    try {
        page = Number(page)
        limit = Number(limit)

        match.isDeleted = false

        if (statusFilter) match.status = statusFilter

        if (userFilter) match.userId = new ObjectId(userFilter)

        const response = await kycModel.aggregate([
            { $match: match },
            {
                $lookup: {
                    from: 'users',
                    let: { userId: "$userId" },
                    pipeline: [
                        { $match: { $expr: { $and: [{ $eq: ["$_id", "$$userId"] }] } } }
                    ],
                    as: 'user'
                }
            },
            {
                $unwind: { path: "$user", preserveNullAndEmptyArrays: true }
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

        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("kyc"), {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("kyc"), {
            kyc_data: response[0]?.data || [],
            totalData: response[0]?.data_count[0]?.count || 0,
            state: {
                page: page,
                limit: limit,
                page_limit: Math.ceil(response[0]?.data_count[0]?.count / limit) || 1,
            },
        }, {}))
    } catch (error) {
        console.log("error", error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const get_kyc_by_id = async (req, res) => {
    reqInfo(req)
    try {
        const { error, value } = getKycSchema.validate(req.params)
        if (error) {
            return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))
        }

        const response = await kycModel.findOne({ _id: new ObjectId(value.id) })
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("kyc"), {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("kyc"), response, {}))
    } catch (error) {
        console.log("error", error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}