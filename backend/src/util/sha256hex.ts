import crypto from "crypto";


export function sha256hex(input: string) {
    return crypto.createHash('SHA256')
        .update(input)
        .digest('hex');
}
