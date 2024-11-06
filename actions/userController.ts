"use server"

import { getCollection } from "../lib/db.ts"
import bcrypt from 'bcrypt'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { redirect } from "next/navigation"

//文字列チェック
function isAlphaNumeric(x: string) {
    const regex = /^[a-zA-Z0-9]*$/
    return regex.test(x);
}

//フォームオブジェクトの型指定？
type User = {
    username: string,
    password: string,
}

//ログイン機能
export const login = async function (prevState: User, formData: User) {
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

    const collection = await getCollection("users")
    const user = await collection.findOne({ username: ourUser.username })

    if (!user) {
        return failObject
    }

    const matchOrnot = bcrypt.compareSync(ourUser.password, user.password)

    if (!matchOrnot) {
        return failObject
    }

    //create jwt value
    //JWTを作成
    const ourTokenValue = jwt.sign({ skycolor: "blue", userId: user._id, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 }, process.env.JWTSECRET)

    //log the user in by giving them a cookie
    //JWTをクッキーに保存
    cookies().set("ourhaikuapp", ourTokenValue, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 60 * 60 * 24,
        secure: true
    })

    return redirect("/")
}

//ログアウト機能
export const logout = async function () {
    cookies().delete("ourhaikuapp")
    redirect("/")
}

//登録機能
export const register = async function (prevState, formData) {
    const errors = {}

    const ourUser = {
        username: formData.get("username"),
        password: formData.get("password"),
    }

    if (typeof ourUser.username != "string") ourUser.username = "";
    if (typeof ourUser.password != "string") ourUser.password = "";

    ourUser.username = ourUser.username.trim();
    ourUser.password = ourUser.password.trim();

    if (ourUser.username.length < 3) errors.username = "Username must be at least 3 characters."
    if (ourUser.username.length > 30) errors.username = "Username cannot exceed 30 characters."
    if (!isAlphaNumeric(ourUser.username)) errors.username = "Usernames can only contain letters and numbers."
    if (ourUser.username == "") errors.username = "You must provide a username."

    //see if username already exists or not
    const usersCollection = await getCollection("users")
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

    //hash password first
    //パスワードをハッシュ化
    const salt = bcrypt.genSaltSync(10)
    ourUser.password = bcrypt.hashSync(ourUser.password, salt)

    //storing a new user in the database
    //データベースに新しいユーザーのデータを登録
    const newUser = await usersCollection.insertOne(ourUser)
    const userId = newUser.insertedId.toString()

    //create our JWT value
    //JWTを作成
    const ourTokenValue = jwt.sign({ skycolor: "blue", userId: userId, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 }, process.env.JWTSECRET)

    //log the user in by giving them a cookie
    //JWTをクッキーに保存
    cookies().set("ourhaikuapp", ourTokenValue, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 60 * 60 * 24,
        secure: true
    })

    return {
        success: true
    }


}