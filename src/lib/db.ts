import { MongoClient, Db, Collection } from "mongodb";

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// 環境変数からMongoDB URIを取得し、型チェック
if (!process.env.CONNECTIONSTRING) {
    throw new Error("Please add your MongoDB URI to the .env file");
}

const uri: string = process.env.CONNECTIONSTRING;
const options = {};

// グローバル変数の型を宣言
declare global {
    var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
    // 開発モードでは、MongoClientのインスタンスが再作成されないようにグローバル変数を使用
    if (!global._mongoClientPromise) {
        client = new MongoClient(uri, options);
        global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
} else {
    // 本番環境ではグローバル変数を使わない方が良い
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
}

// データベースに接続する関数
async function getDatabase(): Promise<Db> {
    const client = await clientPromise;
    return client.db();
}

// コレクションを取得する関数
export async function getCollection<T extends Document = Document>(collectionName: string): Promise<Collection<T>> {
    const db = await getDatabase();
    return db.collection<T>(collectionName);
}

export default getDatabase;