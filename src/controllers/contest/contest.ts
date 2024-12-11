import { apiResponse, generateHourlySlots, ROLE_TYPES } from "../../utils";
import { classesModel, contestModel, qaModel } from "../../database";
import { reqInfo, responseMessage } from "../../helper";
import { addContestSchema, deleteContestSchema, editContestSchema, getContestSchema } from "../../validation";

const ObjectId: any = require('mongoose').Types.ObjectId;

export const add_contest = async (req, res) => {
    reqInfo(req);
    let { user } = req.headers;
    try {
        const { error, value } = addContestSchema.validate(req.body);
        if (error) {
            return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}));
        }

        value.createdBy = new ObjectId(user?._id);
        value.updatedBy = new ObjectId(user?._id);

        if (value.startDate && value.endDate) {
            const startDate = new Date(value.startDate);
            const endDate = new Date(value.endDate);
            const slots = generateHourlySlots(startDate, endDate);
            value.slots = slots; // Assuming you want to store these slots in the contest model
        }
        
        const response = await new contestModel(value).save();
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.addDataError, {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage?.addDataSuccess("contest"), response, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error));
    }
};

export const edit_contest_by_id = async (req, res) => {
    reqInfo(req);
    let { user } = req.headers;
    try {
        const { error, value } = editContestSchema.validate(req.body);
        if (error) {
            return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}));
        }
        value.updatedBy = new ObjectId(user?._id)
        if (value.startDate && value.endDate) {
            const startDate = new Date(value.startDate);
            const endDate = new Date(value.endDate);
            const slots = generateHourlySlots(startDate, endDate);
            value.slots = slots; // Assuming you want to store these slots in the contest model
        }
        const response = await contestModel.findOneAndUpdate({ _id: new ObjectId(value._id), isDeleted: false }, value, { new: true });
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.updateDataError("contest"), {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage?.updateDataSuccess("contest"), response, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error));
    }
};

export const delete_contest_by_id = async (req, res) => {
    reqInfo(req);
    try {
        const { error, value } = deleteContestSchema.validate(req.params);
        if (error) {
            return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}));
        }
        const response = await contestModel.findOneAndUpdate({ _id: new ObjectId(value.id), isDeleted: false }, { isDeleted: true }, { new: true });
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("contest"), {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage?.deleteDataSuccess("contest"), {}, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error));
    }
};

export const get_all_contests = async (req, res) => {
    reqInfo(req);
    let { page, limit, search, subTopicFilter, contestFilter, pricePoolFilter, contestTypeFilter, feesFilter, sportFilter } = req.query;
    let response: any, match: any = {}, match2: any = {}, { user } = req.headers;

    try {
        page = Number(page)
        limit = Number(limit)
        match.isDeleted = false;

        if (search) {
            match.$or = [
                { "firstName": { $regex: search, $options: 'i' } }
            ]
        }

        if (contestFilter) {
            if (contestFilter === "upcoming") {
                match.startDate = { $gte: new Date() }
            }
            else if (contestFilter === "ongoing") {
                match.endDate = { $lte: new Date() }
            }
            else if (contestFilter === "completed") {
                match.endDate = { $lt: new Date() }
            }
        }

        if (subTopicFilter) {
            match.subTopicId = new ObjectId(subTopicFilter)
        }

        if (contestTypeFilter) {
            match2["contest-type.name"] = contestTypeFilter
        }

        if (pricePoolFilter) {
            match.pricePool = { $gte: Number(pricePoolFilter.min), $lte: Number(pricePoolFilter.max) }
        }

        if (feesFilter) {
            match.fees = { $gte: Number(feesFilter.min), $lte: Number(feesFilter.max) }
        }

        if (sportFilter) {
            match.totalSpots = { $gte: Number(sportFilter.min), $lte: Number(sportFilter.max) }
        }

        if (user.userType === ROLE_TYPES.USER) {
            let qas = await qaModel.find({ userId: new ObjectId(user?._id) })
            let qasId = await qas.map(e => new ObjectId(e.contestId))
            match._id = { $nin: qasId }
        }

        if(user?.classesShow && user?.userType === ROLE_TYPES.USER){
            if(user?.friendReferralCode){
                let classes = await classesModel.findOne({ referralCode: user?.friendReferralCode, isDeleted: false })
                if(classes){
                    match.classesId = new ObjectId(classes._id)
                }
            }
        }

        response = await contestModel.aggregate([
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
                $lookup: {
                    from: 'contest-types',
                    let: { contestTypeId: "$contestTypeId" },
                    pipeline: [
                        { $match: { $expr: { $and: [{ $eq: ["$_id", "$$contestTypeId"] }] } } },
                        { $project: { _id: 1, name: 1 } }
                    ],
                    as: 'contest-type'
                }
            },
            {
                $unwind: { path: "$contest-type", preserveNullAndEmptyArrays: true }
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

        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("contests"), {
            contest_data: response[0]?.data || [],
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

export const get_contest_by_id = async (req, res) => {
    reqInfo(req);
    try {
        const { error, value } = getContestSchema.validate(req.params);
        if (error) {
            return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}));
        }

        const response = await contestModel.findOne({ _id: new ObjectId(value.id), isDeleted: false });
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("contest"), {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("contest"), response, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error));
    }
};