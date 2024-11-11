import { userModel } from "../../database";
import { balanceModel } from "../../database";
import { reqInfo, responseMessage } from "../../helper";
import { apiResponse, BALANCE_TYPE, ROLE_TYPES } from "../../utils";
import { addBalanceSchema } from "../../validation";

const ObjectId = require('mongoose').Types.ObjectId;

export const add_balance = async (req, res) => {
    reqInfo(req)
    try {
        const { error, value } = addBalanceSchema.validate(req.body)
        if (error) {
            return res.status(501).json(new apiResponse(501, error?.details[0]?.message, {}, {}))
        }
        let response = await new balanceModel(value).save();
        if(value.userId && value.amount && value.type === BALANCE_TYPE.DEPOSIT){
            await userModel.findOneAndUpdate({_id: new ObjectId(value.userId)}, {$inc: {walletBalance: value.amount}})
        }

        if(value.userId && value.amount && value.type === BALANCE_TYPE.WITHDRAW){
            await userModel.findOneAndUpdate({_id: new ObjectId(value.userId)}, {$inc: {walletBalance: -value.amount}})
        }

        if(!response) return res.status(200).json(new apiResponse(200, responseMessage?.addDataError, {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.addDataSuccess("balance"), response, {}))
    } catch (error) {
        console.log(error);
    }
}

export const get_all_balance = async(req, res) => {
    reqInfo(req)
    let match: any = {}, { user } = req.headers, { typeFilter, userFilter } = req.query;
    try {
        match.isDeleted = false;

        if(user.userType === ROLE_TYPES.USER){
            match.userId = new ObjectId(user.userId);
        }

        if(typeFilter){
            match.type = typeFilter;
        }

        if(userFilter){
            match.userId = new ObjectId(userFilter);
        }

        let response = await balanceModel.aggregate([
            {$match: match},
            {
                $facet: {
                    data: [
                        { $sort: { createdAt: -1 } }
                    ],
                    data_count: [{ $count: "count" }]
                }
            }
        ])

        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("balance"), response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const get_balance_by_id = async(req, res) => {
    reqInfo(req)
    try {
        let response = await balanceModel.findOne({_id: new ObjectId(req.params.id)})
        if(!response) return res.status(200).json(new apiResponse(200, responseMessage?.getDataNotFound("balance"), {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("balance"), response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))   
    }
}
