import { apiResponse, generateHash, generateReferralCode, generateUserId, getUniqueOtp, ROLE_TYPES, sendSms, TRANSACTION_STATUS, TRANSACTION_TYPE } from "../../utils";
import { classesModel, transactionModel, userModel } from "../../database";
import { reqInfo, responseMessage } from "../../helper";
import { addUserSchema, deleteUserSchema, editUserSchema, getUserSchema } from "../../validation";

const ObjectId: any = require('mongoose').Types.ObjectId;

export const add_user = async (req, res) => {
    reqInfo(req);
    let { user } = req.headers, userId = null, prefix = "US", referralCode = null;
    try {
        const { error, value } = addUserSchema.validate(req.body);
        if (error) {
            return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}));
        }

        value.createdBy = new ObjectId(user?._id)
        value.updatedBy = new ObjectId(user?._id)

        let isExist = await userModel.findOne({ email: value.email, userType: ROLE_TYPES.USER, isDeleted: false })
        if (isExist) return res.status(404).json(new apiResponse(404, responseMessage?.dataAlreadyExist("email"), {}, {}))

        isExist = await userModel.findOne({ "contact.mobile": value.contact.mobile, userType: ROLE_TYPES.USER, isDeleted: false })
        if (isExist) return res.status(404).json(new apiResponse(404, responseMessage?.dataAlreadyExist("mobile"), {}, {}))

        let otp = await getUniqueOtp()
        
        if(value?.contact?.mobile){
            let mobileNumber = value?.contact?.countryCode + value?.contact?.mobile
            let sms = await sendSms(mobileNumber, otp)
            if(!sms.sid) return res.status(404).json(new apiResponse(404, "Invalid Phone Number", {}, {}))
        }

        value.password = await generateHash(value.password)
        value.userType = ROLE_TYPES.USER
        value.otp = otp
        value.isMobileVerified = false

        let referralCodeExist = await userModel.findOne({ referralCode: value?.referralCode, isDeleted: false })
        if(!referralCodeExist) referralCodeExist = await classesModel.findOne({ referralCode: value?.referralCode, isDeleted: false })
        if(referralCodeExist) return res.status(404).json(new apiResponse(404, responseMessage?.dataAlreadyExist("referralCode"), {}, {}))
        
        while (!userId) {
            let temp = generateUserId(prefix);
            const copy = await userModel.findOne({ uniqueId: temp, isDeleted: false });
            if (!copy) userId = temp;
        }
        
        while (!referralCode) {
            let temp = generateReferralCode();
            const copy = await userModel.findOne({ referralCode: temp, isDeleted: false });
            if (!copy) referralCode = temp;
        }

        if(value?.referralCode) value.friendReferralCode = value?.referralCode
        
        value.uniqueId = userId;
        value.referralCode = referralCode;

        const response = await new userModel(value).save();
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.addDataError, {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage?.addDataSuccess("user"), response, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error));
    }
};

export const edit_user_by_id = async (req, res) => {
    reqInfo(req);
    let { user } = req.headers;
    try {
        const { error, value } = editUserSchema.validate(req.body);
        if (error) {
            return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}));
        }
        
        let isExist = await userModel.findOne({ _id: new ObjectId(value.userId), isDeleted: false })
        if (!isExist) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("user"), {}, {}))

        isExist = await userModel.findOne({ email: value.email, userType: ROLE_TYPES.USER, isDeleted: false, _id: { $ne: new ObjectId(value.userId) } })
        if (isExist) return res.status(404).json(new apiResponse(404, responseMessage?.dataAlreadyExist("email"), {}, {}))

        // isExist = await userModel.findOne({ "contact.mobile": value.contact.mobile, userType: ROLE_TYPES.USER, isDeleted: false, _id: { $ne: new ObjectId(value.userId) } })
        // if (isExist) return res.status(404).json(new apiResponse(404, responseMessage?.dataAlreadyExist("mobile"), {}, {}))
        if(value?.password) delete value.password

        value.updatedBy = new ObjectId(user?._id)
        const response = await userModel.findOneAndUpdate({ _id: new ObjectId(value.userId), isDeleted: false }, value, { new: true });
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.updateDataError("user"), {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage?.updateDataSuccess("user"), response, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error));
    }
};

