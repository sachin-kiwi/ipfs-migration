const { getMongoDbParameter } = require("../../database");
const { logs } = require("../../logger");
const { createSmartContractInstance } = require("../../utils/contract");

/**
 * @author Sachin Bisht
 * @dev
 * This Script is executed to fetch all tokenData i.e product,metadata,reward data and token details
 * concerning revenue to ipfs node later using script3.It also create new data with same content
 * into pinMigration collection if all completed else update error into pinMigration.
 * @prerequisite All scripts must be executed in sequence for proper result
 * @returns errorList contains error occured in product uploads to ipfs
 * isCompleted returns true in case no error occured else false
 */
const script2 = async()=>{
    try {
        logs('info','script2','script2 is starting')
        const {db} = getMongoDbParameter()
        const data = await db.collection('revenues').find({isBlockChainUpdated:true,blockchainName:{$in:['palm']},tokenID:{$exists:true}}).toArray()
        let pinRevenues = await db.collection('pinmigrations').find({isProduct:false}).toArray()
        pinRevenues = pinRevenues.map(doc => doc.revenueId.toString())
        const revenues = data.filter(revenue=>!(pinRevenues.includes(revenue._id.toString())))
        logs('info','script2',`No. of request pending ${revenues.length}`)
        const errorList = []
        const promises = []
        if (revenues.length > 20 ){
            let start = 0
            let end = 20
            const batches = Math.ceil(revenues.length/20)
            logs("info", "script2", `no. of batches is ${batches}`);
            for (let i = 0; i < batches; i++) {
                const promiseArray = []
                const newBatch = revenues.slice(start,end)
                logs("info", "[batches]", `Batch No. ${i} with count ${newBatch.length}`);
                for(const revenue of newBatch){
                    promiseArray.push(fetchTokenURIParallel(db,revenue))
                }
                const result = await Promise.allSettled(promiseArray);
                logs("info","script2",`batch promise settled batch no. ${i}`);
                const rejected = result.filter(p=>p.status==='rejected')
                errorList.push(...rejected)
                start+=20
                end+=20
            }
        }else{
            for(const revenue of revenues){
                promises.push(fetchTokenURIParallel(db,revenue))
            }
            const result = await Promise.allSettled(promises);
            logs("info","script2",'all promise settled');
            const rejected = result.filter(p=>p.status==='rejected')
            errorList.push(...rejected)
        }
        logs('info','script2','script2 is completed')
        return {errorList,isCompleted:errorList.length?true:false}
    } catch (error) {
        logs('error','script2',`Failed to completed Scrip1 ${error.stack}`)
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
            rank:parseInt(token.rank),
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

const fetchTokenURIParallel = async(db,revenue)=>{
    return new Promise(async(resolve,reject)=>{
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
        resolve(`Succesfully fetch and added revenueID: ${revenue._id}`)
        logs('info','script2',`Successfully Fetched tokenData for revenuID: ${revenue._id}`)
        } catch (error) {
            logs('info','script2',`Failed to Fetch tokenData for revenuID: ${revenue._id} ${error.stack}`)
            reject([revenue._id,error])
        }
    })
}

module.exports=script2
