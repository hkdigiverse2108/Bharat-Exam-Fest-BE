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
    APPROVED: "approved",
    REJECTED: "rejected"
}

export const ID_PROOF = {
    AADHAR_CARD: "aadharCard",
    PAN_CARD: "panCard",
    VOTER_ID: "voterId",
    PASSPORT: "passport"
}
