import { pdfModel } from "../../database";
import { reqInfo, responseMessage } from "../../helper";
import { apiResponse } from "../../utils";

export const get_pdf = async (req: any, res: any) => {
    reqInfo(req);
    let { type } = req.query;
    try {

        if (!type || !["terms-condition", "privacy-policy"].includes(type)) {
            return res.status(400).json(new apiResponse(400, "Invalid PDF type", {}, {}))
        }

        let pdf = await pdfModel.findOne({ type: type });
        if (!pdf) return res.status(404).json(new apiResponse(404, responseMessage.getDataNotFound("PDF"), {}, {}))
        return res.status(200).json(new apiResponse(200, responseMessage.getDataSuccess("PDF"), pdf?.link, {}));
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error));
    }
}