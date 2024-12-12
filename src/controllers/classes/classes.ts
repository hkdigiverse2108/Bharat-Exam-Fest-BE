import { classesModel, userModel } from "../../database";
import { reqInfo, responseMessage } from "../../helper";
import { email_verification_mail } from "../../helper/mail";
import { apiResponse, generateHash, getUniqueOtp, ROLE_TYPES } from "../../utils";
import { addClassesSchema, deleteClassesSchema, editClassesSchema, getClassesSchema } from "../../validation";

const ObjectId = require('mongoose').Types.ObjectId;

export const add_classes = async (req, res) => {
    reqInfo(req)
    let { user } = req.headers
    try {
        const { error, value } = addClassesSchema.validate(req.body)
        if (error) {
            return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))
        }

        value.createdBy = new ObjectId(user._id)
        value.updatedBy = new ObjectId(user._id)

        let isExist = await classesModel.findOne({ name: value?.name, isDeleted: false })
        if (isExist) return res.status(404).json(new apiResponse(404, responseMessage?.dataAlreadyExist("Name"), {}, {}))

        isExist = await classesModel.findOne({ email: value?.email, isDeleted: false })
        if (isExist) return res.status(404).json(new apiResponse(404, responseMessage?.dataAlreadyExist("Email"), {}, {}))
        
        let referralCodeExist = await userModel.findOne({ referralCode: value?.referralCode, isDeleted: false })
        if(!referralCodeExist) referralCodeExist = await classesModel.findOne({ referralCode: value?.referralCode, isDeleted: false })
        if(!referralCodeExist) return res.status(404).json(new apiResponse(404, responseMessage?.dataAlreadyExist("referralCode"), {}, {}))
    
        value.password = await generateHash(value.password)
        value.userType = ROLE_TYPES.CLASSES
        
        const response = await new classesModel(value).save();
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.addDataError, {}, {}))
        
        return res.status(200).json(new apiResponse(200, responseMessage?.addDataSuccess("classes"), response, {}))
    } catch (error) {
        console.log("error", error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const edit_classes_by_id = async (req, res) => {
    reqInfo(req)
    let { user } = req.headers
    try {
        const { error, value } = editClassesSchema.validate(req.body)
        if (error) {
            return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))
        }
        value.updatedBy = new ObjectId(user._id)

        let isExist = await classesModel.findOne({ name: value.name, isDeleted: false, _id: { $ne: new ObjectId(value.classesId) } })
        if (isExist) return res.status(404).json(new apiResponse(404, responseMessage?.dataAlreadyExist("Name"), {}, {}))

        isExist = await classesModel.findOne({ email: value.email, isDeleted: false, _id: { $ne: new ObjectId(value.classesId) } })
        if (isExist) return res.status(404).json(new apiResponse(404, responseMessage?.dataAlreadyExist("Email"), {}, {}))

        if(value?.referralCode) {
            let referralCodeExist = await userModel.findOne({ referralCode: value?.referralCode, isDeleted: false })
            if(!referralCodeExist) referralCodeExist = await classesModel.findOne({ referralCode: value?.referralCode, isDeleted: false })
            if(!referralCodeExist) return res.status(404).json(new apiResponse(404, responseMessage?.dataAlreadyExist("referralCode"), {}, {}))
        }

        const response = await classesModel.findOneAndUpdate({ _id: new ObjectId(value.classesId) }, value, { new: true })
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.updateDataError("classes"), {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.updateDataSuccess("classes"), response, {}))
    } catch (error) {
        console.log("error", error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const delete_classes_by_id = async (req, res) => {
    reqInfo(req)
    try {
        const { error, value } = deleteClassesSchema.validate(req.params)
        if (error) {
            return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))
        }

        const response = await classesModel.findOneAndUpdate({ _id: new ObjectId(value.id) }, { isDeleted: true }, { new: true })
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("classes"), {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.deleteDataSuccess("classes"), response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const get_all_classes = async (req, res) => {
    reqInfo(req)
    let match: any = {}, { page, limit, search } = req.query, { user } = req.headers
    try {
        page = Number(page)
        limit = Number(limit)

        match.isDeleted = false

        if (search) {
            match.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { title: { $regex: search, $options: 'i' } }
            ]
        }

        if (user.userType === ROLE_TYPES.USER) {
            if (user?.friendReferralCode) {
                let classes = await classesModel.find({ referralCode: user?.friendReferralCode, isDeleted: false }).lean();
                if (classes && classes.length > 0) {
                    match.$or = [
                        { isForAllUsers: true },
                        { _id: { $in: classes.map(item => new ObjectId(item._id)) } }
                    ];
                } else {
                    match.isForAllUsers = true; // Fallback if no classes found
                }
            } else {
                match.isForAllUsers = true; // Fallback if no referral code
            }
        }

        const response = await classesModel.aggregate([
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

        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("classes"), {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("classes"), {
            classes_data: response[0]?.data || [],
            totalData: response[0]?.data_count[0]?.count || 0,
            state: {
                page: page,
                limit: limit,
                page_limit: Math.ceil(response[0]?.data_count[0]?.count / limit) || 1,
            },
        }, {}))
    } catch (error) {
        console.log("error", error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const get_classes_by_id = async (req, res) => {
    reqInfo(req)
    try {
        const { error, value } = getClassesSchema.validate(req.params)
        if (error) {
            return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))
        }

        const response = await classesModel.findOne({ _id: new ObjectId(value.id) })
        if (!response) return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound("classes"), {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("classes"), response, {}))
    } catch (error) {
        console.log("error", error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}