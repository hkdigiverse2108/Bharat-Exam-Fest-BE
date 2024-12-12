import { classesModel, contestModel, contestRankModel, qaModel, questionModel, transactionModel, userModel } from "../../database"
import { reqInfo, responseMessage } from "../../helper"
import { apiResponse, ROLE_TYPES, TRANSACTION_STATUS, TRANSACTION_TYPE, WHY_FALSE } from "../../utils"

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

        if(user?.walletBalance < 0){
            return res.status(404).json(new apiResponse(404, responseMessage?.insufficientBalance, {}, {}))
        }

        if (contest) {
            contest.pricePool = contest?.totalSpots * contest?.fees / 2
            await contest.save()
        }

        if (!body.subjectId) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("subject"), {}, {}))

        if (!body.subTopicId) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("sub topic"), {}, {}))

        const response = await new qaModel(body).save();
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.addDataError, {}, {}))
        
        if(user?.userType === ROLE_TYPES.USER && user?.friendReferralCode){
            let userData = await userModel.findOneAndUpdate({ referralCode: user?.friendReferralCode }, { $inc: { walletBalance: 5 } }, { new: true })
            await new transactionModel({
                userId: new ObjectId(userData._id),
                amount: 5,
                transactionType: TRANSACTION_TYPE.DEPOSIT,
                transactionStatus: TRANSACTION_STATUS.SUCCESS,
                description: "Referral bonus"
            }).save()
        }
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
    let { page, limit, search, contestFilter, pricePoolFilter, contestTypeFilter, feesFilter, sportFilter, qaFilter } = req.query;
    let response: any, match: any = {}, match2: any = {}, { user } = req.headers;
    try {
        page = Number(page);
        limit = Number(limit);

        if (user.userType === ROLE_TYPES.USER) {
            match.userId = new ObjectId(user._id);
        }

        if (qaFilter) match._id = new ObjectId(qaFilter);

        if (contestFilter) {
            if (contestFilter === "upcoming") {
                match2["contest.startDate"] = { $lte: new Date() };
                match2["contest.endDate"] = { $gte: new Date() };
            } else if (contestFilter === "ongoing") {
                match2["contest.startDate"] = { $lte: new Date() };
                match2["contest.endDate"] = { $gte: new Date() };
            } else if (contestFilter === "completed") {
                match2["contest.endDate"] = { $lt: new Date() };
            } else {
                return res.status(404).json(new apiResponse(404, "Invalid status", {}, {}));
            }
        }

        if (contestTypeFilter) {
            match2["contest.contest-type.name"] = contestTypeFilter;
        }

        if (pricePoolFilter) {
            match2["contest.pricePool"] = { $gte: Number(pricePoolFilter.min), $lte: Number(pricePoolFilter.max) };
        }

        if (feesFilter) {
            match2["contest.fees"] = { $gte: Number(feesFilter.min), $lte: Number(feesFilter.max) };
        }

        if (sportFilter) {
            match2["contest.totalSpots"] = { $gte: Number(sportFilter.min), $lte: Number(sportFilter.max) };
        }

        if(user?.classesShow && user?.userType === ROLE_TYPES.USER){
            if(user?.friendReferralCode){
                let classes = await classesModel.findOne({ referralCode: user?.friendReferralCode, isDeleted: false })
                if(classes){
                    match.classesId = new ObjectId(classes._id)
                }
            }
        }

        response = await qaModel.aggregate([
            { $match: match },
            {
                $lookup: {
                    from: 'contests',
                    let: { contestId: "$contestId" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$contestId"] } } },
                        { $project: { createdBy: 0, updatedBy: 0, createdAt: 0, updatedAt: 0, isBlocked: 0, isDeleted: 0 } },
                        {
                            $lookup: {
                                from: 'contest-types',
                                let: { contestTypeId: "$contestTypeId" },
                                pipeline: [
                                    { $match: { $expr: { $eq: ["$_id", "$$contestTypeId"] } } },
                                    { $project: { _id: 1, name: 1 } }
                                ],
                                as: 'contest-type'
                            }
                        },
                        { $unwind: { path: "$contest-type", preserveNullAndEmptyArrays: true } }
                    ],
                    as: 'contest'
                }
            },
            { $unwind: { path: "$contest", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'classes',
                    let: { classesId: "$classesId" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$classesId"] } } },
                        { $project: { createdBy: 0, updatedBy: 0, createdAt: 0, updatedAt: 0, isBlocked: 0, isDeleted: 0 } }
                    ],
                    as: 'classes'
                }
            },
            { $unwind: { path: "$classes", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'contest-ranks',
                    let: { contestRankId: "$contestRankId" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$contestRankId"] } } }
                    ],
                    as: 'contestRank'
                }
            },
            { $unwind: { path: "$contestRank", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'subjects',
                    let: { subjectId: "$subjectId" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$subjectId"] } } },
                        { $project: { createdBy: 0, updatedBy: 0, createdAt: 0, updatedAt: 0, isBlocked: 0, isDeleted: 0 } }
                    ],
                    as: 'subject'
                }
            },
            { $unwind: { path: "$subject", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'questions',
                    let: { answers: "$answers" },
                    pipeline: [
                        { $match: { $expr: { $in: ["$_id", { $map: { input: "$$answers", as: "answer", in: "$$answer.questionId" } }] } } },
                        {
                            $lookup: {
                                from: 'sub-topics',
                                let: { subtopicIds: "$subtopicIds" },
                                pipeline: [
                                    { $match: { $expr: { $in: ["$_id", "$$subtopicIds"] } } },
                                    { $project: { name: 1 } }
                                ],
                                as: 'subtopics'
                            }
                        },
                        { $project: { subtopics: 1 } }
                    ],
                    as: 'questions'
                }
            },
            {
                $addFields: { userRank: "$rank" }
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
        ]);

        const questionAccuracy = await qaModel.aggregate([
            { $match: match },  // Use the same initial match conditions
            { $unwind: "$answers" },
            {
                $group: {
                    _id: "$answers.questionId",
                    totalAttempts: { 
                        $sum: { 
                            $cond: [
                                { $ne: ["$answers.isAnsweredTrue", null] },
                                1,
                                0
                            ]
                        }
                    },
                    correctAnswers: {
                        $sum: {
                            $cond: [
                                { $eq: ["$answers.isAnsweredTrue", true] },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $project: {
                    questionId: "$_id",
                    accuracy: {
                        $cond: [
                            { $eq: ["$totalAttempts", 0] },
                            0,
                            { $multiply: [{ $divide: ["$correctAnswers", "$totalAttempts"] }, 100] }
                        ]
                    },
                    totalAttempts: 1,
                    correctAnswers: 1
                }
            }
        ]);

        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("qa"), {
            contest_type_data: response[0]?.data || [],
            accuracy: response[0]?.data_count[0]?.count || 0,
            questionAccuracy: questionAccuracy,
            state: {
                page: page,
                limit: limit,
                page_limit: Math.ceil(response[0]?.data_count[0]?.count / limit) || 1,
            },
        }, {}));
    } catch (error) {
        console.log("error=> ", error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error));
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

        let totalQuestions = contest.totalQuestions;
        if (totalQuestions === 0) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("questions"), {}, {}))
        // Step 1: Find subtopics for the subject
        let subtopics = await questionModel.aggregate([
            { $match: { subjectId: new ObjectId(qa?.subjectId), isDeleted: false } },
            { $unwind: "$subtopicIds" },
            { $group: { _id: "$subtopicIds" } }
        ]);

        // Step 2: Calculate questions per subtopic and remaining questions
        let numSubtopics = subtopics.length;
        let questionsPerSubtopic = Math.floor(totalQuestions / numSubtopics);
        let remainingQuestions = totalQuestions % numSubtopics;

        // Step 3: Fetch questions for each subtopic
        let questions = [];

        for (let i = 0; i < subtopics.length; i++) {
            let subtopicId = subtopics[i]._id;

            // Determine number of questions to fetch for this subtopic
            let limit = questionsPerSubtopic + (remainingQuestions > 0 ? 1 : 0);
            remainingQuestions--;

            // Fetch questions for this subtopic
            let subtopicQuestions = await questionModel.aggregate([
                { $match: { subtopicIds: subtopicId, subjectId: new ObjectId(qa?.subjectId), isDeleted: false } },
                { $sample: { size: limit } }
            ]);

            questions.push(...subtopicQuestions);
        }

        qa.answers = questions;
        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("qa"), qa, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error));
    }
}

