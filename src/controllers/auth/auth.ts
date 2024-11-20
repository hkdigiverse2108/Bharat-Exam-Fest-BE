"use strict"
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Request, response, Response } from 'express'
import { classesModel, userModel } from '../../database'
import { apiResponse, compareHash, generateHash, generateToken, generateUserId, getUniqueOtp, ROLE_TYPES, sendSms } from '../../utils'
import { createData, getFirstMatch, reqInfo, responseMessage } from '../../helper'
import { config } from '../../../config'
import { forgotPasswordSchema, loginSchema, otpVerifySchema, resetPasswordSchema, signUpSchema } from "../../validation"
import { email_verification_mail } from '../../helper/mail'

const ObjectId = require('mongoose').Types.ObjectId
const jwt_token_secret = config.JWT_TOKEN_SECRET

export const signUp = async (req, res) => {
    reqInfo(req)
    try {
        const { error, value } = signUpSchema.validate(req.body)

        if (error) {
            return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}));
        }
        console.log("value => ", value);
        let isAlready: any = await getFirstMatch(userModel, {
            $or: [
                { email: value?.email },
                { "contact.mobile": value?.contact?.mobile }
            ]
        }, {}, {});

        if (isAlready) {
            if (isAlready.email === value?.email) {
                return res.status(404).json(new apiResponse(404, responseMessage?.alreadyEmail, {}, {}));
            }
        }

        if (isAlready?.isBlocked == true) return res.status(403).json(new apiResponse(403, responseMessage?.accountBlock, {}, {}))

        const payload = { ...value }
        payload.password = await generateHash(payload.password)
        payload.userType = ROLE_TYPES.ADMIN

        let otp = await getUniqueOtp()
        if (value?.contact?.mobile) {
            let mobileNumber = value?.contact?.countryCode + value?.contact?.mobile
            let sms = await sendSms(mobileNumber, otp)
            if (!sms.sid) return res.status(404).json(new apiResponse(404, "Invalid Mobile Number", {}, {}))
        }

        payload.otp = otp;
        payload.isEmailVerified = false

        let response = await createData(userModel, payload);

        response = {
            userType: response?.userType,
            _id: response?._id,
            email: response?.email,
        }

        return res.status(200).json(new apiResponse(200, "Signup Successfully", response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const otp_verification = async (req, res) => {
    reqInfo(req)
    try {

        const { error, value } = otpVerifySchema.validate(req.body)

        if (error) {
            return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}));
        }

        let data = await userModel.findOne(value);
        if (!data) data = await classesModel.findOne(value);

        if (!data) return res.status(400).json(new apiResponse(400, responseMessage?.invalidOTP, {}, {}))
        if (data.isBlocked == true) return res.status(403).json(new apiResponse(403, responseMessage?.accountBlock, {}, {}))
        // if (new Date(data.otpExpireTime).getTime() < new Date().getTime()) return res.status(410).json(new apiResponse(410, responseMessage?.expireOTP, {}, {}))
        
        if (data) {
            let response: any
            if(value?.userType == ROLE_TYPES.USER) {
                response = await userModel.findOneAndUpdate(value, { otp: null, isMobileVerified: true }, { new: true });
            } else if (value?.userType == ROLE_TYPES.ADMIN) {
                response = await userModel.findOneAndUpdate(value, { otp: null, isEmailVerified: true }, { new: true });
            } else if (value?.userType == ROLE_TYPES.CLASSES) {
                response = await classesModel.findOneAndUpdate(value, { otp: null, isEmailVerified: true }, { new: true });
            }
            const token = generateToken({
                _id: response._id,
                status: "Login",
                generatedOn: (new Date().getTime())
            })

            const result = {
                isEmailVerified: response?.isEmailVerified,
                _id: response?._id,
                email: response?.email,
                userType: response?.user,
                token,
            }
            return res.status(200).json(new apiResponse(200, responseMessage?.OTPverified, result, {}))
        }

    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const login = async (req, res) => {
    reqInfo(req)
    let response: any
    try {

        const { error, value } = loginSchema.validate(req.body)

        if (error) {
            return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}));
        }

        if(value?.userType == ROLE_TYPES.USER) {
            response = await userModel.findOne({ "contact.mobile": value?.uniqueId, userType: ROLE_TYPES.USER, isDeleted: false }).lean()
        } else if (value?.userType == ROLE_TYPES.ADMIN) {
            response = await userModel.findOne({ email: value?.uniqueId, userType: ROLE_TYPES.ADMIN, isDeleted: false }).lean()
        } else if (value?.userType == ROLE_TYPES.CLASSES) {
            response = await classesModel.findOne({ email: value?.uniqueId, userType: ROLE_TYPES.CLASSES, isDeleted: false }).lean()
        }

        if (!response) return res.status(400).json(new apiResponse(400, responseMessage?.userNotFound, {}, {}))
        if(response?.isMobileVerified === false) return res.status(403).json(new apiResponse(403, responseMessage?.mobileNotVerified, {}, {}))
        
        const passwordMatch = await compareHash(value.password, response.password)
        if (!passwordMatch) return res.status(400).json(new apiResponse(400, responseMessage?.invalidUserPasswordEmail, {}, {}))

        const token = await generateToken({
            _id: response._id,
            type: response.userType,
            status: "Login",
            generatedOn: (new Date().getTime())
        })

        if(value?.userType !== ROLE_TYPES.USER) {
            let otp = await getUniqueOtp()
    
            if(response?.email) {
                await email_verification_mail(response, otp);
            }

            let isExist = await userModel.findOneAndUpdate({_id: response?._id}, {otp}, {new: true})
            if(!isExist) isExist = await classesModel.findOneAndUpdate({_id: response?._id}, {otp}, {new: true})
        }

        const result: any = {
            ...response,
            token,
        }
        delete result.otp

        return res.status(200).json(new apiResponse(200, responseMessage?.loginSuccess, result, {}))

    } catch (error) {
        console.log("error", error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const forgot_password = async (req, res) => {
    reqInfo(req);
    try {

        const { error, value } = forgotPasswordSchema.validate(req.body)

        if (error) {
            return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}));
        }

        let data = await userModel.findOne({ $or: [{ email: value?.uniqueId }, { "contact.mobile": value?.uniqueId }], userType: value?.userType, isDeleted: false })
        if (!data) data = await classesModel.findOne({ $or: [{ email: value?.uniqueId }, { "contact.mobile": value?.uniqueId }], userType: value?.userType, isDeleted: false });

        if (!data) {
            return res.status(400).json(new apiResponse(400, responseMessage?.invalidEmailOrPhoneNumber, {}, {}));
        }
        if (data.isBlocked == true) {
            return res.status(403).json(new apiResponse(403, responseMessage?.accountBlock, {}, {}));
        }

        const otp = await getUniqueOtp()

        if (data?.contact?.mobile) {
            let mobileNumber = data?.contact?.countryCode + data?.contact?.mobile
            let sms = await sendSms(mobileNumber, otp)
            if (!sms.sid) return res.status(404).json(new apiResponse(404, "Invalid Phone Number", {}, {}))
        }
        // await userModel.findOneAndUpdate(value, { otp, otpExpireTime: new Date(new Date().setMinutes(new Date().getMinutes() + 10)) })
        let response = await userModel.findOneAndUpdate({ _id: new ObjectId(data?._id) }, { otp }, { new: true })
        if (!response) response = await classesModel.findOneAndUpdate({ _id: new ObjectId(data?._id) }, { otp }, { new: true })

        if (response) return res.status(200).json(new apiResponse(200, responseMessage?.otpSendSuccess, {}, {}));
        return res.status(501).json(new apiResponse(501, responseMessage?.errorMail, {}, `${response}`));

    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error));
    }
};

