import { getCollection } from "@/lib/db";
import TaskForm from "@/components/TaskForm";
import { getUserFromCookie } from "@/lib/getUser";
import { ObjectId } from "mongodb";
import { redirect } from "next/navigation"

async function getDoc(id: string) {
    const taskCollections = await getCollection("tasks")
    const result = await taskCollections.findOne({ _id: ObjectId.createFromHexString(id) })
    return result
}

type PageProps = {
    params: {
        id: string
    }
}

export default async function Page(props: PageProps) {
    const user = getUserFromCookie();
    if (!user) return redirect("/")

    const doc = await getDoc(props.params.id)
    if (doc === null)
        return redirect("/")

    if (user?.userId !== doc?.author.toString()) {
        return redirect("/")
    }

    const task = {
        _id: doc._id.toString(),
        task: doc.task
    }

    return (
        <div>
            <h2 className="text-center text-4xl text-gray-600 mb-5">Edit Task</h2>
            <TaskForm task={task} action="edit" />
        </div>
    )
}
