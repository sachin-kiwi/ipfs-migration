const { ObjectId } = require("mongodb");
const { logs } = require("../logger");
const { getPalmParameters } = require("./palm");

const getContractInfo = async(db,contractAddressInfoId)=>{
    const contractDetail = await db.collection('smartcontracts').findOne({_id:ObjectId(contractAddressInfoId)})
    if (!contractDetail){
        throw new Error('No Smart contract detail found')
    }
    return contractDetail
}

const createSmartContractInstance = async (payload) => {
    const { web3 } = getPalmParameters()
    const {db,contractAddressInfoId} = payload
    const smartContractInfo = await getContractInfo(db,contractAddressInfoId)
    const contractPath = `..${smartContractInfo.abiFilePath}${smartContractInfo.abiFileName}`
    logs('info','createSmartContractInstance',`CONTRACT PATH ${contractPath},${JSON.stringify({address:smartContractInfo.address,brandId:smartContractInfo.brandId})}`)
    const Contract_ABI = require(contractPath)
    return {
        contract: new web3.eth.Contract(
            Contract_ABI.abi,
            smartContractInfo.address),
        smartContractInfo
    }
}

module.exports={
    createSmartContractInstance,
    getContractInfo
}