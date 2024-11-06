import jwt from 'jsonwebtoken'
import { cookies } from "next/headers"

export async function getUserFromCookie() {
    const secret = process.env.JWTSECRET;

    if (!secret) {
        throw new Error("JWTSECRET is not defined in the environment variables.");
    }
    const theCookie = cookies().get("ourhaikuapp")?.value
    if (theCookie) {
        try {
            const decode = jwt.verify(theCookie, secret)
            return decode
        } catch (err) {
            return null
        }
    }
}