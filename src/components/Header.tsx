import Link from 'next/link'

export default function Header() {
    return (
        <header>
            <div>
                <div>
                    <Link href="/">Todo App</Link>
                </div>
                <div>
                    <ul>
                        <li>Create Task</li>
                        <li>Log Out</li>
                    </ul>
                    <ul>
                        <li>Log In</li>
                    </ul>
                </div>

            </div>
        </header>
    )
}
