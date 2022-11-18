const { getMongoDbParameter } = require("../../database");
const { logs } = require("../../logger");
const { pinningProduct } = require("../pinning");

const script1 = async()=>{
    try {
        logs('info','script1','Script1 is starting')
        const {db} = getMongoDbParameter()
        const pinMigrations = await db.collection('pinmigrations').find({isProduct:true,isPinned:false}).toArray()
        logs('info','script1',`No. of request pending ${pinMigrations.length}`)
        const errorList = []
        let isCompleted = true
        for (let product of pinMigrations){
            try {
                const data = await pinningProduct(product)
                await db.collection('pinmigrations').updateOne({_id:product._id},{$set:{data,isPinned:true}})
                logs('info','script1',`Successfully pinned productID: ${product.productId}`)
            } catch (error) {
                logs('error','script1',`Failed in  pinning productID: ${product.productId}`)
                await db.collection('pinmigrations').updateOne({_id:product._id},{$set:{error:error.stack}})
                errorList.push({id:product._id,error:error.stack})
                isCompleted = false
            }
        }
        logs('info','script1','Script1 is completed')
        return {errorList,isCompleted}
    } catch (error) {
        logs('error','script1',`Failed to completed Scrip1 ${error.stack}`)
        throw error
    }
}

module.exports=script1