export const assignContestRanks = async () => {
    try {
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        const results = await qaModel.find({
            contestEndDate: { $gte: now },
            contestStartDate: { $gte: oneHourAgo },
            contestRankId: null,
            isDeleted: false
        });

        for (const result of results) {
            let isExistContestRank = await contestRankModel.findOne({ contestId: new ObjectId(result.contestId), contestStartDate: result.contestStartDate, contestEndDate: result.contestEndDate }).lean();
            if (isExistContestRank) continue;

            const contest = await contestModel.findOne({
                _id: new ObjectId(result.contestId),
                isDeleted: false
            }).lean();
            if (!contest) continue;

            const { ranks } = contest; // Fetch dynamic ranks configuration
            let qaIds = await qaModel.find({ contestId: new ObjectId(result.contestId), contestStartDate: result.contestStartDate, contestEndDate: result.contestEndDate, isDeleted: false }).select("_id").lean()
            const participants = await qaModel.aggregate([
                { $match: { contestId: new ObjectId(result.contestId), isDeleted: false } },
                {
                    $lookup: {
                        from: 'users',
                        let: { userId: "$userId" },
                        pipeline: [
                            { $match: { $expr: { $and: [{ $eq: ["$_id", "$$userId"] }] } } },
                            { $project: { firstName: 1, lastName: 1 } },
                        ],
                        as: 'user'
                    }
                },
                { $unwind: '$user' },
                {
                    $project: {
                        userId: 1,
                        qaId: 1,
                        totalPoints: 1,
                        profileImage: '$user.profileImage',
                        firstName: '$user.firstName',
                        lastName: '$user.lastName'
                    }
                },
                { $sort: { totalPoints: -1 } }
            ]);

            let currentRank = 1;
            let assignedRanks = ranks.map(rankDef => ({ ...rankDef, winners: [] }));

            for (let i = 0; i < participants.length;) {
                const samePointsGroup = [];
                const currentPoints = participants[i].totalPoints;

                // Group participants with the same points
                while (i < participants.length && participants[i].totalPoints === currentPoints) {
                    samePointsGroup.push(participants[i]);
                    // qaIds.add(participants[i].qaId); // Add qaId to the set
                    i++;
                }

                // Shuffle the samePointsGroup to randomize their rank assignment
                samePointsGroup.sort(() => Math.random() - 0.5);

                // Assign the group to ranks
                for (const participant of samePointsGroup) {
                    for (const rankDef of assignedRanks) {
                        const start = parseInt(rankDef.startPlace) || currentRank; // Handle dynamic ranks
                        const end = rankDef.endPlace ? parseInt(rankDef.endPlace) : start;
                        if (currentRank >= start && currentRank <= end) {
                            rankDef.winners.push({
                                userId: participant.userId,
                                qaId: participant.qaId,
                                rank: currentRank,
                                points: participant.totalPoints,
                                profileImage: participant.profileImage,
                                firstName: participant.firstName,
                                lastName: participant.lastName
                            });
                            await qaModel.findOneAndUpdate(
                                { userId: participant.userId, contestId: new ObjectId(result.contestId) },
                                { rank: currentRank },
                                { new: true }
                            );
                            break;
                        }
                    }
                    currentRank++;
                }
            }
            let response = {
                contestId: new ObjectId(result.contestId),
                qaIds: qaIds, // Convert the set to an array
                ranks: assignedRanks,
                contestStartDate: result.contestStartDate,
                contestEndDate: result.contestEndDate
            };

            let contestRank = await new contestRankModel(response).save();
            console.log("result => ", result._id);
            await qaModel.findOneAndUpdate(
                { _id: new ObjectId(result._id) },
                { contestRankId: new ObjectId(contestRank._id) },
                { new: true }
            );
        }
    } catch (error) {
        console.error('Error assigning contest ranks:', error);
    }
};

