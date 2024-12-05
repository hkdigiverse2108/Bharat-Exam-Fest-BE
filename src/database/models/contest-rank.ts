const mongoose = require('mongoose')

const contestRanksSchema = new mongoose.Schema({
    contestId: { type: mongoose.Schema.Types.ObjectId, ref: 'contest' },
    qaIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'qa' }],
    contestStartDate: { type: Date },
    contestEndDate: { type: Date },
    ranks: [
        {
            startPlace: { type: String, default: null },
            endPlace: { type: String, default: null },
            price: { type: Number, default: null },
            winners: [
                {
                    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
                    qaId: { type: mongoose.Schema.Types.ObjectId, ref: 'qa'  },
                    rank: { type: Number, default: null },
                    points: { type: Number, default: null },
                    firstName: { type: String, default: null },
                    lastName: { type: String, default: null }
                }
            ]
        }
    ]
}, { timestamps: true, versionKey: false });

export const contestRankModel = mongoose.model('contest-rank', contestRanksSchema);
