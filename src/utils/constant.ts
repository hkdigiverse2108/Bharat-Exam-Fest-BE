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

