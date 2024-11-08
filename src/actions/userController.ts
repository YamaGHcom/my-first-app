"use server"

import { getCollection } from "../lib/db"
import bcrypt from 'bcrypt'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { redirect } from "next/navigation"
import { ObjectId } from "mongodb";  // ObjectIdをmongodbからインポート

//JWTSECRETが設定されているかを確認してなければエラーを投げる
const secret = process.env.JWTSECRET;

if (!secret) {
    throw new Error("JWTSECRET is not defined in the environment variables.");
}

//文字列チェック
function isAlphaNumeric(x: string) {
    const regex = /^[a-zA-Z0-9]*$/
    return regex.test(x);
}

//フォームに入力されるデータのオブジェクトの型指定
type User = Document & {
    username: string,
    password: string,
}

//ログイン機能
export const login = async function (formData: User) {
    const failObject = {
        success: false,
        message: "Invalid username / password."
    }

    const ourUser = {
        username: formData.username,
        password: formData.password,
    }

    if (typeof ourUser.username != "string") ourUser.username = "";
    if (typeof ourUser.password != "string") ourUser.password = "";

    //データベースからUserコレクションを取ってきて、ユーザーネームが一致する人がいるかを確認
    const collection = await getCollection<User>("users")
    const user = await collection.findOne({ username: ourUser.username })

    if (!user) {
        return failObject
    }

    const matchOrnot = bcrypt.compareSync(ourUser.password, user.password)

    if (!matchOrnot) {
        return failObject
    }

    //JWTを作成
    const ourTokenValue = jwt.sign({ userId: user._id, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 }, secret)

    //JWTをクッキーに保存
    cookies().set("ourtodoapp", ourTokenValue, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 60 * 60 * 24,
        secure: true
    })

    return redirect("/")
}

//ログアウト機能
export const logout = async function () {
    cookies().delete("ourtodoapp")
    redirect("/")
}

//登録機能
export const register = async function (formData: User) {
    type Errors = {
        username?: string;
        password?: string;
    }

    const errors: Errors = {}


    const ourUser = {
        username: formData.username,
        password: formData.password,
    } as User;

    if (typeof ourUser.username != "string") ourUser.username = "";
    if (typeof ourUser.password != "string") ourUser.password = "";

    ourUser.username = ourUser.username.trim();
    ourUser.password = ourUser.password.trim();

    if (ourUser.username.length < 3) errors.username = "Username must be at least 3 characters."
    if (ourUser.username.length > 30) errors.username = "Username cannot exceed 30 characters."
    if (!isAlphaNumeric(ourUser.username)) errors.username = "Usernames can only contain letters and numbers."
    if (ourUser.username == "") errors.username = "You must provide a username."

    //既に同じユーザーネームが登録されているかの確認
    const usersCollection = await getCollection<User>("users")
    const usernameInQestion = await usersCollection.findOne({ username: ourUser.username })

    if (usernameInQestion) { errors.username = "That username is already in use." }

    if (ourUser.password.length < 12) errors.password = "Password must be at least 12 characters."
    if (ourUser.password.length > 50) errors.password = "Password cannot exceed 50 characters."
    if (ourUser.password == "") errors.password = "You must provide a password."

    if (errors.username || errors.password) {
        return {
            errors: errors,
            success: false
        }
    }

    //パスワードをハッシュ化
    const salt = bcrypt.genSaltSync(10)
    ourUser.password = bcrypt.hashSync(ourUser.password, salt)

    //データベースに新しいユーザーのデータを登録
    const newUser = await usersCollection.insertOne(ourUser)
    const userId = newUser.insertedId.toString()

    //JWTを作成
    const ourTokenValue = jwt.sign({ userId: userId, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 }, secret)

    //JWTをクッキーに保存
    cookies().set("ourtodoapp", ourTokenValue, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 60 * 60 * 24,
        secure: true
    })

    return {
        errors: errors,
        success: true
    }


}