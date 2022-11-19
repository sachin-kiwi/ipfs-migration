const { getIpfsClients, getIPFSURL } = require("../ipfs/upload")
const { logs } = require("../logger")

/**
 * Prepares new tokenURI and upload to ipfs node
 * @param {Object} revenue
 * @param {Object} product
 * @throws {Error} If new tokenURI does not matches with nft tokenURI
 */
const pinTokenData  = async (revenue,product) => {
   try {
      const {infura} = getIpfsClients()
      // It will support only palm and etherum
      const tokenDataForURI = await prepareTokenData(revenue,product)
      const tokenURI = await getIPFSURL(tokenDataForURI,infura)
      // console.log(tokenDataForURI,tokenURI)
      if (revenue.tokenURI !== tokenURI){
        throw new Error('Prepared TokenURI doesnot match with nft tokenURI')
      }
   } catch (error) {
      logs('error','pinTokenData',`${error.stack}`)
      throw error
   }
}

/**
 * It create tokenURI from data fetch about nft
 * @param {Object} revenue
 * @param {Object} productDetails
 * @returns {Object} new token uri data for nft purchased
 */
const prepareTokenData = async(revenue,productDetails)=>{
  const { productId, rank, couponCode, isUnlocked } = revenue.token;
  const { name, description}= revenue.product
  const ipfs = productDetails.ipfs
  const images = {
      isImageLarge: productDetails.isImageLarge,
      thumbnail: productDetails.thumbnail,
      image: productDetails.image,
    };
  const uploadedImages = {
    isImageLarge: images.isImageLarge,
    thumbnail: "",
    image: "",
  };

  /*
    Don't confuse with image and thumbnail name -
    for heavy images - tokenURI attributes store image data and tokenURI.animate_url or image store thumbnail
    while in non-heavy images -tokenURI attributes does not store image data and tokenURI.animate_url or image store thumbnail which will be same as image
    */
  if (images.isImageLarge) {
    uploadedImages.image = ipfs.image;
    uploadedImages.thumbnail = images.thumbnail ? ipfs.thumbnail : ipfs.image
  } else {
    uploadedImages.image = ipfs.image;
    uploadedImages.thumbnail = uploadedImages.image;
  }

  const tokenDataForURI = {
    productId,
    rank,
    couponCode,
    isUnlocked,
    name,
    description,
    attributes: await getExternalData(
      productDetails.data,
      productDetails.companyName,
      productDetails.ipfs.imageGallery,
      productDetails.isImageLarge,
      uploadedImages.image,
      productDetails
    ),
  };
  if (
    productDetails.image.includes("video") ||
    productDetails.image.includes("audio")
  ) {
    tokenDataForURI.animation_url = uploadedImages.thumbnail;
  } else {
    tokenDataForURI.image = uploadedImages.thumbnail;
  }
  return tokenDataForURI
}


const getExternalData = async (data, brandCompanyName, imageGallery,isHeavyImage,originalImage,productDetails) => {
  const jsonData = [
    { trait_type: 'Publisher', value: 'NFTPro' },
    { trait_type: 'Brand', value: brandCompanyName }
  ]
  if (isHeavyImage){
    if (productDetails.image.includes("image")){
      jsonData.push({ trait_type: "Original_Image", value: originalImage });
    }
  }
  if (imageGallery.length > 0) {
    let index = 0
    for (const image of imageGallery) {
      jsonData.push({ trait_type: `Asset_${index}`, value: image })
      index++
    }
  }
  if (!data) {
    return jsonData
  }
  const parsedData = JSON.parse(data)
  Object.keys(parsedData).forEach((key) => {
    jsonData.push({
      trait_type: key,
      value: parsedData[key]
    })
  })
  return jsonData
}

module.exports=pinTokenData
