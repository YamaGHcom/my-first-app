"use server"

import { redirect } from "next/navigation"
import { getUserFromCookie } from "../lib/getUser"
import { ObjectId } from "mongodb"
import { getCollection } from "../lib/db"

//タスクに使える文字指定
function isAlphaNumericWithBasics(text: string) {
    const regax = /^[a-zA-Z0-9 .,]*$/
    return regax.test(text);
}

//ユーザーの型指定
type User = {
    userId: string;
}

//エラーの型指定
type Errors = {
    task?: string;
}

//入力されたタスクの文字制限や使用できる文字の種類をチェックするバリデーション関数
async function sharedHaikuLogic(user: User, formData: FormData) {

    const errors: Errors = {}

    const ourHaiku = {
        task: formData.get("task"),
        author: ObjectId.createFromHexString(user.userId)
    }

    if (typeof ourHaiku.task != "string") ourHaiku.task = ""

    ourHaiku.task = ourHaiku.task.replace(/(\r\n|\n|\r)/g, " ")

    ourHaiku.task = ourHaiku.task.trim()

    if (ourHaiku.task.length > 100) errors.task = "Task name is too long: up to 100 characters."

    if (!isAlphaNumericWithBasics(ourHaiku.task)) errors.task = "No special characters allowed"

    if (ourHaiku.task.length == 0) errors.task = "This field is required."

    return {
        errors,
        ourHaiku
    }
}


export const createHaiku = async function (prevState, formData: ourHaiku) {
    const count = prevState.count
    console.log("prevState", prevState)
    const user = await getUserFromCookie()
    if (!user) {
        return redirect('/');
    }
    const results = await sharedHaikuLogic(formData, user)

    if (count >= 3) {
        return { errors: { task: "ログイン試行回数の上限に達しました" } }
    }
    if (results.errors.task)
        return { errors: results.errors, count: count + 1 }


    //save into db
    const haikusCollection = await getCollection("haikus")
    const newHaiku = await haikusCollection.insertOne(results.ourHaiku)
    return redirect('/')
}

export const deleteTask = async function (formData) {
    const user = await getUserFromCookie()
    if (!user) {
        return redirect('/');
    }

    const haikusCollection = await getCollection("haikus")
    let haikuId = formData.get("id")
    if (typeof haikuId != "string") haikuId = ""

    // make sure you are the other of this post, otherwise have operation failed 
    const haikuInQuestion = await haikusCollection.findOne({ _id: ObjectId.createFromHexString(haikuId) })
    if (haikuInQuestion.author.toString() !== user.userId) {
        return redirect('/')
    }

    await haikusCollection.deleteOne({ _id: ObjectId.createFromHexString(haikuId) })

    return redirect('/')
}



export const editHaiku = async function (prevState, formData) {
    const user = await getUserFromCookie()
    if (!user) {
        return redirect('/');
    }
    const results = await sharedHaikuLogic(formData, user)

    if (results.errors.task)
        return { errors: results.errors }

    //save into db
    const haikusCollection = await getCollection("haikus")
    let haikuId = formData.get("haikuId")

    // console.log("-------------------", haikuId);
    // console.log(haikuId.length);

    if (typeof haikuId != "string") haikuId = ""

    // make sure you are the other of this post, otherwise have operation failed 
    const haikuInQuestion = await haikusCollection.findOne({ _id: ObjectId.createFromHexString(haikuId) })
    if (haikuInQuestion.author.toString() !== user.userId) {
        return redirect('/')
    }

    await haikusCollection.findOneAndUpdate({ _id: ObjectId.createFromHexString(haikuId) }, { $set: results.ourHaiku })


    return redirect('/')
}