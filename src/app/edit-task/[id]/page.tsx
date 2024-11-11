import { getCollection } from "@/lib/db";
import TaskForm from "@/components/TaskForm";
import { getUserFromCookie } from "@/lib/getUser";
import { ObjectId } from "mongodb";
import { redirect } from "next/navigation"

async function getDoc(id: string) {
    console.log("idの値:", id)
    const taskCollections = await getCollection("tasks")
    const result = await taskCollections.findOne({ _id: ObjectId.createFromHexString(id) })
    console.log("resultの値:", result)
    return result
}

type PageProps = {
    params: {
        id: string
    }
}

export default async function Page(props: PageProps) {
    // console.log("propsの値:", props)
    console.log("propsの値:", props.params.id)


    const doc = await getDoc(props.params.id)
    console.log("docの値", doc)
    if (doc === null)
        return redirect("/")

    const user = getUserFromCookie();
    // console.log("ここまできているか0")

    if (user?.userId !== doc?.author.toString()) {
        return redirect("/")
    }

    // console.log("ここまできているか1")


    const task = {
        // ...doc,
        _id: doc._id.toString(),
        task: doc.task
        // author: doc.author.toString(),

    }

    // console.log("ここまできているか2")

    return (
        <div>
            <h2 className="text-center text-4xl text-gray-600 mb-5">Edit Task</h2>
            <TaskForm task={task} action="edit" />
        </div>
    )
}
