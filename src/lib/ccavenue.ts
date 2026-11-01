import crypto from "crypto";

// CC Avenue's "Kit" integration encrypts/decrypts with AES-128-CBC, using the
// raw MD5 digest of the merchant's working key as the cipher key and a fixed
// 16-byte IV. This exact scheme is documented in CC Avenue's own integration
// kit samples — it is not something either side can change.
const IV = Buffer.from([
    0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
    0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f,
]);

function deriveKey(workingKey: string): Buffer {
    return crypto.createHash("md5").update(workingKey, "utf8").digest();
}

export function ccavenueEncrypt(plainText: string, workingKey: string): string {
    const cipher = crypto.createCipheriv("aes-128-cbc", deriveKey(workingKey), IV);
    return cipher.update(plainText, "utf8", "hex") + cipher.final("hex");
}

export function ccavenueDecrypt(encText: string, workingKey: string): string {
    const decipher = crypto.createDecipheriv("aes-128-cbc", deriveKey(workingKey), IV);
    return decipher.update(encText, "hex", "utf8") + decipher.final("utf8");
}

/** Parses CC Avenue's decrypted "key=value&key=value" response into an object. */
export function parseCcavenueResponse(decrypted: string): Record<string, string> {
    const result: Record<string, string> = {};
    for (const pair of decrypted.split("&")) {
        const idx = pair.indexOf("=");
        if (idx === -1) continue;
        const key = pair.slice(0, idx);
        const value = pair.slice(idx + 1);
        if (key) result[key] = decodeURIComponent(value.replace(/\+/g, " "));
    }
    return result;
}

export const CCAVENUE_ACTION_URL = "https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction";
