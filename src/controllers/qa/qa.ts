import { contestModel, qaModel, questionModel } from "../../database"
import { reqInfo, responseMessage } from "../../helper"
import { apiResponse, ROLE_TYPES } from "../../utils"

let ObjectId = require("mongoose").Types.ObjectId

export const add_qa = async (req, res) => {
    reqInfo(req)
    let { user } = req.headers, body = req.body
    try {
        // const { error, value } = addClassesSchema.validate(req.body)
        // if (error) {
        //     return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))
        // }

        body.createdBy = new ObjectId(user._id)
        body.updatedBy = new ObjectId(user._id)

        body.userId = new ObjectId(user._id)

        let qa = await qaModel.findOne({ contestId: new ObjectId(body.contestId), userId: new ObjectId(user._id), isDeleted: false })
        if (qa) return res.status(404).json(new apiResponse(404, responseMessage?.dataAlreadyExist("contest"), {}, {}))

        let contest = await contestModel.findOneAndUpdate({ _id: new ObjectId(body.contestId) }, { $inc: { filledSpots: 1 } }, { new: true })
        if (!contest) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("contest"), {}, {}))

        if (contest) {
            contest.pricePool = contest?.totalSpots * contest?.fees / 2
            await contest.save()
        }

        if (!body.subjectId) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("subject"), {}, {}))

        if (!body.subTopicId) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("sub topic"), {}, {}))

        const response = await new qaModel(body).save();
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.addDataError, {}, {}))

        return res.status(200).json(new apiResponse(200, responseMessage?.addDataSuccess("question"), response, {}))
    } catch (error) {
        console.log("error", error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const edit_qa_by_id = async (req, res) => {
    reqInfo(req)
    let { user } = req.headers, body = req.body
    try {

        body.updatedBy = new ObjectId(user._id)

        if (body.answers) {
            let totalPoints = 0, totalRightAnswer = 0, totalWrongAnswer = 0, totalSkippedAnswer = 0;
            for (let i = 0; i < body.answers.length; i++) {
                let answer = body.answers[i]
                let question = await questionModel.findOne({ _id: new ObjectId(answer.questionId) })

                if (question && answer.answer && question.englishQuestion.answer === answer.answer) {
                    answer.isAnsweredTrue = true
                    if (answer.is2XStack) {
                        totalPoints += 2 * 2
                        answer.is2XStack === true
                    } else {
                        totalPoints += 2
                    }
                    totalRightAnswer++
                } else if (question && answer.answer && question.englishQuestion.answer !== answer.answer) {
                    answer.isAnsweredTrue = false
                    answer.rightAnswer = question.englishQuestion.answer || question.hindiQuestion.answer
                    if (answer.is2XStack) {
                        answer.is2XStack === true
                    }
                    totalPoints -= 0.67
                    totalWrongAnswer++
                } else {
                    totalSkippedAnswer++
                    answer.isAnsweredTrue = null
                }
            }

            body.totalPoints = totalPoints;
            body.totalRightAnswer = totalRightAnswer;
            body.totalWrongAnswer = totalWrongAnswer;
            body.totalSkippedAnswer = totalSkippedAnswer;
        }

        const response = await qaModel.findOneAndUpdate({ _id: new ObjectId(body.qaId) }, body, { new: true })
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.updateDataError("qa"), {}, {}))

        return res.status(200).json(new apiResponse(200, responseMessage?.updateDataSuccess("qa"), response, {}))
    } catch (error) {
        console.log("error", error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const get_all_qa = async (req, res) => {
    reqInfo(req);
    let { page, limit, search, contestFilter, pricePoolFilter, contestTypeFilter, feesFilter, sportFilter } = req.query;
    let response: any, match: any = {}, match2: any = {}, { user } = req.headers;
    try {
        page = Number(page)
        limit = Number(limit)

        if (user.userType === ROLE_TYPES.USER) {
            match.userId = new ObjectId(user._id)
        }

        if (contestFilter) {
            if (contestFilter === "upcoming") {
                match2["contest.startDate"] = { $lte: new Date() };
                match2["contest.endDate"] = { $gte: new Date() };
            } else if (contestFilter === "ongoing") {
                match2["contest.startDate"] = { $lte: new Date() };
                match2["contest.endDate"] = { $gte: new Date() };
            } else if (contestFilter === "completed") {
                match2["contest.endDate"] = { $lt: new Date() }
            } else {
                return res.status(404).json(new apiResponse(404, "Invalid status", {}, {}))
            }
        }

        if (contestTypeFilter) {
            match2["contest.contest-type.name"] = contestTypeFilter
        }

        if (pricePoolFilter) {
            match2["contest.pricePool"] = { $gte: Number(pricePoolFilter.min), $lte: Number(pricePoolFilter.max) }
        }

        if (feesFilter) {
            match2["contest.fees"] = { $gte: Number(feesFilter.min), $lte: Number(feesFilter.max) }
        }

        if (sportFilter) {
            match2["contest.totalSpots"] = { $gte: Number(sportFilter.min), $lte: Number(sportFilter.max) }
        }

        response = await qaModel.aggregate([
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
                    from: 'contests',
                    let: { contestId: "$contestId" },
                    pipeline: [
                        { $match: { $expr: { $and: [{ $eq: ["$_id", "$$contestId"] }] } } },
                        { $project: { createdBy: 0, updatedBy: 0, createdAt: 0, updatedAt: 0, isBlocked: 0, isDeleted: 0 } },
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
                    ],
                    as: 'contest'
                }
            },
            {
                $unwind: { path: "$contest", preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: 'classes',
                    let: { classesId: "$classesId" },
                    pipeline: [
                        { $match: { $expr: { $and: [{ $eq: ["$_id", "$$classesId"] }] } } },
                        { $project: { createdBy: 0, updatedBy: 0, createdAt: 0, updatedAt: 0, isBlocked: 0, isDeleted: 0 } },
                    ],
                    as: 'classes'
                }
            },
            {
                $unwind: { path: "$classes", preserveNullAndEmptyArrays: true }
            },
            {
                $lookup: {
                    from: 'subjects',
                    let: { subjectId: "$subjectId" },
                    pipeline: [
                        { $match: { $expr: { $and: [{ $eq: ["$_id", "$$subjectId"] }] } } },
                        { $project: { createdBy: 0, updatedBy: 0, createdAt: 0, updatedAt: 0, isBlocked: 0, isDeleted: 0 } },
                    ],
                    as: 'subject'
                }
            },
            {
                $unwind: { path: "$subject", preserveNullAndEmptyArrays: true }
            },
            {
                $addFields: { userRank: 0 }
            },
            { $match: match2 },
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

        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("qa"), {
            contest_type_data: response[0]?.data || [],
            totalData: response[0]?.data_count[0]?.count || 0,
            state: {
                page: page,
                limit: limit,
                page_limit: Math.ceil(response[0]?.data_count[0]?.count / limit) || 1,
            },
        }, {}))
    } catch (error) {
        console.log("error=> ", error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const get_user_contest_question_by_id = async (req, res) => {
    reqInfo(req)
    let { user } = req.headers
    let { contestFilter } = req.query
    try {
        let qa = await qaModel.findOne({ contestId: new ObjectId(contestFilter), userId: new ObjectId(user._id) }).lean()
        if (!qa) return res.status(405).json(new apiResponse(405, responseMessage?.getDataNotFound("qa"), {}, {}))

        let contest = await contestModel.findOne({ _id: new ObjectId(qa.contestId), isDeleted: false }).lean()
        if (!contest) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("contest"), {}, {}))

        let questions = await questionModel.aggregate([
            { $match: { subtopicIds: { $in: [new ObjectId(qa?.subTopicId)] }, subjectId: new ObjectId(qa?.subjectId), isDeleted: false } },
            { $sample: { size: contest.totalQuestions } }
        ]);

        qa.answers = questions
        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("qa"), qa, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error));
    }
}