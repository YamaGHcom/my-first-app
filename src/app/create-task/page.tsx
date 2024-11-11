import { getUserFromCookie } from "@/lib/getUser"
import { redirect } from "next/navigation"
import TaskForm from "@/components/TaskForm"

export default async function Page() {
    const user = await getUserFromCookie();

    if (!user) {
        return redirect("/");
    }

    return (
        <div>
            <h2 className="text-center text-2xl text-gray-600 mb-5">Create Task</h2>
            <TaskForm action="create" />
        </div>

    )
}
