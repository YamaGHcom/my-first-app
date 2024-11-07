import RegisterForm from "../components/RegisterForm"
import { getUserFromCookie } from "../lib/getUser"
import Dashboard from "../components/Dashboard"

export default async function Page() {
  const user = getUserFromCookie()
  // const user = { userId: "1" }
  console.log("userの値:", user)

  return (
    <>
      {user && <Dashboard user={user as { userId: string }} />}
      {!user && (
        <>
          <p className="text-center text-2xl text-gray-600 mb-5">Don&rsquo;t have an acoount?
            <strong>Create One</strong>
          </p>
          <RegisterForm />
        </>
      )}
    </>
  )
}
