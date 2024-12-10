import { qaModel } from "../../database";
import { reqInfo, responseMessage } from "../../helper";
import { apiResponse, Q_A_TYPE } from "../../utils";

const ObjectId = require("mongoose").Types.ObjectId;

export const get_report = async (req, res) => {
    reqInfo(req)
    try {
        let [sec1, sec2, sec3]: any = await Promise.all([
            (async () => {
                let polity = await qa_type_strategy_report(req, res);
                let qaSubtopicSummary = await subtopic_summary_report(req, res);
                let qaTypeSummaryReport = await qa_type_summary_report(req, res);
                return { polity, qaSubtopicSummary, qaTypeSummaryReport };
            })(),

            (async () => {
                let qaTypeStrategyReport = await strategy_wise_comparison(req, res);
                let compareWithCompetitor = await compare_with_competitor(req, res);
                return { qaTypeStrategyReport, compareWithCompetitor };
            })(),

            (async () => {
                let qaTypeStrategyWiseComparison = await qa_type_strategy_wise_comparison(req, res)
                let eliminationReport = await elimination_skill_report(req, res)
                return { qaTypeStrategyWiseComparison, eliminationReport }
            })(),
        ])

        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("report"), { sec1, sec2, sec3 }, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error));
    }
}

export const qa_type_strategy_report = async (req, res) => {
    let { user } = req.headers, { contestFilter, qaFilter } = req.query, match: any = {};

    try {
        if (contestFilter) match.contestId = new ObjectId(contestFilter);
        if (qaFilter) match._id = new ObjectId(qaFilter);
        if (user) match.userId = new ObjectId(user?._id);

        let qa = await qaModel.aggregate([
            { $match: match },
            {
                $project: {
                    totalPoints: 1,
                    totalRightAnswer: 1,
                    totalWrongAnswer: 1,
                    totalSkippedAnswer: 1,
                    contestStartDate: 1,
                    contestEndDate: 1,
                    rank: 1,
                    answers: 1,
                    totalQuestions: {
                        $add: ["$totalRightAnswer", "$totalWrongAnswer", "$totalSkippedAnswer"]
                    }
                }
            },
            {
                $addFields: {
                    correct: "$totalRightAnswer",
                    incorrect: "$totalWrongAnswer",
                    unanswered: "$totalSkippedAnswer",
                    timeTaken: {
                        $divide: [
                            { $subtract: ["$contestEndDate", "$contestStartDate"] },
                            1000
                        ]
                    },
                    qaTypeMetrics: {
                        $arrayToObject: {
                            $map: {
                                input: ["100%Sure", "logicPlay", "intuitionHit", "blindFire", "skip", "fearDriverSkip"],
                                as: "type",
                                in: {
                                    k: "$$type",
                                    v: {
                                        direct: {
                                            correct: {
                                                $size: {
                                                    $filter: {
                                                        input: "$answers",
                                                        as: "answer",
                                                        cond: {
                                                            $and: [
                                                                { $eq: ["$$answer.type", "$$type"] },
                                                                { $eq: ["$$answer.isAnsweredTrue", true] },
                                                                { $eq: ["$$answer.eliminateOption", null] }
                                                            ]
                                                        }
                                                    }
                                                }
                                            },
                                            total: {
                                                $size: {
                                                    $filter: {
                                                        input: "$answers",
                                                        as: "answer",
                                                        cond: { $eq: ["$$answer.type", "$$type"] }
                                                    }
                                                }
                                            }
                                        },
                                        fiftyFifty: {
                                            correct: {
                                                $size: {
                                                    $filter: {
                                                        input: "$answers",
                                                        as: "answer",
                                                        cond: {
                                                            $and: [
                                                                { $eq: ["$$answer.type", "$$type"] },
                                                                { $eq: ["$$answer.isAnsweredTrue", true] },
                                                                { $eq: ["$$answer.eliminateOption", 2] }
                                                            ]
                                                        }
                                                    }
                                                }
                                            },
                                            total: {
                                                $size: {
                                                    $filter: {
                                                        input: "$answers",
                                                        as: "answer",
                                                        cond: {
                                                            $and: [
                                                                { $eq: ["$$answer.type", "$$type"] },
                                                                { $eq: ["$$answer.eliminateOption", 2] }
                                                            ]
                                                        }
                                                    }
                                                }
                                            }
                                        },
                                        oneEliminate: {
                                            correct: {
                                                $size: {
                                                    $filter: {
                                                        input: "$answers",
                                                        as: "answer",
                                                        cond: {
                                                            $and: [
                                                                { $eq: ["$$answer.type", "$$type"] },
                                                                { $eq: ["$$answer.isAnsweredTrue", true] },
                                                                { $eq: ["$$answer.eliminateOption", 1] }
                                                            ]
                                                        }
                                                    }
                                                }
                                            },
                                            total: {
                                                $size: {
                                                    $filter: {
                                                        input: "$answers",
                                                        as: "answer",
                                                        cond: {
                                                            $and: [
                                                                { $eq: ["$$answer.type", "$$type"] },
                                                                { $eq: ["$$answer.eliminateOption", 1] }
                                                            ]
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        ]);

        let response = {
            totalPoints: qa[0]?.totalPoints || 0,
            correct: qa[0]?.correct || 0,
            incorrect: qa[0]?.incorrect || 0,
            unanswered: qa[0]?.unanswered || 0,
            rank: qa[0]?.rank || 0,
            time: qa[0]?.timeTaken || 0,
            qaTypeMetrics: qa[0]?.qaTypeMetrics || {}
        }
        return response
    } catch (error) {
        console.log(error);
    }
};

export const subtopic_summary_report = async (req, res) => {
    let { user } = req.headers, { contestFilter, qaFilter } = req.query, match: any = {};
    try {

        if (contestFilter) match.contestId = new ObjectId(contestFilter);
        if (qaFilter) match._id = new ObjectId(qaFilter);
        if (user) match.userId = new ObjectId(user?._id);

        let results = await qaModel.aggregate([
            { $match: match },
            { $unwind: '$answers' },
            {
                $lookup: {
                    from: 'questions',
                    localField: 'answers.questionId',
                    foreignField: '_id',
                    as: 'questionDetails'
                }
            },
            { $unwind: '$questionDetails' },
            { $unwind: '$questionDetails.subtopicIds' }, // Unwind subtopicIds
            {
                $group: {
                    _id: '$questionDetails.subtopicIds',
                    totalQuestions: { $sum: 1 },
                    correctAnswers: {
                        $sum: {
                            $cond: ['$answers.isAnsweredTrue', 1, 0] // Use isAnsweredTrue
                        }
                    }
                }
            },
            {
                $project: {
                    subtopicId: '$_id',
                    percentage: { $multiply: [{ $divide: ['$correctAnswers', '$totalQuestions'] }, 100] }
                }
            },
            {
                $lookup: {
                    from: 'sub-topics',
                    localField: 'subtopicId',
                    foreignField: '_id',
                    as: 'subtopicDetails'
                }
            },
            { $unwind: '$subtopicDetails' },
            {
                $project: {
                    subtopicId: 1,
                    percentage: 1,
                    subtopicName: '$subtopicDetails.name' // Assuming the sub-topic name field is 'name'
                }
            }
        ]);

        // Categorize results
        let categorizedResults = {
            'Very Weak': [],
            'Weak': [],
            'Average': [],
            'Strong': [],
            'Very Strong': []
        };

        results.forEach(result => {
            let category;
            if (result.percentage >= 80) category = 'Very Strong';
            else if (result.percentage >= 60) category = 'Strong';
            else if (result.percentage >= 40) category = 'Average';
            else if (result.percentage >= 20) category = 'Weak';
            else category = 'Very Weak';

            categorizedResults[category].push({
                subtopicId: result.subtopicId,
                subtopicName: result.subtopicName,
                percentage: result.percentage
            });
        });

        return categorizedResults

    } catch (error) {
        console.error(error);
    }
};

export const qa_type_summary_report = async (req, res) => {
    let { user } = req.headers, { contestFilter, qaFilter } = req.query, match: any = {};
    try {

        if (contestFilter) match.contestId = new ObjectId(contestFilter);
        if (qaFilter) match._id = new ObjectId(qaFilter);
        if (user) match.userId = new ObjectId(user?._id);

        let results = await qaModel.aggregate([
            { $match: match },
            { $unwind: '$answers' },
            {
                $group: {
                    _id: '$answers.type', // Group by answer type
                    totalQuestions: { $sum: 1 },
                    correctAnswers: {
                        $sum: {
                            $cond: ['$answers.isAnsweredTrue', 1, 0] // Use isAnsweredTrue
                        }
                    }
                }
            },
            {
                $project: {
                    type: '$_id',
                    percentage: {
                        $round: [{ $multiply: [{ $divide: ['$correctAnswers', '$totalQuestions'] }, 100] }, 0]
                    }
                }
            }
        ]);

        // Categorize results
        let categorizedResults = {
            'Very Weak': [],
            'Weak': [],
            'Average': [],
            'Strong': [],
            'Very Strong': []
        };

        results.forEach(result => {
            let category;
            if (result.percentage >= 80) category = 'Very Strong';
            else if (result.percentage >= 60) category = 'Strong';
            else if (result.percentage >= 40) category = 'Average';
            else if (result.percentage >= 20) category = 'Weak';
            else category = 'Very Weak';

            categorizedResults[category].push({
                type: result.type,
                percentage: result.percentage
            });
        });

        return categorizedResults

    } catch (error) {
        console.error(error);
    }
};

export const strategy_wise_comparison = async (req, res) => {
    const { user } = req.headers; // logged-in user ID
    const { contestFilter, qaFilter } = req.query; // any additional filters

    try {
        let qa = await qaModel.findOne({ _id: new ObjectId(qaFilter) });
        if (!qa) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("QA"), {}, {}));

        let allUsersData = await qaModel.aggregate([
            { $match: { contestId: new ObjectId(contestFilter), contestStartDate: qa?.contestStartDate, contestEndDate: qa?.contestEndDate, isDeleted: false } },
            { $unwind: "$answers" },
            {
                $group: {
                    _id: {
                        userId: "$userId",
                        type: "$answers.type"
                    },
                    totalCorrect: { $sum: { $cond: [{ $eq: ["$answers.isAnsweredTrue", true] }, 1, 0] } },
                    totalIncorrect: { $sum: { $cond: [{ $eq: ["$answers.isAnsweredTrue", false] }, 1, 0] } }
                }
            }
        ]);

        const result = {};

        const strategyTypes = Object.values(Q_A_TYPE);

        strategyTypes.forEach(type => {
            const youData = allUsersData.find(data => data._id.userId.toString() === user._id.toString() && data._id.type === type);
            const othersData = allUsersData.filter(data => data._id.userId.toString() !== user._id.toString() && data._id.type === type);

            const othersCorrect = othersData.reduce((acc, data) => acc + data.totalCorrect, 0);
            const othersIncorrect = othersData.reduce((acc, data) => acc + data.totalIncorrect, 0);

            const toppers = othersData.reduce((max, data) => (data.totalCorrect > max.totalCorrect ? data : max), { totalCorrect: 0 });

            const youAccuracy = youData ? Math.round((youData.totalCorrect * 100) / (youData.totalCorrect + youData.totalIncorrect)) : 0;
            const othersAccuracy = Math.round((othersCorrect * 100) / (othersCorrect + othersIncorrect));
            const toppersAccuracy = Math.round((toppers.totalCorrect * 100) / (toppers.totalCorrect + toppers.totalIncorrect));

            result[type] = {
                you: {
                    correct: youData?.totalCorrect || 0,
                    incorrect: youData?.totalIncorrect || 0,
                    accuracy: youAccuracy || 0
                },
                others: {
                    correct: othersCorrect,
                    incorrect: othersIncorrect,
                    accuracy: othersAccuracy || 0
                },
                toppers: {
                    correct: toppers.totalCorrect || 0,
                    incorrect: toppers.totalIncorrect || 0,
                    accuracy: toppersAccuracy || 0
                }
            };
        });

        // Separate logic for 50-50 and 1-OPT Eliminate
        const specialStrategies = ["50-50", "1-OPT Eliminate"];
        for (const strategy of specialStrategies) {
            const strategyData = await qaModel.aggregate([
                { $match: { contestId: new ObjectId(contestFilter), contestStartDate: qa?.contestStartDate, contestEndDate: qa?.contestEndDate, isDeleted: false } },
                { $unwind: "$answers" },
                {
                    $match: {
                        "answers.eliminateOption": strategy === "50-50" ? { $gte: 2 } : 1
                    }
                },
                {
                    $group: {
                        _id: "$userId",
                        totalCorrect: { $sum: { $cond: [{ $eq: ["$answers.isAnsweredTrue", true] }, 1, 0] } },
                        totalIncorrect: { $sum: { $cond: [{ $eq: ["$answers.isAnsweredTrue", false] }, 1, 0] } }
                    }
                }
            ]);

            const youData = strategyData.find(data => data._id.toString() === user._id.toString());
            const othersData = strategyData.filter(data => data._id.toString() !== user._id.toString());

            const othersCorrect = othersData.reduce((acc, data) => acc + data.totalCorrect, 0);
            const othersIncorrect = othersData.reduce((acc, data) => acc + data.totalIncorrect, 0);

            const toppers = othersData.reduce((max, data) => (data.totalCorrect > max.totalCorrect ? data : max), { totalCorrect: 0 });

            const youAccuracy = youData ? Math.round((youData.totalCorrect * 100) / (youData.totalCorrect + youData.totalIncorrect)) : 0;
            const othersAccuracy = Math.round((othersCorrect * 100) / (othersCorrect + othersIncorrect));
            const toppersAccuracy = Math.round((toppers.totalCorrect * 100) / (toppers.totalCorrect + toppers.totalIncorrect));

            result[strategy] = {
                you: {
                    correct: youData?.totalCorrect || 0,
                    incorrect: youData?.totalIncorrect || 0,
                    accuracy: youAccuracy || 0
                },
                others: {
                    correct: othersCorrect,
                    incorrect: othersIncorrect,
                    accuracy: othersAccuracy || 0
                },
                toppers: {
                    correct: toppers.totalCorrect || 0,
                    incorrect: toppers.totalIncorrect || 0,
                    accuracy: toppersAccuracy || 0
                }
            };
        }

        return result

    } catch (error) {
        console.error(error);
    }
};

export const subtopic_wise_comparison = async (req, res) => {
    const { user } = req.headers; // logged-in user ID
    const { contestFilter, qaFilter } = req.query; // any additional filters

    try {
        let qa = await qaModel.findOne({ _id: new ObjectId(qaFilter) });
        if (!qa) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("QA"), {}, {}));

        let allUsersData = await qaModel.aggregate([
            { $match: { contestId: new ObjectId(contestFilter), contestStartDate: qa?.contestStartDate, contestEndDate: qa?.contestEndDate, isDeleted: false } },
            { $unwind: "$answers" },
            {
                $lookup: {
                    from: 'questions',
                    localField: 'answers.questionId',
                    foreignField: '_id',
                    as: 'questionDetails'
                }
            },
            { $unwind: '$questionDetails' },
            { $unwind: '$questionDetails.subtopicIds' }, // Unwind subtopicIds
            {
                $lookup: {
                    from: 'sub-topics',
                    localField: 'questionDetails.subtopicIds',
                    foreignField: '_id',
                    as: 'subtopicDetails'
                }
            },
            { $unwind: '$subtopicDetails' }, // Unwind subtopicDetails
            {
                $group: {
                    _id: {
                        userId: "$userId",
                        subtopicId: "$questionDetails.subtopicIds",
                        subtopicName: "$subtopicDetails.name"
                    },
                    totalCorrect: { $sum: { $cond: [{ $eq: ["$answers.isAnsweredTrue", true] }, 1, 0] } },
                    totalIncorrect: { $sum: { $cond: [{ $eq: ["$answers.isAnsweredTrue", false] }, 1, 0] } }
                }
            }
        ]);

        const result: Record<string, any> = {};

        allUsersData.forEach(data => {
            const subtopicId = data._id.subtopicId.toString();
            const subtopicName = data._id.subtopicName;

            const youData = allUsersData.find(d => d._id.userId.toString() === user._id.toString() && d._id.subtopicId.toString() === subtopicId);
            const othersData = allUsersData.filter(d => d._id.userId.toString() !== user._id.toString() && d._id.subtopicId.toString() === subtopicId);

            const othersCorrect = othersData.reduce((acc, d) => acc + d.totalCorrect, 0);
            const othersIncorrect = othersData.reduce((acc, d) => acc + d.totalIncorrect, 0);

            const toppers = othersData.reduce((max, d) => (d.totalCorrect > max.totalCorrect ? d : max), { totalCorrect: 0 });

            const youAccuracy = youData ? Math.round((youData.totalCorrect * 100) / (youData.totalCorrect + youData.totalIncorrect)) : 0;
            const othersAccuracy = Math.round((othersCorrect * 100) / (othersCorrect + othersIncorrect));
            const toppersAccuracy = Math.round((toppers.totalCorrect * 100) / (toppers.totalCorrect + toppers.totalIncorrect));

            result[subtopicId] = {
                subtopicName,
                you: {
                    correct: youData?.totalCorrect || 0,
                    incorrect: youData?.totalIncorrect || 0,
                    accuracy: youAccuracy || 0
                },
                others: {
                    correct: othersCorrect,
                    incorrect: othersIncorrect,
                    accuracy: othersAccuracy || 0
                },
                toppers: {
                    correct: toppers.totalCorrect || 0,
                    incorrect: toppers.totalIncorrect || 0,
                    accuracy: toppersAccuracy || 0
                }
            };
        });

        return result;

    } catch (error) {
        console.error(error);
    }
};

export const compare_with_competitor = async (req, res) => {
    let { user } = req.headers, { contestFilter, qaFilter } = req.query, match: any = {};

    try {
        let qa = await qaModel.findOne({ _id: new ObjectId(qaFilter) });
        if (!qa) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("QA"), {}, {}));

        let allUsersData = await qaModel.aggregate([
            { $match: { contestId: new ObjectId(contestFilter), contestStartDate: qa?.contestStartDate, contestEndDate: qa?.contestEndDate, isDeleted: false } },
            {
                $group: {
                    _id: "$userId",
                    totalCorrect: { $sum: "$totalRightAnswer" },
                    totalIncorrect: { $sum: "$totalWrongAnswer" },
                    totalSkipped: { $sum: "$totalSkippedAnswer" },
                    totalPoints: { $sum: "$totalPoints" }
                }
            }
        ]);

        let you = allUsersData.find(data => data._id.toString() === user._id.toString());
        let others = allUsersData.filter(data => data._id.toString() !== user._id.toString());

        let othersCorrect = others.reduce((acc, data) => acc + data.totalCorrect, 0);
        let othersIncorrect = others.reduce((acc, data) => acc + data.totalIncorrect, 0);
        let othersSkipped = others.reduce((acc, data) => acc + data.totalSkipped, 0);

        let toppers = others.reduce((max, data) => data.totalPoints > max.totalPoints ? data : max, { totalPoints: 0 });

        let youAccuracy = you ? Math.round((you.totalCorrect * 100) / (you.totalCorrect + you.totalIncorrect)) : 0;
        let othersAccuracy = Math.round((othersCorrect * 100) / (othersCorrect + othersIncorrect)) || 0;
        let toppersAccuracy = Math.round((toppers.totalCorrect * 100) / (toppers.totalCorrect + toppers.totalIncorrect)) || 0;

        let response = {
            you: {
                correct: you?.totalCorrect || 0,
                incorrect: you?.totalIncorrect || 0,
                skipped: you?.totalSkipped || 0,
                accuracy: youAccuracy || 0
            },
            others: {
                correct: othersCorrect,
                incorrect: othersIncorrect,
                skipped: othersSkipped,
                accuracy: othersAccuracy
            },
            toppers: {
                correct: toppers.totalCorrect || 0,
                incorrect: toppers.totalIncorrect || 0,
                skipped: toppers.totalSkipped || 0,
                accuracy: toppersAccuracy
            }
        }
        return response

    } catch (error) {
        console.error(error);
    }
};

export const qa_type_strategy_wise_comparison = async (req, res) => {
    let { user } = req.headers, { contestFilter, qaFilter } = req.query, match: any = {};

    try {
        let qa = await qaModel.findOne({ _id: new ObjectId(qaFilter) });
        if (!qa) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("QA"), {}, {}));

        let allUsersData = await qaModel.aggregate([
            { $match: { contestId: new ObjectId(contestFilter), contestStartDate: qa?.contestStartDate, contestEndDate: qa?.contestEndDate, isDeleted: false } },
            { $unwind: "$answers" },
            {
                $group: {
                    _id: {
                        userId: "$userId",
                        type: "$answers.type"
                    },
                    totalCorrect: { $sum: { $cond: [{ $eq: ["$answers.isAnsweredTrue", true] }, 1, 0] } },
                    totalIncorrect: { $sum: { $cond: [{ $eq: ["$answers.isAnsweredTrue", false] }, 1, 0] } }
                }
            }
        ]);

        const result = {};

        const strategyTypes = Object.values(Q_A_TYPE);

        strategyTypes.forEach(type => {
            const youData = allUsersData.find(data => data._id.userId.toString() === user._id.toString() && data._id.type === type);
            const othersData = allUsersData.filter(data => data._id.userId.toString() !== user._id.toString() && data._id.type === type);

            const othersCorrect = othersData.reduce((acc, data) => acc + data.totalCorrect, 0);
            const othersIncorrect = othersData.reduce((acc, data) => acc + data.totalIncorrect, 0);

            const toppers = othersData.reduce((max, data) => (data.totalCorrect > max.totalCorrect ? data : max), { totalCorrect: 0 });

            const youAccuracy = youData ? Math.round((youData.totalCorrect * 100) / (youData.totalCorrect + youData.totalIncorrect)) : 0;
            const othersAccuracy = Math.round((othersCorrect * 100) / (othersCorrect + othersIncorrect));
            const toppersAccuracy = Math.round((toppers.totalCorrect * 100) / (toppers.totalCorrect + toppers.totalIncorrect));

            result[type] = {
                you: {
                    correct: youData?.totalCorrect || 0,
                    incorrect: youData?.totalIncorrect || 0,
                    accuracy: youAccuracy || 0
                },
                others: {
                    correct: othersCorrect,
                    incorrect: othersIncorrect,
                    accuracy: othersAccuracy || 0
                },
                toppers: {
                    correct: toppers.totalCorrect || 0,
                    incorrect: toppers.totalIncorrect || 0,
                    accuracy: toppersAccuracy || 0
                }
            };
        });

        const specialStrategies = ["50-50", "1-OPT Eliminate"];
        for (const strategy of specialStrategies) {
            const strategyData = await qaModel.aggregate([
                { $match: { contestId: new ObjectId(contestFilter), contestStartDate: qa?.contestStartDate, contestEndDate: qa?.contestEndDate, isDeleted: false } },
                { $unwind: "$answers" },
                {
                    $match: {
                        "answers.eliminateOption": strategy === "50-50" ? { $gte: 2 } : 1
                    }
                },
                {
                    $group: {
                        _id: "$userId",
                        totalCorrect: { $sum: { $cond: [{ $eq: ["$answers.isAnsweredTrue", true] }, 1, 0] } },
                        totalIncorrect: { $sum: { $cond: [{ $eq: ["$answers.isAnsweredTrue", false] }, 1, 0] } }
                    }
                }
            ]);

            const youData = strategyData.find(data => data._id.toString() === user._id.toString());
            const othersData = strategyData.filter(data => data._id.toString() !== user._id.toString());

            const othersCorrect = othersData.reduce((acc, data) => acc + data.totalCorrect, 0);
            const othersIncorrect = othersData.reduce((acc, data) => acc + data.totalIncorrect, 0);

            const toppers = othersData.reduce((max, data) => (data.totalCorrect > max.totalCorrect ? data : max), { totalCorrect: 0 });

            const youAccuracy = youData ? Math.round((youData.totalCorrect * 100) / (youData.totalCorrect + youData.totalIncorrect)) : 0;
            const othersAccuracy = Math.round((othersCorrect * 100) / (othersCorrect + othersIncorrect));
            const toppersAccuracy = Math.round((toppers.totalCorrect * 100) / (toppers.totalCorrect + toppers.totalIncorrect));

            result[strategy] = {
                you: {
                    correct: youData?.totalCorrect || 0,
                    incorrect: youData?.totalIncorrect || 0,
                    accuracy: youAccuracy || 0
                },
                others: {
                    correct: othersCorrect,
                    incorrect: othersIncorrect,
                    accuracy: othersAccuracy || 0
                },
                toppers: {
                    correct: toppers.totalCorrect || 0,
                    incorrect: toppers.totalIncorrect || 0,
                    accuracy: toppersAccuracy || 0
                }
            };
        }

        return result

    } catch (error) {
        console.error(error);
    }
};

export const elimination_skill_report = async (req, res) => {
    let { user } = req.headers, { contestFilter, qaFilter } = req.query, match: any = {};

    try {
        if (user) match.userId = new ObjectId(user?._id);
        if (contestFilter) match.contestId = new ObjectId(contestFilter);
        if (qaFilter) match._id = new ObjectId(qaFilter);

        let qa = await qaModel.aggregate([
            { $match: match },
            {
                $addFields: {
                    correct: "$totalRightAnswer",
                    incorrect: "$totalWrongAnswer",
                    unanswered: "$totalSkippedAnswer",
                    timeTaken: {
                        $divide: [
                            { $subtract: ["$contestEndDate", "$contestStartDate"] },
                            1000
                        ]
                    },
                    qaTypeMetrics: {
                        $arrayToObject: {
                            $map: {
                                input: ["100%Sure", "logicPlay", "intuitionHit", "blindFire", "skip", "fearDriverSkip"],
                                as: "type",
                                in: {
                                    k: "$$type",
                                    v: {
                                        fiftyFifty: {
                                            correctPercentage: {
                                                $cond: {
                                                    if: {
                                                        $eq: [
                                                            {
                                                                $size: {
                                                                    $filter: {
                                                                        input: "$answers",
                                                                        as: "answer",
                                                                        cond: {
                                                                            $and: [
                                                                                { $eq: ["$$answer.type", "$$type"] },
                                                                                { $eq: ["$$answer.eliminateOption", 2] }
                                                                            ]
                                                                        }
                                                                    }
                                                                }
                                                            },
                                                            0
                                                        ]
                                                    },
                                                    then: 0,
                                                    else: {
                                                        $multiply: [
                                                            {
                                                                $divide: [
                                                                    {
                                                                        $size: {
                                                                            $filter: {
                                                                                input: "$answers",
                                                                                as: "answer",
                                                                                cond: {
                                                                                    $and: [
                                                                                        { $eq: ["$$answer.type", "$$type"] },
                                                                                        { $eq: ["$$answer.isAnsweredTrue", true] },
                                                                                        { $eq: ["$$answer.eliminateOption", 2] }
                                                                                    ]
                                                                                }
                                                                            }
                                                                        }
                                                                    },
                                                                    {
                                                                        $size: {
                                                                            $filter: {
                                                                                input: "$answers",
                                                                                as: "answer",
                                                                                cond: {
                                                                                    $and: [
                                                                                        { $eq: ["$$answer.type", "$$type"] },
                                                                                        { $eq: ["$$answer.eliminateOption", 2] }
                                                                                    ]
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                ]
                                                            },
                                                            100
                                                        ]
                                                    }
                                                }
                                            },
                                            incorrectPercentage: {
                                                $cond: {
                                                    if: {
                                                        $eq: [
                                                            {
                                                                $size: {
                                                                    $filter: {
                                                                        input: "$answers",
                                                                        as: "answer",
                                                                        cond: {
                                                                            $and: [
                                                                                { $eq: ["$$answer.type", "$$type"] },
                                                                                { $eq: ["$$answer.eliminateOption", 2] }
                                                                            ]
                                                                        }
                                                                    }
                                                                }
                                                            },
                                                            0
                                                        ]
                                                    },
                                                    then: 0,
                                                    else: {
                                                        $multiply: [
                                                            {
                                                                $divide: [
                                                                    {
                                                                        $size: {
                                                                            $filter: {
                                                                                input: "$answers",
                                                                                as: "answer",
                                                                                cond: {
                                                                                    $and: [
                                                                                        { $eq: ["$$answer.type", "$$type"] },
                                                                                        { $eq: ["$$answer.isAnsweredTrue", false] },
                                                                                        { $eq: ["$$answer.eliminateOption", 2] }
                                                                                    ]
                                                                                }
                                                                            }
                                                                        }
                                                                    },
                                                                    {
                                                                        $size: {
                                                                            $filter: {
                                                                                input: "$answers",
                                                                                as: "answer",
                                                                                cond: {
                                                                                    $and: [
                                                                                        { $eq: ["$$answer.type", "$$type"] },
                                                                                        { $eq: ["$$answer.eliminateOption", 2] }
                                                                                    ]
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                ]
                                                            },
                                                            100
                                                        ]
                                                    }
                                                }
                                            }
                                        },
                                        oneEliminate: {
                                            correctPercentage: {
                                                $cond: {
                                                    if: {
                                                        $eq: [
                                                            {
                                                                $size: {
                                                                    $filter: {
                                                                        input: "$answers",
                                                                        as: "answer",
                                                                        cond: {
                                                                            $and: [
                                                                                { $eq: ["$$answer.type", "$$type"] },
                                                                                { $eq: ["$$answer.eliminateOption", 1] }
                                                                            ]
                                                                        }
                                                                    }
                                                                }
                                                            },
                                                            0
                                                        ]
                                                    },
                                                    then: 0,
                                                    else: {
                                                        $multiply: [
                                                            {
                                                                $divide: [
                                                                    {
                                                                        $size: {
                                                                            $filter: {
                                                                                input: "$answers",
                                                                                as: "answer",
                                                                                cond: {
                                                                                    $and: [
                                                                                        { $eq: ["$$answer.type", "$$type"] },
                                                                                        { $eq: ["$$answer.isAnsweredTrue", true] },
                                                                                        { $eq: ["$$answer.eliminateOption", 1] }
                                                                                    ]
                                                                                }
                                                                            }
                                                                        }
                                                                    },
                                                                    {
                                                                        $size: {
                                                                            $filter: {
                                                                                input: "$answers",
                                                                                as: "answer",
                                                                                cond: {
                                                                                    $and: [
                                                                                        { $eq: ["$$answer.type", "$$type"] },
                                                                                        { $eq: ["$$answer.eliminateOption", 1] }
                                                                                    ]
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                ]
                                                            },
                                                            100
                                                        ]
                                                    }
                                                }
                                            },
                                            incorrectPercentage: {
                                                $cond: {
                                                    if: {
                                                        $eq: [
                                                            {
                                                                $size: {
                                                                    $filter: {
                                                                        input: "$answers",
                                                                        as: "answer",
                                                                        cond: {
                                                                            $and: [
                                                                                { $eq: ["$$answer.type", "$$type"] },
                                                                                { $eq: ["$$answer.eliminateOption", 1] }
                                                                            ]
                                                                        }
                                                                    }
                                                                }
                                                            },
                                                            0
                                                        ]
                                                    },
                                                    then: 0,
                                                    else: {
                                                        $multiply: [
                                                            {
                                                                $divide: [
                                                                    {
                                                                        $size: {
                                                                            $filter: {
                                                                                input: "$answers",
                                                                                as: "answer",
                                                                                cond: {
                                                                                    $and: [
                                                                                        { $eq: ["$$answer.type", "$$type"] },
                                                                                        { $eq: ["$$answer.isAnsweredTrue", false] },
                                                                                        { $eq: ["$$answer.eliminateOption", 1] }
                                                                                    ]
                                                                                }
                                                                            }
                                                                        }
                                                                    },
                                                                    {
                                                                        $size: {
                                                                            $filter: {
                                                                                input: "$answers",
                                                                                as: "answer",
                                                                                cond: {
                                                                                    $and: [
                                                                                        { $eq: ["$$answer.type", "$$type"] },
                                                                                        { $eq: ["$$answer.eliminateOption", 1] }
                                                                                    ]
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                ]
                                                            },
                                                            100
                                                        ]
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        ]);

        let qaTypeMetrics = await qaModel.aggregate([
            { $match: match },
            {
                $addFields: {
                    correct: "$totalRightAnswer",
                    incorrect: "$totalWrongAnswer",
                    unanswered: "$totalSkippedAnswer",
                    timeTaken: {
                        $divide: [
                            { $subtract: ["$contestEndDate", "$contestStartDate"] },
                            1000
                        ]
                    },
                    qaTypeMetrics: {
                        fiftyFifty: {
                            correctPercentage: {
                                $cond: {
                                    if: {
                                        $eq: [
                                            {
                                                $size: {
                                                    $filter: {
                                                        input: "$answers",
                                                        as: "answer",
                                                        cond: {
                                                            $eq: ["$$answer.eliminateOption", 2]
                                                        }
                                                    }
                                                }
                                            },
                                            0
                                        ]
                                    },
                                    then: 0,
                                    else: {
                                        $multiply: [
                                            {
                                                $divide: [
                                                    {
                                                        $size: {
                                                            $filter: {
                                                                input: "$answers",
                                                                as: "answer",
                                                                cond: {
                                                                    $and: [
                                                                        { $eq: ["$$answer.isAnsweredTrue", true] },
                                                                        { $eq: ["$$answer.eliminateOption", 2] }
                                                                    ]
                                                                }
                                                            }
                                                        }
                                                    },
                                                    {
                                                        $size: {
                                                            $filter: {
                                                                input: "$answers",
                                                                as: "answer",
                                                                cond: {
                                                                    $eq: ["$$answer.eliminateOption", 2]
                                                                }
                                                            }
                                                        }
                                                    }
                                                ]
                                            },
                                            100
                                        ]
                                    }
                                }
                            },
                            incorrectPercentage: {
                                $cond: {
                                    if: {
                                        $eq: [
                                            {
                                                $size: {
                                                    $filter: {
                                                        input: "$answers",
                                                        as: "answer",
                                                        cond: {
                                                            $eq: ["$$answer.eliminateOption", 2]
                                                        }
                                                    }
                                                }
                                            },
                                            0
                                        ]
                                    },
                                    then: 0,
                                    else: {
                                        $multiply: [
                                            {
                                                $divide: [
                                                    {
                                                        $size: {
                                                            $filter: {
                                                                input: "$answers",
                                                                as: "answer",
                                                                cond: {
                                                                    $and: [
                                                                        { $eq: ["$$answer.isAnsweredTrue", false] },
                                                                        { $eq: ["$$answer.eliminateOption", 2] }
                                                                    ]
                                                                }
                                                            }
                                                        }
                                                    },
                                                    {
                                                        $size: {
                                                            $filter: {
                                                                input: "$answers",
                                                                as: "answer",
                                                                cond: {
                                                                    $eq: ["$$answer.eliminateOption", 2]
                                                                }
                                                            }
                                                        }
                                                    }
                                                ]
                                            },
                                            100
                                        ]
                                    }
                                }
                            }
                        },
                        oneEliminate: {
                            correctPercentage: {
                                $cond: {
                                    if: {
                                        $eq: [
                                            {
                                                $size: {
                                                    $filter: {
                                                        input: "$answers",
                                                        as: "answer",
                                                        cond: {
                                                            $eq: ["$$answer.eliminateOption", 1]
                                                        }
                                                    }
                                                }
                                            },
                                            0
                                        ]
                                    },
                                    then: 0,
                                    else: {
                                        $multiply: [
                                            {
                                                $divide: [
                                                    {
                                                        $size: {
                                                            $filter: {
                                                                input: "$answers",
                                                                as: "answer",
                                                                cond: {
                                                                    $and: [
                                                                        { $eq: ["$$answer.isAnsweredTrue", true] },
                                                                        { $eq: ["$$answer.eliminateOption", 1] }
                                                                    ]
                                                                }
                                                            }
                                                        }
                                                    },
                                                    {
                                                        $size: {
                                                            $filter: {
                                                                input: "$answers",
                                                                as: "answer",
                                                                cond: {
                                                                    $eq: ["$$answer.eliminateOption", 1]
                                                                }
                                                            }
                                                        }
                                                    }
                                                ]
                                            },
                                            100
                                        ]
                                    }
                                }
                            },
                            incorrectPercentage: {
                                $cond: {
                                    if: {
                                        $eq: [
                                            {
                                                $size: {
                                                    $filter: {
                                                        input: "$answers",
                                                        as: "answer",
                                                        cond: {
                                                            $eq: ["$$answer.eliminateOption", 1]
                                                        }
                                                    }
                                                }
                                            },
                                            0
                                        ]
                                    },
                                    then: 0,
                                    else: {
                                        $multiply: [
                                            {
                                                $divide: [
                                                    {
                                                        $size: {
                                                            $filter: {
                                                                input: "$answers",
                                                                as: "answer",
                                                                cond: {
                                                                    $and: [
                                                                        { $eq: ["$$answer.isAnsweredTrue", false] },
                                                                        { $eq: ["$$answer.eliminateOption", 1] }
                                                                    ]
                                                                }
                                                            }
                                                        }
                                                    },
                                                    {
                                                        $size: {
                                                            $filter: {
                                                                input: "$answers",
                                                                as: "answer",
                                                                cond: {
                                                                    $eq: ["$$answer.eliminateOption", 1]
                                                                }
                                                            }
                                                        }
                                                    }
                                                ]
                                            },
                                            100
                                        ]
                                    }
                                }
                            }
                        }
                    }
                }
            }
        ]);

        let response = {
            qa: qa[0]?.qaTypeMetrics || {},
            qaTypeMetrics: qaTypeMetrics[0]?.qaTypeMetrics || {},
        }
        return response;
    } catch (error) {
        console.log(error);
    }
};