export const reset_password = async (req, res) => {
    reqInfo(req)

    try {

        const { error, value } = resetPasswordSchema.validate(req.body)

        if (error) {
            return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}));
        }

        const hashPassword = await generateHash(value.password)

        const payload = { password: hashPassword }

        let response = await userModel.findOneAndUpdate({ $or: [{ email: value?.uniqueId }, { "contact.mobile": value?.uniqueId }], userType: value?.userType, isDeleted: false }, payload, { new: true })
        if (!response) response = await classesModel.findOneAndUpdate({ $or: [{ email: value?.uniqueId }, { "contact.mobile": value?.uniqueId }], userType: value?.userType, isDeleted: false }, payload, { new: true })

        if (!response) return res.status(405).json(new apiResponse(405, responseMessage?.resetPasswordError, {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.resetPasswordSuccess, response, {}))

    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const adminSignUp = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let body = req.body,
            otpFlag = 1; // OTP has already assign or not for cross-verification
        let isAlready = await userModel.findOne({ email: body?.email, isActive: true, userType: 1 })
        if (isAlready) return res.status(409).json(new apiResponse(409, responseMessage?.alreadyEmail, {}, {}))

        if (isAlready?.isBlock == true) return res.status(403).json(new apiResponse(403, responseMessage?.accountBlock, {}, {}))

        const hashPassword = await generateHash(body.password)
        delete body.password
        body.password = hashPassword
        body.userType = 1  //to specify this user is admin
        let response = await new userModel(body).save()
        response = {
            userType: response?.userType,
            isEmailVerified: response?.isEmailVerified,
            _id: response?._id,
            email: response?.email,
        }

        const otp = await getUniqueOtp()

        // let result: any = await email_verification_mail(response, otp);
        // if (result) {
        //     await userModel.findOneAndUpdate(body, { otp, otpExpireTime: new Date(new Date().setMinutes(new Date().getMinutes() + 10)) })
        return res.status(200).json(new apiResponse(200, `${response}`, {}, {}));
        // }
        // return res.status(501).json(new apiResponse(501, responseMessage?.errorMail, {}, `${result}`));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const adminLogin = async (req: Request, res: Response) => { //email or password // phone or password
    let body = req.body,
        response: any
    reqInfo(req)
    try {
        response = await userModel.findOneAndUpdate({ email: body?.email, userType: 1, isActive: true }, { isLoggedIn: true }).select('-__v -createdAt -updatedAt')

        if (!response) return res.status(400).json(new apiResponse(400, responseMessage?.invalidUserPasswordEmail, {}, {}))
        if (response?.isBlock == true) return res.status(403).json(new apiResponse(403, responseMessage?.accountBlock, {}, {}))

        const passwordMatch = await bcryptjs.compare(body.password, response.password)
        if (!passwordMatch) return res.status(400).json(new apiResponse(400, responseMessage?.invalidUserPasswordEmail, {}, {}))
        const token = jwt.sign({
            _id: response._id,
            type: response.userType,
            status: "Login",
            generatedOn: (new Date().getTime())
        }, jwt_token_secret)

        response = {
            isEmailVerified: response?.isEmailVerified,
            userType: response?.userType,
            _id: response?._id,
            email: response?.email,
            token,
        }
        return res.status(200).json(new apiResponse(200, responseMessage?.loginSuccess, response, {}))

    } catch (error) {
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const change_user_password = async (req, res) => {
    reqInfo(req)
    let body = req.body
    try {
        let user = await userModel.findOne({ _id: new ObjectId(body.userId), isDeleted: false })
        if(!user) user = await classesModel.findOne({ _id: new ObjectId(body.userId), isDeleted: false })
        if (!user) return res.status(405).json(new apiResponse(405, responseMessage?.getDataNotFound('user'), {}, {}));

        if (body.newPassword && body.oldPassword) {
            const isPasswordMatch = await bcryptjs.compare(body.oldPassword, user.password);
            if (!isPasswordMatch) return res.status(400).json(new apiResponse(400, 'Old password is incorrect', {}, {}));

            const salt = await bcryptjs.genSaltSync(10)
            const hashPassword = await bcryptjs.hash(body.newPassword, salt)
            delete body.oldPassword
            delete body.newPassword
            body.password = hashPassword
        }
        let otp = await getUniqueOtp()
        body.otp = otp

        let response = await userModel.findOneAndUpdate({ _id: new ObjectId(body.userId), isDeleted: false }, body, { new: true })
        if (!response) response = await classesModel.findOneAndUpdate({ _id: new ObjectId(body.userId), isDeleted: false }, body, { new: true })
        
        if (!response) return res.status(405).json(new apiResponse(405, responseMessage?.updateDataError('user'), {}, {}))
        

        if (response?.email) {
            await email_verification_mail(response, otp);
        }

        return res.status(200).json(new apiResponse(200, responseMessage?.updateDataSuccess('user'), response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}