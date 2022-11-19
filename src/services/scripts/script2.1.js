const { getMongoDbParameter } = require("../../database");
const { logs } = require("../../logger");
const { createSmartContractInstance } = require("../../utils/contract");
const script2Part1 = async()=>{
    try {
        logs('info','script2Part1','script2Part1 is starting')
        const {db} = getMongoDbParameter()
        const data = await db.collection('revenues').find({isBlockChainUpdated:true,blockchainName:{$in:['palm','ethereum']}}).toArray()
        let pinRevenues = await db.collection('pinmigrations').find({isProduct:false}).toArray()
        pinRevenues = pinRevenues.map(doc => doc.revenueId.toString())
        const revenues = data.filter(revenue=>!(pinRevenues.includes(revenue._id.toString())))
        logs('info','script2Part1',`No. of request pending ${revenues.length}`)
        const errorList = []
        let isCompleted = true
        for (let revenue of revenues){
            try {
                const data = await fetchTokenURI(revenue)
                await db.collection('pinmigrations').insertOne({
                    revenueId:revenue._id,
                    type:'tokenData',
                    isProduct:false,
                    isPinned:false,
                    dealId: revenue.dealId,
                    productId:revenue.productId,
                    error:'',
                    tokenURI:data
                })
                logs('info','script1',`Successfully Fetched tokenData for revenuID: ${revenue._id}`)
            } catch (error) {
                logs('info','script1',`Failed to Fetch tokenData for revenuID: ${revenue._id}`)
                errorList.push({id:revenue._id,error:error.stack})
                isCompleted = false
            }
        }
        logs('info','script2Part1','script2Part1 is completed')
        return {errorList,isCompleted}
    } catch (error) {
        logs('error','script2Part1',`Failed to completed Scrip1 ${error.stack}`)
        throw error
    }
}

const fetchTokenURI  = async (revenue) => {
    try {
        const {db} = getMongoDbParameter()
        const {contract:geerNFT } = await createSmartContractInstance({db,contractAddressInfoId: revenue.contractAddressInfoId.toString()})
        const tokenURI = await geerNFT.methods.tokenURI(revenue.tokenID).call();
        return tokenURI
    } catch (error) {
        logs('error','fetchTokenURI',`Failed to fetch TokenData for ${revenue._id} with tokenID ${revenue.tokenID} with error ${error.stack}`)
        throw error
    }
}
module.exports=script2Part1
