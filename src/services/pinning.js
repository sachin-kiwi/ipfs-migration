const { getMediaIpfsUrlViaMediaUrl, getIpfsClients } = require("../ipfs/upload");

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

module.exports={
    pinningProduct
}
