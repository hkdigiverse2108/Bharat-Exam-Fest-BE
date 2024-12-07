import { qaModel } from "../../database";
import { responseMessage } from "../../helper";
import { apiResponse } from "../../utils";

const ObjectId = require("mongoose").Types.ObjectId;

export const contest_user_report = async (req, res) => {
    let { user } = req.headers;
    let { contestFilter, qaFilter } = req.query;

    try {
        let match:any = { userId: new ObjectId(user?._id) };
        if (contestFilter) match.contestId = new ObjectId(contestFilter);
        if (qaFilter) match._id = new ObjectId(qaFilter);

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
                        ] // Time in seconds
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
        

        // Fallback for empty result
        if (!qa.length) {
            return res.status(404).json(new apiResponse(404, "No data found", {}, {}));
        }

        let rank = 1000;

        return res.status(200).json(
            new apiResponse(200, responseMessage?.getDataSuccess("qa"), {
                totalPoints: qa[0]?.totalPoints || 0,
                correct: qa[0]?.correct || 0,
                incorrect: qa[0]?.incorrect || 0,
                unanswered: qa[0]?.unanswered || 0,
                rank: rank,
                time: qa[0]?.timeTaken || 0,
                qaTypeMetrics: qa[0]?.qaTypeMetrics || {}
            }, {})
        );
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error));
    }
};