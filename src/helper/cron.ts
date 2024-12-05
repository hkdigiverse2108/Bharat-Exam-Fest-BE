import { assignContestRanks } from "../controllers/qa/qa";
import { contestModel } from "../database";
import { CronJob } from 'cron'

export const removeOutdatedSlots = new CronJob('*/20 * * * * *', async function () {
    const currentTime = new Date();
    const tenMinutesAgo = new Date(currentTime.getTime() - 10 * 60 * 1000);
    try {
        // Find contests with slots older than 10 minutes
        const contests = await contestModel.find({
            slots: { $elemMatch: { $lt: tenMinutesAgo } }
        });
        
        for (const contest of contests) {
            contest.slots = contest.slots.filter(slot => slot >= tenMinutesAgo);
            await contest.save();
        }

    } catch (error) {
        console.error('Error removing outdated slots:', error);
    }
}, null, false, 'Asia/Kolkata')


export const assignContestRanksUser = new CronJob('*/10 * * * * *', async function () {
    try {
        await assignContestRanks();
    } catch (error) {
        console.error('Error removing outdated slots:', error);
    }
}, null, false, 'Asia/Kolkata')