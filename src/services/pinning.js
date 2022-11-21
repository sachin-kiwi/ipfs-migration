const { getMediaIpfsUrlViaMediaUrl, getIpfsClients } = require("../ipfs/upload");
const { logs } = require("../logger");

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
     logs('info','pinningProduct', `Starting upload for productId ${product.productId}`)
     const imageCid = await getMediaIpfsUrlViaMediaUrl(image,infura)
     logs('info','pinningProduct', `Uploaded -image ${image} with ipfs url ${imageCid}  `)
     const thumbnailCid = await getMediaIpfsUrlViaMediaUrl(thumbnail,infura)
     logs('info','pinningProduct', `Uploaded -thumbnail ${thumbnail} with ipfs url ${thumbnailCid}`)
     for (let index = 0; index < imageGallery.length; index++) {
      const element = imageGallery[index];
      const cid = await getMediaIpfsUrlViaMediaUrl(element,infura)
      logs('info','pinningProduct', `Uploaded -imageGallery ${element}  with ipfs url ${thumbnailCid}`)
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
