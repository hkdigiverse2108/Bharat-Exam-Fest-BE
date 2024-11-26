import { transactionModel } from "../../database";
import { reqInfo, responseMessage } from "../../helper";
import { apiResponse, ROLE_TYPES } from "../../utils";
import { addTransactionSchema, deleteTransactionSchema, getTransactionSchema } from "../../validation";

const ObjectId = require('mongoose').Types.ObjectId;

export const add_transaction = async (req, res) => {
    reqInfo(req)
    let { user } = req.headers
    try {
        const { error, value } = addTransactionSchema.validate(req.body)
        if (error) {
            return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))
        }

        value.createdBy = new ObjectId(user?._id)
        value.updatedBy = new ObjectId(user?._id)

        if (user.userType === ROLE_TYPES.USER) {
            value.userId = new ObjectId(user?._id)
            if (value.walletBalance >= value.amount) {
                value.walletBalance -= value.amount
            } else {
                return res.status(404).json(new apiResponse(404, responseMessage?.insufficientBalance, {}, {}))
            }
        }

        const response = await new transactionModel(value).save();
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.addDataError, {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.addDataSuccess("transaction"), response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const delete_transaction_by_id = async (req, res) => {
    reqInfo(req)
    try {
        const { error, value } = deleteTransactionSchema.validate(req.params)
        if (error) {
            return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))
        }

        const response = await transactionModel.findOneAndUpdate({ _id: new ObjectId(value.id) }, { isDeleted: true }, { new: true })
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("transaction"), {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.deleteDataSuccess("transaction"), response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const get_all_transaction = async (req, res) => {
    reqInfo(req)
    let match: any = {}, { page, limit, search } = req.query
    try {
        page = Number(page)
        limit = Number(limit)

        match.isDeleted = false

        if (search) {
            match.$or = [
                { name: { $regex: search, $options: 'i' } }
            ]
        }

        const response = await transactionModel.aggregate([
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
        ]);

        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("transaction"), {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("transaction"), {
            transaction_data: response[0]?.data || [],
            totalData: response[0]?.data_count[0]?.count || 0,
            state: {
                page: page,
                limit: limit,
                page_limit: Math.ceil(response[0]?.data_count[0]?.count / limit) || 1,
            },
        }, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const get_transaction_by_id = async (req, res) => {
    reqInfo(req)
    try {
        const { error, value } = getTransactionSchema.validate(req.params)
        if (error) {
            return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))
        }

        const response = await transactionModel.findOne({ _id: new ObjectId(value.id) })
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("transaction"), {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("transaction"), response, {}))
    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}