export const delete_user_by_id = async (req, res) => {
    reqInfo(req);
    try {
        const { error, value } = deleteUserSchema.validate(req.params);
        if (error) {
            return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}));
        }
        const response = await userModel.findOneAndUpdate({ _id: new ObjectId(value.id), isDeleted: false }, { isDeleted: true }, { new: true });
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("user"), {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage?.deleteDataSuccess("user"), {}, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error));
    }
};

export const get_all_users = async (req, res) => {
    reqInfo(req);
    let { page, limit, search, blockFilter } = req.query, { user } = req.headers;
    let response: any, match: any = {};

    try {
        page = Number(page)
        limit = Number(limit)

        match.isDeleted = false;

        if (search) {
            match.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { "contact.mobile": { $regex: search, $options: 'i' } }
            ]
        }

        if(user?.userType === ROLE_TYPES.CLASSES){
           let users = await userModel.find({ friendReferralCode: user?.referralCode, isDeleted: false, userType: ROLE_TYPES.USER }).select("_id").lean()
           if(users){
                match._id = { $in: users.map(e => new ObjectId(e._id)) }
           }
        }

        if(blockFilter){
            if(blockFilter === "true"){
                match.isBlocked = true
            }else{
                match.isBlocked = false
            }
        }
        
        response = await userModel.aggregate([
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

        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("users"), {
            subject_data: response[0]?.data || [],
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

export const get_user_by_id = async (req, res) => {
    reqInfo(req);
    try {
        const { error, value } = getUserSchema.validate(req.params);
        if (error) {
            return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}));
        }

        const response = await userModel.findOne({ _id: new ObjectId(value.id), isDeleted: false });
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("user"), {}, {}));
        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("user"), response, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error));
    }
};

export const get_all_user = async(req, res) => {
    reqInfo(req)
    try {
        let response = await userModel.find({userType: ROLE_TYPES.USER, isDeleted: false}).select("firstName lastName _id")
        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("user"),response, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error));
    }
}

export const get_profile_image = async(req, res) => {
    reqInfo(req)
    try {
        let response = await userModel.findOne({_id: new ObjectId(req.params.id), isDeleted: false}).select("profileImage")
        if(!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("user"), {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("user"), response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error));
    }
}

export const get_user_wise_referral_code = async(req, res) => {
    reqInfo(req)
    let { user } = req.headers
    try {
        let users = await userModel.find({ referralCode: user?.referralCode, isDeleted: false })
        let responses:any = []
        for(let user of users){
            if(user?.userType === ROLE_TYPES.USER){
                let transaction = await transactionModel.find({ userId: new ObjectId(user._id), transactionType: TRANSACTION_TYPE.DEPOSIT, transactionStatus: TRANSACTION_STATUS.SUCCESS, isDeleted: false, description: "Referral bonus" })
                user.refferalCodeAmount = transaction.reduce((acc, curr) => acc + curr.amount, 0)
                let reponse = {
                    profileImage: user?.profileImage,
                    firstName: user?.firstName,
                    lastName: user?.lastName,
                    amount: user?.refferalCodeAmount
                }
                responses.push(reponse)
            }
        }
        let totalAmount = responses.reduce((acc, curr) => acc + curr.amount, 0)
        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("user"), {
            data: responses,
            totalAmount: totalAmount
        }, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error));
    }
}

