"use server"

import { redirect } from "next/navigation"
import { getUserFromCookie } from "../lib/getUser"
import { ObjectId } from "mongodb"
import { getCollection } from "../lib/db"

function isAlphaNumericWithBasics(text) {
    const regax = /^[a-zA-Z0-9 .,]*$/
    return regax.test(text);
}

async function sharedHaikuLogic(formData, user) {
    const errors = {}

    const ourHaiku = {
        task: formData.get("task"),
        author: ObjectId.createFromHexString(user.userId)
    }

    if (typeof ourHaiku.task != "string") ourHaiku.task = ""

    ourHaiku.task = ourHaiku.task.replace(/(\r\n|\n|\r)/g, " ")

    ourHaiku.task = ourHaiku.task.trim()

    if (ourHaiku.task.length < 5) errors.task = "Too few syllables; must be 5."
    if (ourHaiku.task.length > 25) errors.task = "Too many syllables; must be 5."

    if (!isAlphaNumericWithBasics(ourHaiku.task)) errors.task = "No special characters allowed"

    if (ourHaiku.task.length == 0) errors.task = "This field is required."

    return {
        errors,
        //errors:errors,
        ourHaiku
        //ourHaiku:ourHaiku
    }
}


export const createHaiku = async function (prevState, formData) {
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