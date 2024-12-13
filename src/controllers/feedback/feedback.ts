import { feedbackModel } from "../../database";
import { reqInfo, responseMessage } from "../../helper";
import { apiResponse } from "../../utils";
import { addFeedbackSchema, deleteFeedbackSchema, editFeedbackSchema, getFeedbackSchema } from "../../validation";

const ObjectId = require('mongoose').Types.ObjectId;

export const add_feedback = async (req, res) => {
    reqInfo(req)
    let { user } = req.headers
    try {
        const { error, value } = addFeedbackSchema.validate(req.body)
        if (error) {
            return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))
        }

        value.createdBy = new ObjectId(user._id)
        value.updatedBy = new ObjectId(user._id)

        if(user.userType === "user"){
            value.userId = new ObjectId(user._id)
        }
        
        if(!value.feedback) return res.status(404).json(new apiResponse(404, "Please enter feedback", {}, {}))
        
        const response = await new feedbackModel(value).save();
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.addDataError, {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.addDataSuccess("feedback"), response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const edit_feedback_by_id = async (req, res) => {
    reqInfo(req)
    let { user } = req.headers
    try {
        const { error, value } = editFeedbackSchema.validate(req.body)
        if (error) {
            return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))
        }

        value.updatedBy = new ObjectId(user._id)

        const response = await feedbackModel.findOneAndUpdate({ _id: new ObjectId(value.feedbackId) }, value, { new: true })
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.updateDataError("feedback"), {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.updateDataSuccess("feedback"), response, {}))
    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const delete_feedback_by_id = async (req, res) => {
    reqInfo(req)
    try {
        const { error, value } = deleteFeedbackSchema.validate(req.params)
        if (error) {
            return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))
        }

        const response = await feedbackModel.findOneAndUpdate({ _id: new ObjectId(value.id) }, { isDeleted: true }, { new: true })
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("feedback"), {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.deleteDataSuccess("feedback"), response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const get_all_feedback = async (req, res) => {
    reqInfo(req)
    let match: any = {}
    try {
        match.isDeleted = false

        const response = await feedbackModel.aggregate([
            { $match: match },
            {
                $lookup: {
                    from: 'users',
                    let: { userId: "$userId" },
                    pipeline: [
                        { $match: { $expr: { $and: [{ $eq: ["$_id", "$$userId"] }] } } },
                        { $project: { _id: 1, firstName: 1, lastName: 1, email: 1, phone: 1, gender: 1, profileImage: 1, walletBalance: 1, contact: 1 } }
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
                        { $sort: { createdAt: -1 } }
                    ],
                    data_count: [{ $count: "count" }]
                }
            }
        ])

        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("feedback"), {
            feedback_data: response[0]?.data || [],
            totalData: response[0]?.data_count[0]?.count || 0
        }, {}))
    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const get_feedback_by_id = async (req, res) => {
    reqInfo(req)
    try {
        const { error, value } = getFeedbackSchema.validate(req.params)
        if (error) {
            return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))
        }

        const response = await feedbackModel.findOne({ _id: new ObjectId(value.id) })
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("feedback"), {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("feedback"), response, {}))
    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}