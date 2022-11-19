const { getMongoDbParameter } = require("../database");
const { getMediaIpfsUrlViaMediaUrl, getIpfsClients, getIPFSURL, getDataFromIPFS } = require("../ipfs/upload");
const { createSmartContractInstance } = require("../utils/contract");

/**
 * @author Sachin Bisht
 * @dev Uploads image,thumbnail and imageGallery data into ipfs 
 * and returns same data along with their ipfs hash
 * @param {Object} product
 * @throws {Error} In Case error occured during data upload to ipfs
 */
const pinningProduct  = async (product) => {
   try {
     const {infura} = getIpfsClients()
     const imageGalleryData = []
     let {image,imageGallery,thumbnail} = product
     const imageCid = await getMediaIpfsUrlViaMediaUrl(image,infura)
     const thumbnailCid = await getMediaIpfsUrlViaMediaUrl(thumbnail,infura)
     for (let index = 0; index < imageGallery.length; index++) {
      const element = imageGallery[index];
      const cid = await getMediaIpfsUrlViaMediaUrl(element,infura)
      imageGalleryData.push(cid)
     }
     return {image:imageCid, thumbnail:thumbnailCid,imageGallery:imageGalleryData}
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
