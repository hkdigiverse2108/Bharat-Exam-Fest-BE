"use strict"
import { Router } from 'express'
import { responseMessage } from '../helper'
import { config } from '../../config'
import { apiResponse } from '../utils'

const router = Router()

router.post("", (req: any, res: any) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded or invalid file type." });
        }
        let file = req.file
        let imageUrl = config.BACKEND_URL + `/images/${file.filename}`;
        return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess("Image"), imageUrl, {}));
    } catch (error) {
        console.log("error => ", error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, {}));
    }
})

export const uploadRouter = router