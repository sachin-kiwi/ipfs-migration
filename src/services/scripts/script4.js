const { getMongoDbParameter } = require("../../database");
const { logs } = require("../../logger");

const script4 = async() => {
    try {
        logs('info','script4','script4 is starting')
        const {db} = getMongoDbParameter()
        await db.collection('pinmigrations').drop()
        logs('info','script4','pinmigrations collection is delete now')
        logs('info','script4','script4 is completed')
    } catch (error) {
        logs('error','script4',`Failed to completed Scrip3 ${error.stack}`)
        throw error
    }
}

module.exports=script4
