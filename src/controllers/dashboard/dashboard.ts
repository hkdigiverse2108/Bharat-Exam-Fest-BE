import { balanceModel, contestModel, qaModel, questionModel, transactionModel, userModel } from "../../database";
import { reqInfo, responseMessage } from "../../helper";
import { apiResponse, ROLE_TYPES } from "../../utils";

let ObjectId = require('mongoose').Types.ObjectId;

export const dashboard = async (req, res) => {
    reqInfo(req)
    let { user } = req.headers, { dateFilter } = req.query;
    try {
        if(user.userType == ROLE_TYPES.CLASSES){
            let [sec1, sec2, sec3]: any = await Promise.all([
                (async () => {
                    let data = await getDashboardData(user)
                    return data
                })(),
                (async () => {
                    let data = await get_all_contests_user_count_and_fees(user, dateFilter)
                    return data
                })()
            ])
            return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("dashboard"), { sec1, sec2, sec3 }, {}));
        } else if(user?.userType === ROLE_TYPES.ADMIN){
            let [sec1, sec2, sec3]: any = await Promise.all([
                (async () => {
                    let data = await get_wallet_data(user, dateFilter)
                    return data
                })()
            ])
            return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("dashboard"), { sec1, sec2, sec3 }, {}));
        }
    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error));
    }
}

const getDashboardData = async (user) => {
    try {
        let contests = await contestModel.find({ classesId: new ObjectId(user._id), isDeleted: false }).countDocuments()
        let questions = await questionModel.find({ classesId: new ObjectId(user._id), isDeleted: false }).countDocuments()
        let users = await userModel.find({ friendReferralCode: user.referralCode, isDeleted: false }).countDocuments()
        return { contests, questions, users }
    } catch (error) {
        console.log(error);
    }
}

export const get_all_contests_user_count_and_fees = async (user, dateFilter) => { 
    let match: any = {}
    try {
        if(dateFilter){
            match.createdAt = { $gte: new Date(dateFilter.startDate), $lte: new Date(dateFilter.endDate) }
        }
        const contests = await contestModel.find({ classesId: new ObjectId(user._id), isDeleted: false }).lean();

        // Prepare the result array
        const result = await Promise.all(contests.map(async (contest) => {

            const users = await qaModel.find({ classesId: contest.classesId, isDeleted: false, ...match }).lean();
            
            const totalFees = users.length * contest.classesFees;

            return {
                contestName: contest.name,
                users: users.length,
                totalFees: totalFees || 0
            };
        }));

        // Calculate overall total fees
        const overallTotalFees = result.reduce((acc, contest) => acc + contest.totalFees, 0) || 0;

        return { contests: result, overallTotalFees };
    } catch (error) {
        console.log("error => ", error)
    }
}

export const get_wallet_data = async(user, dateFilter) => {
    let match: any = {}
    try {

        if(dateFilter){
            match.createdAt = { $gte: new Date(dateFilter.startDate), $lte: new Date(dateFilter.endDate) }
        }
        const result = await balanceModel.aggregate([
            { $match: { isDeleted: false, ...match } }, // Filter out deleted wallets
            { $group: { _id: null, totalAmount: { $sum: "$amount" } } } // Sum the amounts
        ]);

        let transactions = await transactionModel.aggregate([
            { $match: { isDeleted: false, ...match, description: { $ne : "Referral bonus"} } },
            { $group: { _id: null, totalAmount: { $sum: "$amount" } } }
        ])

        let balanceTotalAmount = result.length > 0 ? result[0].totalAmount : 0;
        let transactionTotalAmount = transactions.length > 0 ? transactions[0].totalAmount : 0;

        let totalAmount = balanceTotalAmount - transactionTotalAmount;
        return { balanceTotalAmount, transactionTotalAmount, totalAmount }
    } catch (error) {
        console.log("get wallet data error => ",error);
    }
}
