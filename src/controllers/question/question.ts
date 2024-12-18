import { apiResponse, ROLE_TYPES } from "../../utils";
import { contestModel, qaModel, questionModel } from "../../database";
import { reqInfo, responseMessage } from "../../helper";
import { addQuestionSchema, deleteQuestionSchema, editQuestionSchema, getQuestionSchema } from "../../validation";


const ObjectId: any = require('mongoose').Types.ObjectId;

export const add_question = async (req, res) => {
    reqInfo(req);
    let { user } = req.headers
    try {
        const { error, value } = addQuestionSchema.validate(req.body);
        if (error) {
            return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}));
        }

        value.createdBy = new ObjectId(user?._id)
        value.updatedBy = new ObjectId(user?._id)

        const response = await new questionModel(value).save();
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.addDataError, {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage?.addDataSuccess("question"), response, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error));
    }
};

export const edit_question_by_id = async (req, res) => {
    reqInfo(req);
    let { user } = req.headers;
    try {
        const { error, value } = editQuestionSchema.validate(req.body);
        if (error) {
            return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}));
        }
        value.updatedBy = new ObjectId(user?._id)
        const response = await questionModel.findOneAndUpdate({ _id: new ObjectId(value.questionId), isDeleted: false }, value, { new: true });
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.updateDataError("question"), {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage?.updateDataSuccess("question"), response, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error));
    }
};

export const delete_question_by_id = async (req, res) => {
    reqInfo(req);
    try {
        const { error, value } = deleteQuestionSchema.validate(req.params);
        if (error) {
            return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}));
        }
        const response = await questionModel.findOneAndUpdate({ _id: new ObjectId(value.id), isDeleted: false }, { isDeleted: true }, { new: true });
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("question"), {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage?.deleteDataSuccess("question"), {}, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error));
    }
};

export const get_all_questions = async (req, res) => {
    reqInfo(req);
    let { page, limit, search, subjectFilter, classesFilter, subtopicFilter, questionTypeFilter, typeFilter } = req.query, { user } = req.headers;
    let response: any, match: any = {};

    try {
        page = Number(page)
        limit = Number(limit)

        match.isDeleted = false;

        if (user.userType === ROLE_TYPES.CLASSES) {
            match.classesId = new ObjectId(user._id)
        }

        if (subjectFilter) {
            match.subjectId = new ObjectId(subjectFilter)
        }

        if (classesFilter) {
            match.classesId = new ObjectId(classesFilter)
        }

        if (subtopicFilter) {
            match.subtopicId = new ObjectId(subtopicFilter)
        }

        if (questionTypeFilter) {
            match.questionType = questionTypeFilter
        }

        if (typeFilter) {
            match.type = typeFilter
        }

        if (search) {
            match.$or = [
                { "englishQuestion.question": { $regex: search, $options: 'i' } },
                { "hindiQuestion.question": { $regex: search, $options: 'i' } },
            ]
        }

        response = await questionModel.aggregate([
            { $match: match },
            {
                $lookup: {
                    from: 'subjects',
                    let: { subjectId: "$subjectId" }, // Ensure subTopicIds is an array
                    pipeline: [
                        { $match: { $expr: { $and: [{ $eq: ["$_id", "$$subjectId"] }] } } },
                        { $project: { name: 1, isDeleted: 1 } }
                    ],
                    as: 'subject'
                }
            },
            {
                $unwind: { path: "$subject", preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: 'classes',
                    let: { classesId: "$classesId" }, // Ensure subTopicIds is an array
                    pipeline: [
                        { $match: { $expr: { $and: [{ $eq: ["$_id", "$$classesId"] }] } } },
                        { $project: { name: 1, isDeleted: 1 } }
                    ],
                    as: 'classes'
                }
            },
            {
                $unwind: { path: "$classes", preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: 'sub-topics',
                    let: { subtopicId: "$subtopicId" }, // Ensure subTopicIds is an array
                    pipeline: [
                        { $match: { $expr: { $and: [{ $eq: ["$_id", "$$subtopicId"] }] } } },
                        { $project: { name: 1, isDeleted: 1 } }
                    ],
                    as: 'subtopic'
                }
            },
            {
                $unwind: { path: "$subtopic", preserveNullAndEmptyArrays: true }
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

        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("questions"), {
            question_data: response[0]?.data || [],
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

export const get_question_by_id = async (req, res) => {
    reqInfo(req);
    try {
        const { error, value } = getQuestionSchema.validate(req.params);
        if (error) {
            return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}));
        }

        const response = await questionModel.findOne({ _id: new ObjectId(value.id), isDeleted: false });
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("question"), {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("question"), response, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error));
    }
};


export const subject_wise_question_count = async (req, res) => {
    reqInfo(req)
    let { user } = req.headers, match: any = {}
    try {

        if (user.userType === ROLE_TYPES.CLASSES) {
            match.classesId = new ObjectId(user._id)
        }

        match.isDeleted = false

        let response = await questionModel.aggregate([
            { $match: match },
            { $group: { _id: "$subjectId", count: { $sum: 1 } } },
            {
                $lookup: {
                    from: 'subjects',
                    let: { subjectId: "$_id" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$subjectId"] } } },
                        { $project: { name: 1, isDeleted: 1 } }
                    ],
                    as: 'subject'
                }
            },
            {
                $unwind: { path: "$subject", preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: 'classes',
                    let: { classesId: "$_id" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$classesId"] } } },
                        { $project: { name: 1, isDeleted: 1 } }
                    ],
                    as: 'classes'
                }
            },
            {
                $unwind: { path: "$classes", preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: 'sub-topics',
                    let: { subTopicIds: { $ifNull: ["$subTopicIds", []] } }, // Ensure subTopicIds is an array
                    pipeline: [
                        { $match: { $expr: { $and: [{ $in: ["$_id", "$$subTopicIds"] }] } } },
                        { $project: { name: 1, isDeleted: 1 } }
                    ],
                    as: 'subTopics'
                }
            },

            {
                $project: {
                    _id: 1,
                    count: 1,
                    subjectName: "$subject.name",
                    subjectImage: "$subject.image"
                }
            }
        ])

        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("question count"), response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const get_question_by_contest = async (req, res) => {
    reqInfo(req)
    let { contestFilter } = req.query, { user } = req.headers
    try {
        let contest = await contestModel.findOne({ _id: new ObjectId(contestFilter) })
        if (!contest) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("contest"), {}, {}))
        
        let qa = await qaModel.findOne({ contentId: new ObjectId(contestFilter), userId: new ObjectId(user?._id) })
        if (!qa) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("qa"), {}, {}))

        let questions = await questionModel.aggregate([
            { $match: { subtopicIds: { $in: [new ObjectId(qa?.subTopicId)] }, subjectId: new ObjectId(qa?.subjectId) } },
            { $sample: { size: contest.totalQuestions } } // Randomly select totalQuestions
        ]);
        
        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess(""), questions, {}))

    } catch (error) {
        console.log("error => ", error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error));
    }
}