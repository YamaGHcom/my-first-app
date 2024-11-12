import { getUserFromCookie } from "@/lib/getUser"
import { redirect } from "next/navigation"
import TaskForm from "@/components/TaskForm"
import Link from "next/link";

export default async function Page() {
    const user = getUserFromCookie();

    if (!user) {
        return redirect("/");
    }

    return (
        <div>
            <h2 className="text-center text-2xl text-gray-600 mb-5">Create Task</h2>
            <TaskForm action="create" />
            <Link href="/">戻る</Link>
        </div>

    )
}
