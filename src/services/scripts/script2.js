const { getMongoDbParameter } = require("../../database");
const { logs } = require("../../logger");
const { pinningRevenue } = require("../pinning");

const script2 = async()=>{
    try {
        logs('info','script2','Script2 is starting')
        const {db} = getMongoDbParameter()
        const data = await db.collection('revenues').find({isBlockChainUpdated:true,blockchainName:'palm'}).toArray()
        let pinRevenue = await db.collection('pinmigrations').find({isProduct:false}).toArray()
        let pinnedProducts = await db.collection('pinmigrations').find({isProduct:true}).toArray()
        pinRevenue = pinRevenue.map(doc => doc.revenueId.toString())
        const revenues = data.filter(revenue=>!(pinRevenue.includes(revenue._id.toString())))
        logs('info','script2',`No. of request pending ${revenues.length}`)
        const errorList = []
        let isCompleted = true
        for (let revenue of revenues){
            const product = pinnedProducts.filter(product=> product.productId.toString() === revenue.productId.toString())
            try {
                const data = await pinningRevenue(revenue,product)
                await db.collection('pinmigrations').insertOne({
                    revenueId:revenue._id,
                    type:'tokenData',
                    isProduct:false,
                    isPinned:true,
                    error:'',
                    data
                })
                logs('info','script1',`Successfully pinned revenuID: ${revenue._id}`)
            } catch (error) {
                logs('info','script1',`Failed to pin revenuID: ${revenue._id}`)
                errorList.push({id:revenue._id,error:error.stack})
                isCompleted = false
            }
        }
        logs('info','script2','Script2 is completed')
        return {errorList,isCompleted}
    } catch (error) {
        logs('error','script2',`Failed to completed Scrip1 ${error.stack}`)
        throw error
    }
}

module.exports=script2