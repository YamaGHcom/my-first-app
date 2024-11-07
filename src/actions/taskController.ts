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
        line1: formData.get("line1"),
        line2: formData.get("line2"),
        line3: formData.get("line3"),
        author: ObjectId.createFromHexString(user.userId)
    }

    if (typeof ourHaiku.line1 != "string") ourHaiku.line1 = ""
    if (typeof ourHaiku.line2 != "string") ourHaiku.line2 = ""
    if (typeof ourHaiku.line3 != "string") ourHaiku.line3 = ""

    ourHaiku.line1 = ourHaiku.line1.replace(/(\r\n|\n|\r)/g, " ")
    ourHaiku.line2 = ourHaiku.line2.replace(/(\r\n|\n|\r)/g, " ")
    ourHaiku.line3 = ourHaiku.line3.replace(/(\r\n|\n|\r)/g, " ")

    ourHaiku.line1 = ourHaiku.line1.trim()
    ourHaiku.line2 = ourHaiku.line2.trim()
    ourHaiku.line3 = ourHaiku.line3.trim()

    if (ourHaiku.line1.length < 5) errors.line1 = "Too few syllables; must be 5."
    if (ourHaiku.line1.length > 25) errors.line1 = "Too many syllables; must be 5."

    if (ourHaiku.line2.length < 7) errors.line2 = "Too few syllables; must be 7."
    if (ourHaiku.line2.length > 35) errors.line2 = "Too many syllables; must be 7."

    if (ourHaiku.line3.length < 5) errors.line3 = "Too few syllables; must be 5."
    if (ourHaiku.line3.length > 25) errors.line3 = "Too many syllables; must be 5."

    if (!isAlphaNumericWithBasics(ourHaiku.line1)) errors.line1 = "No special characters allowed"
    if (!isAlphaNumericWithBasics(ourHaiku.line2)) errors.line2 = "No special characters allowed"
    if (!isAlphaNumericWithBasics(ourHaiku.line3)) errors.line3 = "No special characters allowed"

    if (ourHaiku.line1.length == 0) errors.line1 = "This field is required."
    if (ourHaiku.line2.length == 0) errors.line2 = "This field is required."
    if (ourHaiku.line3.length == 0) errors.line3 = "This field is required."

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
        return { errors: { line1: "ログイン試行回数の上限に達しました" } }
    }
    if (results.errors.line1 || results.errors.line2 || results.errors.line3)
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

    if (results.errors.line1 || results.errors.line2 || results.errors.line3)
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