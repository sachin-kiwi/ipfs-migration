const { getMongoDbParameter } = require("../../database");
const { logs } = require("../../logger");
const { createSmartContractInstance } = require("../../utils/contract");

/**
 * @author Sachin Bisht
 * @dev
 * This Script is executed to fetch all tokenData i.e product,metadata,reward data and token details
 * concerning revenue to ipfs node later using script2Part2.It also create new data with same content
 * into pinMigration collection if all completed else update error into pinMigration.
 * @returns errorList contains error occured in product uploads to ipfs
 * isCompleted returns true in case no error occured else false
 */
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
                    ...data
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

/**
 * @author Sachin Bisht
 * @dev
 * It fetches tokenURI as well as all data concerning nft
 * @param {Object} revenue
 * @returns It returns Object containing all data concerning particular nft
 */
const fetchTokenURI  = async (revenue) => {
    try {
        const {db} = getMongoDbParameter()
        const {contract:geerNFT } = await createSmartContractInstance({db,contractAddressInfoId: revenue.contractAddressInfoId.toString()})
        const tokenURI = await geerNFT.methods.tokenURI(revenue.tokenID).call();
        const itemDetails = await geerNFT.methods.getItemDetails(revenue.tokenID).call();
        const [token,product] = itemDetails
        const tokenData = {
            productId:token.productId,
            rank:token.rank,
            couponCode:token.couponCode,
            isUnlocked:token.isUnlocked
        }
        const productData = {
            id:product.id,
            name:product.name,
            description:product.description,
            author:product.author,
            metadataURI:product.metadataURI,
            rewardURI:product.rewardURI
        }
        return {tokenURI,token:tokenData,product:productData,tokenId:revenue.tokenID}
    } catch (error) {
        logs('error','fetchTokenURI',`Failed to fetch TokenData for ${revenue._id} with tokenID ${revenue.tokenID} with error ${error.stack}`)
        throw error
    }
}
module.exports=script2Part1
