const { getMongoDbParameter } = require("../../database");
const { logs } = require("../../logger");
const { fetchProductDetails } = require("../../utils/mongoUtils");

/**
 * @author Sachin Bisht
 * @dev
 * Script0 is executed to find all distinct products involved in nft purchases having revenue succesfully purchase i.e gamePlayer got nft.
 * It creates product details in pinMigration collection which needs to be uploaded in ipfs node.
 * Its need to run prior to running script1
 */
const script0 = async() => {
    try {
        logs('info','script0','Script0 is starting')
        const {db} = getMongoDbParameter()
        const dataCreation = []
        const {productDetails:productList} = await fetchProductDetails(db).then(resp=> {
                return resp
        })
        let pinMigrations = await db.collection('pinmigrations').find({isProduct:true}).toArray()
        pinMigrations = pinMigrations.map(doc => doc.productId.toString())
        const products = productList.filter(product => {
            return !(pinMigrations.includes(product._id.toString()));
        })
        logs('info','script0',`Total pinMigrations available ${pinMigrations.length}`)
        logs('info','script0',`No. of request pending ${products.length}`)
        products.forEach(product => {
            //As per Latest image Gallery fix, imageGallery is changed from array of strings to array of objects
            const isV2 = typeof product.imageGallery[0] === 'object'
            product.imageGallery = product.imageGallery.map((image) => {
                return {url:isV2 ? image.image: image, cid:''}
            });
            dataCreation.push(db.collection('pinmigrations').insertOne({
                productId:product._id,
                type:'metadata',
                isProduct:true,
                isPinned:false,
                error:'',
                isImageLarge:product.isImageLarge,
                ...{image:{url:product.image,cid:''},thumbnail:{url:product.thumbnail,cid:''},imageGallery:product.imageGallery}
            }))
        });
        await Promise.all(dataCreation);
        logs('info','script0','Script0 is completed')
    } catch (error) {
        logs('error','script0',`Failed to completed Scrip0 ${error.stack}`)
        throw error
    }
}

module.exports=script0
