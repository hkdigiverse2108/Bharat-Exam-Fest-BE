"use strict"
import { Router } from 'express';
import { reqInfo, responseMessage } from '../helper';
import { config } from '../../config';
import { apiResponse } from '../utils';
import fs from 'fs';
import path from 'path';
import { pdfModel } from '../database';

const router = Router();

router.post("", async (req: any, res: any) => {
    reqInfo(req);
    try {
        if (!req.files || (!req.files.image && !req.files.pdf)) {
            return res.status(400).json({ message: "No file uploaded or invalid file type." });
        }

        let fileUrls;
        if (req.files.image) {
            const file = req.files.image[0]; // Get the first image file
            fileUrls = config.BACKEND_URL + `/images/${file.filename}`;
        } else if (req.files.pdf) {
            const file = req.files.pdf[0]; // Get the first PDF file
            const pdfType = req.body.pdfType;

            if (!pdfType || !["terms-condition", "privacy-policy"].includes(pdfType)) {
                return res.status(400).json({ message: "Invalid PDF type." });
            }

            // Define the directory path based on pdfType
            const pdfDir = path.join(__dirname, '../../pdfs', pdfType);
            // Check if the directory exists, if not, create it
            if (!fs.existsSync(pdfDir)) {
                fs.mkdirSync(pdfDir, { recursive: true });
            }

            // Remove existing files of the same type if they exist
            const existingFiles = fs.readdirSync(pdfDir);
            existingFiles.forEach(existingFile => {
                if (existingFile.endsWith('.pdf')) { // Check if the existing file is a PDF
                    fs.unlinkSync(path.join(pdfDir, existingFile)); // Remove the existing file
                }
            });

            const filePath = await path.join(pdfDir, file.filename);

            fs.renameSync(file.path, filePath);
            fileUrls = config.BACKEND_URL + `/pdfs/${pdfType}/${file.filename}`;

            let data = {
                link: fileUrls,
                type: pdfType
            }

            let pdf = await pdfModel.findOne({ type: pdfType });
            if (pdf) {
                await pdfModel.findOneAndUpdate({ type: pdfType }, { link: fileUrls });
            } else {
                await new pdfModel(data).save();
            }
        }

        return res.status(200).json(new apiResponse(200, responseMessage.addDataSuccess("File"), fileUrls, {}));
    } catch (error) {
        console.log("error => ", error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, {}));
    }
});

export let uploadRouter = router;