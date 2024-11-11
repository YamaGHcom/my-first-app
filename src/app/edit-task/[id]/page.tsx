import { getCollection } from "@/lib/db";
import TaskForm from "@/components/TaskForm";
import { getUserFromCookie } from "@/lib/getUser";
import { ObjectId } from "mongodb";
import { redirect } from "next/navigation"

async function getDoc(id: string) {
    const haikuCollections = await getCollection("haikus")
    const result = haikuCollections.findOne({ _id: ObjectId.createFromHexString(id) })
    return result
}

type PageProps = {
    params: {
        id: string
    }
}

export default async function Page(props: PageProps) {
    const doc = await getDoc(props.params.id)
    console.log("docの値", doc)

    const user = getUserFromCookie();

    if (user !== doc?.author.toString()) {
        return redirect("/")
    }

    const task = {
        // ...doc,
        _id: doc._id.toString(),
        task: doc.task
        // author: doc.author.toString(),

    }

    return (
        <div>
            <h2 className="text-center text-4xl text-gray-600 mb-5">Edit Task</h2>
            <TaskForm task={task} action="edit" />
        </div>
    )
}
