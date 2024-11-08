import jwt from 'jsonwebtoken'
import { cookies } from "next/headers"

export function getUserFromCookie(): string | jwt.JwtPayload | null {
    const secret = process.env.JWTSECRET;

    if (!secret) {
        throw new Error("JWTSECRET is not defined in the environment variables.");
    }
    const theCookie = cookies().get("ourtodoapp")?.value

    if (theCookie) {
        try {
            const decode = jwt.verify(theCookie, secret)
            return decode
        } catch (err) {
            return null
        }
    }

    return null
}

//user={user as { userId: string }} に合うように戻り値の値を変更