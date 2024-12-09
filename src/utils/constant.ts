export class apiResponse {
    private status: number | null
    private message: string | null
    private data: any | null
    private error: any | null
    constructor(status: number, message: string, data: any, error: any) {
        this.status = status
        this.message = message
        this.data = data
        this.error = error
    }
}

export const ROLE_TYPES = {
    USER: "user",
    ADMIN: "admin",
    UPLOAD: "upload",
    CLASSES: "classes"
}

export const GENDER_TYPES = {
    MALE: "male",
    FEMALE: "female"
}

export const BALANCE_STATUS = {
    SUCCESS: "success",
    FAILED: "failed"
}

export const BALANCE_TYPE = {
    DEPOSIT: "deposit",
    WITHDRAW: "withdraw"
}

export const BANNER_TYPE = {
    HOME: "home",
    RESULTS: "results"
}

export const KYC_STATUS = {
    PENDING: "pending",
    VERIFIED: "verified",
    UNVERIFIED: "unverified"
}

export const ID_PROOF = {
    AADHAR_CARD: "aadharCard",
    PAN_CARD: "panCard",
    VOTER_ID: "voterId",
    PASSPORT: "passport"
}

export const Q_A_TYPE = {
    SURE: "100%Sure",
    LOGIC_PLAY: "logicPlay",
    INTUITION_HIT: "intuitionHit",
    BLIND_FIRE: "blindFire",
    SKIP: "skip",
    FEAR_DRIVER_SKIP: "fearDriverSkip"
}

export const WHY_FALSE = {
    SILLY_MISTAKE: "sillyMistake",
    CONCEPT_MISTAKE: "conceptMistake",
    REVISION_LACKING: "revisionLacking",
    OUT_OF_MATERIAL: "outOfMaterial",
    CURRENT_AFFAIR_NOT_READ: "currentAffairNotRead"
}

export const TYPE_QUESTION = {
    CONCEPT: 'concept',
    APTITUDE: 'aptitude',
    RANDOM: 'random'
}

export const SKIP_ELIMINATE = {
    1: 1,
    2: 2
}

export const QUESTION_TYPE = {
    NORMAL: 'normal',
    STATEMENT: 'statement',
    PAIR: 'pair'
}

export const QUESTION_ANSWER = {
    A: 'A',
    B: 'B',
    C: 'C',
    D: 'D'
}

export const TRANSACTION_TYPE = {
    DEPOSIT: "deposit",
    WITHDRAW: "withdraw"
}

export const TRANSACTION_STATUS = {
    SUCCESS: "success",
    FAILED: "failed"
}

export function generateHourlySlots(startDate: Date, endDate: Date): string[] {
    const slots: string[] = [];
    let current = new Date(startDate);

    while (current < endDate) {
        slots.push(current.toISOString().replace('T', ' ').substring(0, 19));
        current.setHours(current.getHours() + 1);
    }

    return slots;
}

export function generateReferralCode() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    
    let code = '';
    
    // Generate three random letters
    for (let i = 0; i < 3; i++) {
        code += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    
    // Generate three random numbers
    for (let i = 0; i < 3; i++) {
        code += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    
    return code;
}