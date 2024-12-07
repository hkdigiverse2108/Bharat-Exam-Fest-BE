import { apiResponse, generateHash, generateUserId, getUniqueOtp, ROLE_TYPES, sendSms } from "../../utils";
import { userModel } from "../../database";
import { reqInfo, responseMessage } from "../../helper";
import { addUserSchema, deleteUserSchema, editUserSchema, getUserSchema } from "../../validation";

const ObjectId: any = require('mongoose').Types.ObjectId;

export const add_user = async (req, res) => {
    reqInfo(req);
    let { user } = req.headers, userId = null, prefix = "US";
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

        while (!userId) {
            let temp = generateUserId(prefix);
            const copy = await userModel.findOne({ uniqueId: temp, isDeleted: false });
            if (!copy) userId = temp;
        }
        value.uniqueId = userId;

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
    let { page, limit, search, blockFilter } = req.query;
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