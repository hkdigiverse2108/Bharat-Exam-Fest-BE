import { apiResponse } from "../../utils";
import { contestTypeModel } from "../../database";
import { reqInfo, responseMessage } from "../../helper";
import { addContestTypeSchema, deleteContestTypeSchema, editContestTypeSchema, getContestTypeSchema } from "../../validation";

const ObjectId: any = require('mongoose').Types.ObjectId;

export const add_contest_type = async (req, res) => {
    reqInfo(req);
    let { user } = req.headers
    try {
        const { error, value } = addContestTypeSchema.validate(req.body);
        if (error) {
            return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}));
        }

        value.createdBy = new ObjectId(user?._id)
        value.updatedBy = new ObjectId(user?._id)

        let isExist = await contestTypeModel.findOne({ name: value.name, isDeleted: false })
        if (isExist) return res.status(404).json(new apiResponse(404, responseMessage?.addDataError, {}, {}));

        const response = await new contestTypeModel(value).save();
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.addDataError, {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage?.addDataSuccess("contest type"), response, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error));
    }
};

export const edit_contest_type_by_id = async (req, res) => {
    reqInfo(req);
    let { user } = req.headers;
    try {
        const { error, value } = editContestTypeSchema.validate(req.body);
        if (error) {
            return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}));
        }
        value.updatedBy = new ObjectId(user?._id)

        let isExist = await contestTypeModel.findOne({ name: value.name, isDeleted: false, _id: { $ne: new ObjectId(value.contestTypeId) } })
        if (isExist) return res.status(404).json(new apiResponse(404, responseMessage?.addDataError, {}, {}));

        const response = await contestTypeModel.findOneAndUpdate({ _id: new ObjectId(value.contestTypeId), isDeleted: false }, value, { new: true });
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.updateDataError("contest type"), {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage?.updateDataSuccess("contest type"), response, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error));
    }
};

export const delete_contest_type_by_id = async (req, res) => {
    reqInfo(req);
    try {
        const { error, value } = deleteContestTypeSchema.validate(req.params);
        if (error) {
            return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}));
        }
        const response = await contestTypeModel.findOneAndUpdate({ _id: new ObjectId(value.id), isDeleted: false }, { isDeleted: true }, { new: true });
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("contest type"), {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage?.deleteDataSuccess("contest type"), {}, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error));
    }
};

export const get_all_contest_type = async (req, res) => {
    reqInfo(req);
    let { page, limit, search } = req.query;
    let response: any, match: any = {};

    try {
        page = Number(page)
        limit = Number(limit)
        match.isDeleted = false;

        if (search) {
            match.$or = [
                { name: { $regex: search, $options: 'i' } },
            ]
        }

        response = await contestTypeModel.aggregate([
            { $match: match },
            {
                $lookup: {
                    from: 'sub-topics',
                    let: { subTopicId: "$subTopicId" },
                    pipeline: [
                        { $match: { $expr: { $and: [{ $eq: ["$_id", "$$subTopicId"] }] } } },
                        { $project: { _id: 1, name: 1 } }
                    ],
                    as: 'subTopic'
                }
            },
            {
                $unwind: { path: "$subTopic", preserveNullAndEmptyArrays: true }
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

        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("contest type"), {
            contest_type_data: response[0]?.data || [],
            totalData: response[0]?.data_count[0]?.count || 0,
            state: {
                page: page,
                limit: limit,
                page_limit: Math.ceil(response[0]?.data_count[0]?.count / limit) || 1,
            },
        }, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error));
    }
};

export const get_contest_type_by_id = async (req, res) => {
    reqInfo(req);
    try {
        const { error, value } = getContestTypeSchema.validate(req.params);
        if (error) {
            return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}));
        }

        const response = await contestTypeModel.findOne({ _id: new ObjectId(value.id), isDeleted: false });
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("contest type"), {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("contest type"), response, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error));
    }
};

export const get_all_contests_type = async(req, res) => {
    reqInfo(req)
    try {
        let response = await contestTypeModel.find({isDeleted: false}).select("name _id")
        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("contest type"),response, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error));
    }
}