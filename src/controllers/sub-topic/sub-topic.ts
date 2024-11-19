import { subTopicModel } from "../../database";
import { reqInfo, responseMessage } from "../../helper";
import { apiResponse } from "../../utils";
import { addSubTopicSchema, deleteSubTopicSchema, editSubTopicSchema, getSubTopicSchema } from "../../validation";

const ObjectId = require('mongoose').Types.ObjectId;

export const add_sub_topic = async (req, res) => {
    reqInfo(req)
    let { user } = req.headers
    try {
        const { error, value } = addSubTopicSchema.validate(req.body)
        if (error) {
            return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))
        }

        value.createdBy = new ObjectId(user._id)
        value.updatedBy = new ObjectId(user._id)

        let isExist = await subTopicModel.findOne({ name: value.name, isDeleted: false })
        if (isExist) return res.status(404).json(new apiResponse(404, responseMessage?.dataAlreadyExist("Name"), {}, {}))

        const response = await new subTopicModel(value).save();
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.addDataError, {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.addDataSuccess("sub topic"), response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const edit_sub_topic_by_id = async (req, res) => {
    reqInfo(req)
    let { user } = req.headers
    try {
        const { error, value } = editSubTopicSchema.validate(req.body)
        if (error) {
            return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))
        }
        value.updatedBy = new ObjectId(user._id)

        let isExist = await subTopicModel.findOne({ name: value.name, isDeleted: false })
        if (isExist) return res.status(404).json(new apiResponse(404, responseMessage?.dataAlreadyExist("Name"), {}, {}))

        isExist = await subTopicModel.findOne({ email: value.email, isDeleted: false })
        if (isExist) return res.status(404).json(new apiResponse(404, responseMessage?.dataAlreadyExist("Email"), {}, {}))

        const response = await subTopicModel.findOneAndUpdate({ _id: new ObjectId(value.subTopicId) }, value, { new: true })
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.updateDataError("sub topic"), {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.updateDataSuccess("sub topic"), response, {}))
    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const delete_sub_topic_by_id = async (req, res) => {
    reqInfo(req)
    try {
        const { error, value } = deleteSubTopicSchema.validate(req.params)
        if (error) {
            return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))
        }

        const response = await subTopicModel.findOneAndUpdate({ _id: new ObjectId(value.id) }, { isDeleted: true }, { new: true })
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("sub topic"), {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.deleteDataSuccess("sub topic"), response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const get_all_sub_topic = async (req, res) => {
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

        const response = await subTopicModel.aggregate([
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

        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("sub topic"), {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("sub topic"), {
            sub_topic_data: response[0]?.data || [],
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

export const get_sub_topic_by_id = async (req, res) => {
    reqInfo(req)
    try {
        const { error, value } = getSubTopicSchema.validate(req.params)
        if (error) {
            return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))
        }

        const response = await subTopicModel.findOne({ _id: new ObjectId(value.id) })
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("sub topic"), {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("sub topic"), response, {}))
    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const get_all_sub_topics = async (req, res) => {
    reqInfo(req)
    try {
        let subTopic = await subTopicModel.find({ isDeleted: false }).select("name _id")
        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("sub topic"), subTopic, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}