export const get_all_contest_ranks = async (req, res) => {
    reqInfo(req)
    let { contestFilter, qaFilter } = req.query, { user } = req.headers, match: any = {}
    try {

        let ranks = await contestRankModel.find({ contestId: new ObjectId(contestFilter), qaIds: { $in: [new ObjectId(qaFilter)] } }).populate("contestId").lean()
        if (!ranks) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("contest ranks"), {}, {}))

        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("contest ranks"), ranks, {}))
    } catch (error) {
        console.log("error =>", error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const update_qa_by_answer_id = async (req, res) => {
    reqInfo(req)
    let { answerId, whyFalse } = req.body
    try {
        const result = await qaModel.findOneAndUpdate({ "answers._id": new ObjectId(answerId) }, { "answers.$.whyFalse": whyFalse }, { new: true })

        if (!result) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("qa"), {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("qa"), result, {}));
    } catch (error) {
        console.error(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error));
    }
}

export const mistake_map_report = async (req, res) => {
    reqInfo(req)
    let { user } = req.headers, { id } = req.params
    try {
        // First get the base qa document to count whyFalse occurrences
        const qaDoc = await qaModel.findOne({ 
            _id: new ObjectId(id), 
            userId: new ObjectId(user._id), 
            isDeleted: false 
        }).lean();

        if (!qaDoc) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("qa"), {}, {}));

        // Count whyFalse occurrences with type safety
        const whyFalseCounts: { [key: string]: number } = qaDoc.answers.reduce((acc: { [key: string]: number }, answer) => {
            if (answer.whyFalse) {
                acc[answer.whyFalse] = (acc[answer.whyFalse] || 0) + 1;
            }
            return acc;
        }, {});

        // Calculate total mapped mistakes with type safety
        const totalMapped: number = Object.values(whyFalseCounts).reduce((a: number, b: number) => a + b, 0);

        // Initialize mistake map with proper typing
        const mistakeMap: {
            totalIncorrect: number;
            mistakeMapped: number;
            categories: {
                [key: string]: {
                    total: number;
                    subtopics: {
                        [key: string]: number;
                    };
                };
            };
        } = {
            totalIncorrect: qaDoc.totalWrongAnswer || 0,
            mistakeMapped: totalMapped,
            categories: {}
        };

        // Initialize categories with type safety
        Object.values(WHY_FALSE).forEach((category: string) => {
            mistakeMap.categories[category] = {
                total: whyFalseCounts[category] || 0,
                subtopics: {}
            };
        });

        // Get subtopic details
        const subtopicResponse = await qaModel.aggregate([
            { 
                $match: { 
                    _id: new ObjectId(id), 
                    userId: new ObjectId(user._id), 
                    isDeleted: false 
                }
            },
            { $unwind: "$answers" },
            { $match: { "answers.whyFalse": { $ne: null } } },
            {
                $lookup: {
                    from: 'questions',
                    let: { questionId: "$answers.questionId" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$_id", "$$questionId"] } } },
                        {
                            $lookup: {
                                from: 'sub-topics',
                                let: { subtopicIds: "$subtopicIds" },
                                pipeline: [
                                    { $match: { $expr: { $in: ["$_id", "$$subtopicIds"] } } }
                                ],
                                as: 'subtopics'
                            }
                        }
                    ],
                    as: 'question'
                }
            },
            { $unwind: "$question" },
            { $unwind: "$question.subtopics" }
        ]);

        // Add subtopic information with type safety
        subtopicResponse.forEach((item: any) => {
            const category = item.answers.whyFalse;
            const subtopicName = item.question.subtopics.name;

            if (category && subtopicName) {
                if (!mistakeMap.categories[category].subtopics[subtopicName]) {
                    mistakeMap.categories[category].subtopics[subtopicName] = 0;
                }
                mistakeMap.categories[category].subtopics[subtopicName]++;
            }
        });

        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("qa"), mistakeMap, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error));
    }
}