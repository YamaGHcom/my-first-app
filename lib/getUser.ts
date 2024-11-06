import jwt from 'jsonwebtoken'
import { cookies } from "next/headers"

export async function getUserFromCookie() {
    const theCookie = cookies().get("ourhaikuapp")?.value
    if (theCookie) {
        try {
            const decode = jwt.verify(theCookie, process.env.JWTSECRET)
            return decode
        } catch (err) {
            return null
        }
    }
}