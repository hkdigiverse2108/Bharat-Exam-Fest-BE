import { apiResponse, ROLE_TYPES } from "../utils";

export const VALIDATE_ROLE = (roles) => async (req: any, res: any, next) => {

    let { user } = req.headers;
    try {
        if (roles.includes(user.userType)) return next();
        return res.status(422).json(new apiResponse(422, "You are not allowed to perform this action", {}, {}));
    } catch (err) {
        console.log(err);
        return res.status(422).json(new apiResponse(422, "Unauthorized", {}, {}))
    }
}