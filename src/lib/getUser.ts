import jwt, { JwtPayload } from 'jsonwebtoken'
import { cookies } from "next/headers"

// type UserFromCookie = { userId: string } | null

export function getUserFromCookie() {
    const secret = process.env.JWTSECRET;

    if (!secret) {
        throw new Error("JWTSECRET is not defined in the environment variables.");
    }
    const theCookie = cookies().get("ourtodoapp")?.value

    if (theCookie) {
        try {
            const decode = jwt.verify(theCookie, secret) as JwtPayload
            console.log("decodeの値", decode);
            // console.log("decodeのuserIdの値",);
            return { userId: decode.userId }

        } catch (err) {
            return null
        }
    }

    return null
}