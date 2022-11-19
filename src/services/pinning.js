const { getMongoDbParameter } = require("../database");
const { getMediaIpfsUrlViaMediaUrl, getIpfsClients, getIPFSURL, getDataFromIPFS } = require("../ipfs/upload");
const { createSmartContractInstance } = require("../utils/contract");

const pinningProduct  = async (product) => {
   try {
     const {infura} = getIpfsClients()
     const imageGalleryData = []
     let {image,imageGallery,thumbnail} = product
     const imageCid = await getMediaIpfsUrlViaMediaUrl(image.url,infura)
     image.cid = imageCid
     const thumbnailCid = await getMediaIpfsUrlViaMediaUrl(thumbnail.url,infura)
     thumbnail.cid = thumbnailCid
     for (let index = 0; index < imageGallery.length; index++) {
      const element = imageGallery[index];
      const cid = await getMediaIpfsUrlViaMediaUrl(element.url,infura)
      imageGalleryData.push({url:element.url, cid})
     }
     return {image, thumbnail,imageGallery:imageGalleryData}
   } catch (error) {
    throw error
   }
}

const pinningRevenue  = async (revenue,product,cids) => {
   try {
   const {infura,self} = getIpfsClients()
   const {db} = getMongoDbParameter()
   const data = product.data
   delete product.data
   product.image=data.image
   product.thumbnail=data.thumbnail
   product.imageGallery=data.imageGallery
   console.log(product)
   const {contract:geerNFT } = await createSmartContractInstance({db,contractAddressInfoId: revenue.contractAddressInfoId.toString()})
   const tokenURI = await geerNFT.methods.tokenURI(revenue.tokenID).call();
   console.log(tokenURI)
   const tokenData = await getDataFromIPFS(tokenURI,self)
   console.log(tokenData)
   const tokenDataFlattened = flattenedObject(tokenData)
   console.log(tokenDataFlattened)
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
