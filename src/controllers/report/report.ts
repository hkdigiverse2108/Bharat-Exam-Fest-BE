// import { qaModel } from "../../database";
// import { responseMessage } from "../../helper";
// import { apiResponse } from "../../utils";

// const ObjectId = require("mongoose").Types.ObjectId;

// export const contest_user_report = async (req, res) => {
//     let { user } = req.headers;
//     let { contestFilter } = req.query;

//     try {
//         let match: any = { userId: new ObjectId(user?._id) };
//         if (contestFilter) match.contestId = new ObjectId(contestFilter);

//         let qa = await qaModel.aggregate([
//             { $match: match },
//             {
//                 $project: {
//                     totalPoints: 1,
//                     totalRightAnswer: 1,
//                     totalWrongAnswer: 1,
//                     totalSkippedAnswer: 1,
//                     contestStartDate: 1,
//                     contestEndDate: 1,
//                     answers: 1,
//                     totalQuestions: {
//                         $add: ["$totalRightAnswer", "$totalWrongAnswer", "$totalSkippedAnswer"]
//                     }
//                 }
//             },
//             {
//                 $addFields: {
//                     correct: "$totalRightAnswer",
//                     incorrect: "$totalWrongAnswer",
//                     unanswered: "$totalSkippedAnswer",
//                     timeTaken: {
//                         $divide: [
//                             { $subtract: ["$contestEndDate", "$contestStartDate"] },
//                             1000
//                         ]
//                     },
//                     qaTypeMetrics: {
//                         $reduce: {
//                             input: "$answers",
//                             initialValue: {
//                                 sure: { correct: 0, total: 0 },
//                                 logicPlay: { correct: 0, total: 0 },
//                                 intuitionHit: { correct: 0, total: 0 },
//                                 blindFire: { correct: 0, total: 0 },
//                                 skip: { correct: 0, total: 0 },
//                                 fearSkip: { correct: 0, total: 0 }
//                             },
//                             in: {
//                                 sure: {
//                                     correct: {
//                                         $add: ["$$value.sure.correct", {
//                                             $cond: [{ $and: [
//                                                 { $eq: ["$$this.type", "100%Sure"] },
//                                                 { $eq: ["$$this.isAnsweredTrue", true] }
//                                             ] }, 1, 0]
//                                         }]
//                                     },
//                                     total: {
//                                         $add: ["$$value.sure.total", { $cond: [{ $eq: ["$$this.type", "100%Sure"] }, 1, 0] }]
//                                     }
//                                 },
//                                 logicPlay: {
//                                     correct: {
//                                         $add: ["$$value.logicPlay.correct", {
//                                             $cond: [{ $and: [
//                                                 { $eq: ["$$this.type", "logicPlay"] },
//                                                 { $eq: ["$$this.isAnsweredTrue", true] }
//                                             ] }, 1, 0]
//                                         }]
//                                     },
//                                     total: {
//                                         $add: ["$$value.logicPlay.total", { $cond: [{ $eq: ["$$this.type", "logicPlay"] }, 1, 0] }]
//                                     }
//                                 },
//                                 intuitionHit: {
//                                     correct: {
//                                         $add: ["$$value.intuitionHit.correct", {
//                                             $cond: [{ $and: [
//                                                 { $eq: ["$$this.type", "intuitionHit"] },
//                                                 { $eq: ["$$this.isAnsweredTrue", true] }
//                                             ] }, 1, 0]
//                                         }]
//                                     },
//                                     total: {
//                                         $add: ["$$value.intuitionHit.total", { $cond: [{ $eq: ["$$this.type", "intuitionHit"] }, 1, 0] }]
//                                     }
//                                 },
//                                 blindFire: {
//                                     correct: {
//                                         $add: ["$$value.blindFire.correct", {
//                                             $cond: [{ $and: [
//                                                 { $eq: ["$$this.type", "blindFire"] },
//                                                 { $eq: ["$$this.isAnsweredTrue", true] }
//                                             ] }, 1, 0]
//                                         }]
//                                     },
//                                     total: {
//                                         $add: ["$$value.blindFire.total", { $cond: [{ $eq: ["$$this.type", "blindFire"] }, 1, 0] }]
//                                     }
//                                 },
//                                 skip: {
//                                     correct: {
//                                         $add: ["$$value.skip.correct", {
//                                             $cond: [{ $and: [
//                                                 { $eq: ["$$this.type", "skip"] },
//                                                 { $eq: ["$$this.isAnsweredTrue", true] }
//                                             ] }, 1, 0]
//                                         }]
//                                     },
//                                     total: {
//                                         $add: ["$$value.skip.total", { $cond: [{ $eq: ["$$this.type", "skip"] }, 1, 0] }]
//                                     }
//                                 },
//                                 fearSkip: {
//                                     correct: {
//                                         $add: ["$$value.fearSkip.correct", {
//                                             $cond: [{ $and: [
//                                                 { $eq: ["$$this.type", "fearSkip"] },
//                                                 { $eq: ["$$this.isAnsweredTrue", true] }
//                                             ] }, 1, 0]
//                                         }]
//                                     },
//                                     total: {
//                                         $add: ["$$value.fearSkip.total", { $cond: [{ $eq: ["$$this.type", "fearSkip"] }, 1, 0] }]
//                                     }
//                                 }
//                             }
//                         }
//                     }
//                 }
//             }
//         ]);

