const { dbName,DB_URL } = require("../appconfig");
const {MongoClient} = require('mongodb');
const { logs } = require("../logger");

let db = null
let mongdbClient = null
const connnectDb = async()=>{
    try {
        logs('info','connectDb',`Trying to connect to ${DB_URL} on DB ${dbName}`)
        mongdbClient = new MongoClient(DB_URL)
        await mongdbClient.connect()
        db = mongdbClient.db(dbName)
        logs('info','connectDb',`Connected Succesfully to ${DB_URL}`)
    } catch (error) {
        logs('error','connectDb',`Error in Connnectiong Db ${DB_URL} ${error.stack}` )
        process.exit(1)
    }
}

const getMongoDbParameter = () =>{
    return {
        db,client:mongdbClient
    }
}

module.exports={
    getMongoDbParameter,
    connnectDb
}