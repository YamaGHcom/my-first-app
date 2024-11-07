import Link from 'next/link'

export default function Header() {
    return (
        <header className="bg-gray-100 shadow-md">
            <div className="navbar bg-base-100 flex justify-between items-center px-4">
                <div className="flex-1">
                    <Link href="/" className='btn btn-ghost text-xl'>Todo App</Link>
                </div>
                <div className="flex-none">
                    <ul className="flex space-x-4 px-1">
                        <li>
                            <Link href="create-task">Create Task</Link>
                        </li>
                        <li>
                            <button>Log Out</button>
                        </li>
                        <li>
                            <button>Log In</button>
                        </li>
                    </ul>
                </div>

            </div>
        </header>
    )
}
