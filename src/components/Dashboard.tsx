import { ObjectId } from "mongodb"
import { getCollection } from "../lib/db"
import Link from "next/link"
import { deleteTask } from "../actions/taskController"

//指定されたユーザーID（id）に基づいて、そのユーザーが作成したタスクをDBから取得
async function getTasks(id: string) {
    const collection = await getCollection("tasks")
    const results = await collection.find({ author: ObjectId.createFromHexString(id) }).sort({ _id: -1 }).toArray()
    return results
}

type Props = {
    user: {
        userId: string;
    };
};

// export default async function Dashboard(props) {
//     const tasks = await getTasks(props.user.userId)

export default async function Dashboard({ user }: Props) {
    const userId = user.userId
    const tasks = await getTasks(userId)

    return (
        <div>
            <h2 className="text-center text-2xl text-gray-600 mb-5">Your Tasks</h2>
            {tasks.map((task, index) => {
                return (
                    <div key={index}>
                        {task.line1}
                        <br />
                        <Link href={`/edit-task/${task._id.toString()}`}>Edit</Link>
                        <form action={deleteTask}>
                            <input name="id" type="hidden" defaultValue={task._id.toString()} />
                            <button>Delete</button>
                        </form>
                        <hr />
                    </div>
                )
            })}
        </div>
    )
}