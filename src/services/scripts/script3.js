const { getMongoDbParameter } = require("../../database");
const { logs } = require("../../logger");
const pinTokenData = require("../tokenData");

/**
 * @author Sachin Bisht
 * @dev
 * This Script is executed to upload prepared new tokenURI from data fetch from script2
 * update isPinned true if uploaded and match with nft tokenURI else update error into pinMigration.
 * @returns errorList contains error occured in tokenURI uploads to ipfs
 * isCompleted returns true in case no error occured else false
 */
const script3 = async()=>{
    try {
        logs('info','script3','script3 is starting')
        const {db} = getMongoDbParameter()
        let pinRevenues = await db.collection('pinmigrations').find({isProduct:false,isPinned:false}).toArray()
        let pinnedProducts = await db.collection('pinmigrations').find({isProduct:true,isPinned:true}).toArray()
        logs('info','script3',`No. of request pending ${pinRevenues.length}`)
        const errorList = []
        let isCompleted = true
        for (let pinRevenue of pinRevenues){
            const product = pinnedProducts.find(product=> product.productId.toString() === pinRevenue.productId.toString())
            if (typeof product === 'undefined'){
                logs('info','script3',`Skipping request since product migration does not exists for revenue ${pinRevenue.revenueId}`)
                continue
            }
            try {
                await pinTokenData(pinRevenue,product)
                await db.collection('pinmigrations').updateOne(
                    {_id:pinRevenue._id},
                    {$set: {isPinned:true,error:''}}
                )
                logs('info','script1',`Successfully pinned revenuID: ${pinRevenue.revenueId}`)
            } catch (error) {
                logs('info','script1',`Failed to pin revenuID: ${pinRevenue.revenueId}`)
                await db.collection('pinmigrations').updateOne(
                    {_id:pinRevenue._id},
                    {isPinned:false,error:error.stack}
                )
                errorList.push({id:pinRevenue._id,error:error.stack})
                isCompleted = false
            }
        }
        logs('info','script3','script3 is completed')
        return {errorList,isCompleted}
    } catch (error) {
        logs('error','script3',`Failed to completed Scrip1 ${error.stack}`)
        throw error
    }
}

module.exports=script3
