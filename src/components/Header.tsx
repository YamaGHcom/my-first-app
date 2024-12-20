import Link from 'next/link'
import { getUserFromCookie } from '@/lib/getUser'
import { logout } from '@/actions/userController';


export default async function Header() {
    const user = await getUserFromCookie();

    return (
        <header className="bg-gray-100 shadow-md">
            <div className="navbar bg-base-100 flex justify-between items-center px-4">
                <div className="flex-1">
                    <Link href="/" className='btn btn-ghost text-xl'>Todo App</Link>
                </div>
                <div className="flex-none">
                    <ul className="flex space-x-4 px-1">
                        {user && (
                            <>
                                <li>
                                    <Link href="create-task">Create Task</Link>
                                </li>
                                <li>
                                    <form action={logout} className='btn btn-neutral'>
                                        <button>Log Out</button>
                                    </form>
                                </li>
                            </>
                        )}
                        {!user && (
                            <li>
                                <Link href="/login">Log In</Link>
                            </li>
                        )}
                    </ul>
                </div>

            </div>
        </header>
    )
}
