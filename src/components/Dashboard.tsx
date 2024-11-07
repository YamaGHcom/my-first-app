import { ObjectId } from "mongodb"
import { getCollection } from "../lib/db"
import Link from "next/link"
import { deleteHaiku } from "../actions/haikuController"

async function getHaikus(id) {
    const collection = await getCollection("haikus")
    const results = await collection.find({ author: ObjectId.createFromHexString(id) }).sort({ _id: -1 }).toArray()
    return results
}

export default async function Dashboard(props) {
    const haikus = await getHaikus(props.user.userId)

    return (
        <div>
            <h2 className="text-center text-2xl text-gray-600 mb-5">Your Haikus</h2>
            {haikus.map((haiku, index) => {
                return (
                    <div key={index}>
                        {haiku.line1}
                        <br />
                        {haiku.line2}
                        <br />
                        {haiku.line3}
                        <br />
                        <Link href={`/edit-haiku/${haiku._id.toString()}`}>Edit</Link>
                        <br />
                        <Link className="text-red-600" href={`/edit-haiku2/${haiku._id.toString()}`}>Edit2</Link>
                        <form action={deleteHaiku}>
                            <input name="id" type="hidden" defaultValue={haiku._id.toString()} />
                            <button>Delete</button>
                        </form>
                        <hr />
                    </div>
                )
            })}
        </div>
    )
}