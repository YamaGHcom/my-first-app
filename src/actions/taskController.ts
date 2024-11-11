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
async function sharedTaskLogic(user: User, formData: FormData) {

    const errors: Errors = {}

    const ourTask = {
        task: formData.get("task"),
        author: ObjectId.createFromHexString(user.userId)
    }

    if (typeof ourTask.task != "string") ourTask.task = ""

    ourTask.task = ourTask.task.replace(/(\r\n|\n|\r)/g, " ")

    ourTask.task = ourTask.task.trim()

    if (ourTask.task.length > 100) errors.task = "Task name is too long: up to 100 characters."

    if (!isAlphaNumericWithBasics(ourTask.task)) errors.task = "No special characters allowed"

    if (ourTask.task.length == 0) errors.task = "This field is required."

    return {
        errors,
        ourTask
    }
}

//タスクを作成する関数
export const createTask = async function (prevState: { errors: Errors }, formData: FormData) {
    const user = await getUserFromCookie();

    if (!user) {
        return redirect('/');
    }

    const results = await sharedTaskLogic(user, formData)

    if (results.errors.task)
        return { errors: results.errors }

    //DBにタスクを保存
    const tasksCollection = await getCollection("tasks")
    await tasksCollection.insertOne(results.ourTask)
    return redirect('/')
}

//タスクを削除する関数
export const deleteTask = async function (formData: FormData) {
    const user = await getUserFromCookie()
    if (!user) {
        return redirect('/');
    }

    const tasksCollection = await getCollection("tasks")
    let taskId = formData.get("id")
    if (typeof taskId != "string") taskId = ""

    // 削除しようとしているタスクの作者と削除しようとしている人が一致するかの確認
    const taskInQuestion = await tasksCollection.findOne({ _id: ObjectId.createFromHexString(taskId) })
    if (taskInQuestion && taskInQuestion.author.toString() !== user.userId) {
        return redirect('/')
    }

    await tasksCollection.deleteOne({ _id: ObjectId.createFromHexString(taskId) })

    return redirect('/')
}

//タスクを編集する関数
export const editTask = async function (prevState, formData) {
    const user = await getUserFromCookie()
    if (!user) {
        return redirect('/');
    }
    const results = await sharedTaskLogic(formData, user)

    if (results.errors.task)
        return { errors: results.errors }

    //save into db
    const tasksCollection = await getCollection("tasks")
    let taskId = formData.get("taskId")

    // console.log("-------------------", taskId);
    // console.log(taskId.length);

    if (typeof taskId != "string") taskId = ""

    // make sure you are the other of this post, otherwise have operation failed 
    const taskInQuestion = await tasksCollection.findOne({ _id: ObjectId.createFromHexString(taskId) })
    if (taskInQuestion.author.toString() !== user.userId) {
        return redirect('/')
    }

    await tasksCollection.findOneAndUpdate({ _id: ObjectId.createFromHexString(taskId) }, { $set: results.ourTask })


    return redirect('/')
}