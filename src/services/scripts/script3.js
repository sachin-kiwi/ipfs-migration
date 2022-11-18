const { getMongoDbParameter } = require("../../database");
const { logs } = require("../../logger");

const script3 = async() => {
    try {
        logs('info','script3','Script3 is starting')
        const {db} = getMongoDbParameter()
        await db.collection('pinmigrations').drop()
        logs('info','script3','pinmigrations collection is delete now')
        logs('info','script3','Script3 is completed')
    } catch (error) {
        logs('error','script3',`Failed to completed Scrip3 ${error.stack}`)
        throw error
    }
}

module.exports=script3