const { getMongoDbParameter } = require("../../database");
const { logs } = require("../../logger");
const { fetchProductDetails } = require("../../utils/mongoUtils");

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