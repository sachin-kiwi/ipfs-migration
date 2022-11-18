const { getMongoDbParameter } = require("../database");
const { getMediaIpfsUrlViaMediaUrl, getIpfsClients, getIPFSURL, getDataFromIPFS } = require("../ipfs/upload");
const { createSmartContractInstance } = require("../utils/contract");
const pinningProduct  = async (product) => {
   try {
     const {infura} = getIpfsClients()
     const imageGalleryData = []
     let {image,imageGallery,thumbnail} = product.data
     const imageCid = await getMediaIpfsUrlViaMediaUrl(image.url,infura,true)
     image.cid = imageCid
     const thumbnailCid = await getMediaIpfsUrlViaMediaUrl(thumbnail.url,infura,true)
     thumbnail.cid = thumbnailCid
     imageGallery.forEach(async element => {
        const cid = await getMediaIpfsUrlViaMediaUrl(element.url,infura,true)
        imageGalleryData.push({url:element.url, cid})
     });
     return {image, thumbnail,imageGallery:imageGalleryData}
   } catch (error) {
    throw error
   }
}

const pinningRevenue  = async (revenue) => {
   try {
     const {infura} = getIpfsClients()
     const {db} = getMongoDbParameter()
     const {contract:geerNFT } = await createSmartContractInstance({db,contractAddressInfoId: revenue.contractAddressInfoId.toString()})
     const tokenURI = await geerNFT.methods.tokenURI(revenue.tokenID).call();
     const data = await getDataFromIPFS(tokenURI,infura)
     const cid = await getIPFSURL(data,infura,true)
     return {tokenData:data,cid}
   } catch (error) {
    throw error
   }
}

module.exports={
    pinningProduct,
    pinningRevenue
}