//         // Fallback for empty result
//         if (!qa.length) {
//             return res.status(404).json(new apiResponse(404, "No data found", {}, {}));
//         }

//         let rank = 1000;

//         return res.status(200).json(
//             new apiResponse(200, responseMessage?.getDataSuccess("qa"), {
//                 totalPoints: qa[0]?.totalPoints || 0,
//                 correct: qa[0]?.correct || 0,
//                 incorrect: qa[0]?.incorrect || 0,
//                 unanswered: qa[0]?.unanswered || 0,
//                 rank: rank,
//                 time: qa[0]?.timeTaken || 0,
//                 qaTypeMetrics: qa[0]?.qaTypeMetrics || {}
//             }, {})
//         );
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error));
//     }
// };

import { qaModel } from "../../database";
import { responseMessage } from "../../helper";
import { apiResponse } from "../../utils";

const ObjectId = require("mongoose").Types.ObjectId;

export const contest_user_report = async (req, res) => {
    let { user } = req.headers;
    let { contestFilter } = req.query;

    try {
        // Build the match query
        let match: any = { userId: new ObjectId(user?._id) };
        if (contestFilter) match.contestId = new ObjectId(contestFilter);

        // Aggregate data from the database
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
                        $reduce: {
                            input: "$answers",
                            initialValue: {
                                sure: { direct: { correct: 0, total: 0 }, fiftyFifty: { correct: 0, total: 0 }, oneEliminate: { correct: 0, total: 0 } },
                                logicPlay: { direct: { correct: 0, total: 0 }, fiftyFifty: { correct: 0, total: 0 }, oneEliminate: { correct: 0, total: 0 } },
                                intuitionHit: { direct: { correct: 0, total: 0 }, fiftyFifty: { correct: 0, total: 0 }, oneEliminate: { correct: 0, total: 0 } },
                                blindFire: { direct: { correct: 0, total: 0 }, fiftyFifty: { correct: 0, total: 0 }, oneEliminate: { correct: 0, total: 0 } },
                                skip: { direct: { correct: 0, total: 0 }, fiftyFifty: { correct: 0, total: 0 }, oneEliminate: { correct: 0, total: 0 } },
                                fearDriverSkip: { direct: { correct: 0, total: 0 }, fiftyFifty: { correct: 0, total: 0 }, oneEliminate: { correct: 0, total: 0 } }
                            },
                            in: {
                                sure: {
                                    direct: {
                                        correct: {
                                            $add: ["$$value.sure.direct.correct", {
                                                $cond: [{ $and: [
                                                    { $eq: ["$$this.type", "100%Sure"] },
                                                    { $eq: ["$$this.isAnsweredTrue", true] }
                                                ] }, 1, 0]
                                            }]
                                        },
                                        total: {
                                            $add: ["$$value.sure.direct.total", { $cond: [{ $and: [
                                                { $eq: ["$$this.type", "100%Sure"] }
                                            ] }, 1, 0] }]
                                        }
                                    },
                                    fiftyFifty: {
                                        correct: {
                                            $add: ["$$value.sure.fiftyFifty.correct", {
                                                $cond: [{ $and: [
                                                    { $eq: ["$$this.type", "100%Sure"] },
                                                    { $eq: ["$$this.isAnsweredTrue", true] },
                                                    { $eq: ["$$this.eliminateOption", 2] }
                                                ] }, 1, 0]
                                            }]
                                        },
                                        total: {
                                            $add: ["$$value.sure.fiftyFifty.total", { $cond: [{ $and: [
                                                { $eq: ["$$this.type", "100%Sure"] },
                                                { $eq: ["$$this.eliminateOption", 2] }
                                            ] }, 1, 0] }]
                                        }
                                    },
                                    oneEliminate: {
                                        correct: {
                                            $add: ["$$value.sure.oneEliminate.correct", {
                                                $cond: [{ $and: [
                                                    { $eq: ["$$this.type", "100%Sure"] },
                                                    { $eq: ["$$this.isAnsweredTrue", true] },
                                                    { $eq: ["$$this.eliminateOption", 1] }
                                                ] }, 1, 0]
                                            }]
                                        },
                                        total: {
                                            $add: ["$$value.sure.oneEliminate.total", { $cond: [{ $and: [
                                                { $eq: ["$$this.type", "100%Sure"] },
                                                { $eq: ["$$this.eliminateOption", 1] }
                                            ] }, 1, 0] }]
                                        }
                                    }
                                },
                                logicPlay: "$$value.logicPlay",
                                intuitionHit: "$$value.intuitionHit",
                                blindFire: "$$value.blindFire",
                                skip: "$$value.skip",
                                fearDriverSkip: "$$value.fearDriverSkip"
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

        // Mock rank calculation for demo purposes (adjust logic as needed)
        let rank = 1000; // Example static rank, replace with your logic

        // Respond with calculated metrics
        return res.status(200).json(
            new apiResponse(200, responseMessage?.getDataSuccess("qa"), {
                totalPoints: qa[0]?.totalPoints || 0,
                correct: qa[0]?.correct || 0,
                incorrect: qa[0]?.incorrect || 0,
                unanswered: qa[0]?.unanswered || 0,
                rank: rank,
                time: qa[0]?.timeTaken || 0, // Time in seconds
                qaTypeMetrics: qa[0]?.qaTypeMetrics || {}
            }, {})
        );
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error));
    }
};