export const get_user_winner_list = async (req, res) => {
    reqInfo(req);
    let { user } = req.headers;

    try {
        // Define date ranges
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const lastWeek = new Date(today);
        lastWeek.setDate(today.getDate() - 7);

        const lastMonth = new Date(today);
        lastMonth.setMonth(today.getMonth() - 1);

        const lastYear = new Date(today);
        lastYear.setFullYear(today.getFullYear() - 1);

        const response = await transactionModel.aggregate([
            {
                $match: {
                    isDeleted: false,
                    transactionType: TRANSACTION_TYPE.DEPOSIT,
                    transactionStatus: TRANSACTION_STATUS.SUCCESS,
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userInfo",
                },
            },
            {
                $unwind: "$userInfo",
            },
            {
                $group: {
                    _id: "$userId",
                    totalAmount: { $sum: "$amount" },
                    user: { $first: "$userInfo" },
                    transactions: {
                        $push: {
                            amount: "$amount",
                            createdAt: "$createdAt",
                        },
                    },
                },
            },
            {
                $addFields: {
                    todayAmount: {
                        $sum: {
                            $map: {
                                input: {
                                    $filter: {
                                        input: "$transactions",
                                        as: "transaction",
                                        cond: {
                                            $gte: ["$$transaction.createdAt", today],
                                        },
                                    },
                                },
                                as: "todayTransaction",
                                in: "$$todayTransaction.amount",
                            },
                        },
                    },
                    yesterdayAmount: {
                        $sum: {
                            $map: {
                                input: {
                                    $filter: {
                                        input: "$transactions",
                                        as: "transaction",
                                        cond: {
                                            $and: [
                                                { $gte: ["$$transaction.createdAt", yesterday] },
                                                { $lt: ["$$transaction.createdAt", today] },
                                            ],
                                        },
                                    },
                                },
                                as: "yesterdayTransaction",
                                in: "$$yesterdayTransaction.amount",
                            },
                        },
                    },
                    lastWeekAmount: {
                        $sum: {
                            $map: {
                                input: {
                                    $filter: {
                                        input: "$transactions",
                                        as: "transaction",
                                        cond: {
                                            $gte: ["$$transaction.createdAt", lastWeek],
                                        },
                                    },
                                },
                                as: "lastWeekTransaction",
                                in: "$$lastWeekTransaction.amount",
                            },
                        },
                    },
                    lastMonthAmount: {
                        $sum: {
                            $map: {
                                input: {
                                    $filter: {
                                        input: "$transactions",
                                        as: "transaction",
                                        cond: {
                                            $gte: ["$$transaction.createdAt", lastMonth],
                                        },
                                    },
                                },
                                as: "lastMonthTransaction",
                                in: "$$lastMonthTransaction.amount",
                            },
                        },
                    },
                    lastYearAmount: {
                        $sum: {
                            $map: {
                                input: {
                                    $filter: {
                                        input: "$transactions",
                                        as: "transaction",
                                        cond: {
                                            $gte: ["$$transaction.createdAt", lastYear],
                                        },
                                    },
                                },
                                as: "lastYearTransaction",
                                in: "$$lastYearTransaction.amount",
                            },
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 1,
                    totalAmount: 1,
                    user: {
                        firstName: "$user.firstName",
                        lastName: "$user.lastName",
                        profileImage: "$user.profileImage",
                    },
                    todayAmount: 1,
                    yesterdayAmount: 1,
                    lastWeekAmount: 1,
                    lastMonthAmount: 1,
                    lastYearAmount: 1,
                },
            },
            {
                $sort: { totalAmount: -1 },
            },
        ]);

        const todayUsers = response
            .filter(user => user.todayAmount > 0)
            .sort((a, b) => b.todayAmount - a.todayAmount)
            .map(user => ({
                _id: user._id,
                firstName: user.user.firstName,
                lastName: user.user.lastName,
                profileImage: user.user.profileImage,
                totalAmount: user.todayAmount,
            }));

        const yesterdayUsers = response
            .filter(user => user.yesterdayAmount > 0)
            .sort((a, b) => b.yesterdayAmount - a.yesterdayAmount)
            .map(user => ({
                _id: user._id,
                firstName: user.user.firstName,
                lastName: user.user.lastName,
                profileImage: user.user.profileImage,
                totalAmount: user.yesterdayAmount,
            }));

        const lastWeekUsers = response
            .filter(user => user.lastWeekAmount > 0)
            .sort((a, b) => b.lastWeekAmount - a.lastWeekAmount)
            .map(user => ({
                _id: user._id,
                firstName: user.user.firstName,
                lastName: user.user.lastName,
                profileImage: user.user.profileImage,
                totalAmount: user.lastWeekAmount,
            }));

        const lastMonthUsers = response
            .filter(user => user.lastMonthAmount > 0)
            .sort((a, b) => b.lastMonthAmount - a.lastMonthAmount)
            .map(user => ({
                _id: user._id,
                firstName: user.user.firstName,
                lastName: user.user.lastName,
                profileImage: user.user.profileImage,
                totalAmount: user.lastMonthAmount,
            }));

        const lastYearUsers = response
            .filter(user => user.lastYearAmount > 0)
            .sort((a, b) => b.lastYearAmount - a.lastYearAmount)
            .map(user => ({
                _id: user._id,
                firstName: user.user.firstName,
                lastName: user.user.lastName,
                profileImage: user.user.profileImage,
                totalAmount: user.lastYearAmount,
            }));


        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("user"), {
            todayUsers,
            yesterdayUsers,
            lastWeekUsers,
            lastMonthUsers,
            lastYearUsers
        }, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error));
    }
};