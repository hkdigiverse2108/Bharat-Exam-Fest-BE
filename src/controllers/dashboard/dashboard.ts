import { classesModel, contestModel, questionModel, userModel } from "../../database";

let ObjectId = require('mongoose').Types.ObjectId;

export const dashboard = async (req, res) => {
    let { user } = req.headers;
    let response = {
        user: user
    }
    return response
}

const getDashboardData = async (user) => {
    try {
        let contests = await contestModel.find({ classesId: new ObjectId(user._id), isDeleted: false }).countDocuments()
        let questions = await questionModel.find({ classesId: new ObjectId(user._id), isDeleted: false }).countDocuments()
        let users = await userModel.find({ friendReferralCode: user.referralCode, isDeleted: false }).countDocuments()
        let classes = await classesModel.find({ classesId: new ObjectId(user._id), isDeleted: false }).countDocuments()
        return { contests, questions, users, classes }
    } catch (error) {
        console.log(error);
    }
}