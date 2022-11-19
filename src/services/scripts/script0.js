const { getMongoDbParameter } = require("../../database");
const { logs } = require("../../logger");
const { fetchProductDetails, fetchBrandDetails } = require("../../utils/mongoUtils");

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
        let userDetails = await fetchBrandDetails(db)
        const products = productList.filter(product => {
            return !(pinMigrations.includes(product._id.toString()));
        })
        logs('info','script0',`Total pinMigrations available ${pinMigrations.length}`)
        logs('info','script0',`No. of request pending ${products.length}`)
        products.forEach(product => {
            //As per Latest image Gallery fix, imageGallery is changed from array of strings to array of objects
            const isV2 = typeof product.imageGallery[0] === 'object'
            product.imageGallery = product.imageGallery.map((image) => {
                return isV2 ? image.image: image
            });
            const user = userDetails.find(user => user._id.toString()=== product.userId.toString())
            // In Case user details find then insert data otherwise skip
            if (typeof user !== 'undefined'){
                dataCreation.push(db.collection('pinmigrations').insertOne({
                productId:product._id,
                type:'metadata',
                isProduct:true,
                isPinned:false,
                error:'',
                data:product.data,
                isImageLarge:product.isImageLarge,
                companyName:user.companyName,
                ...{image:product.image,thumbnail:product.thumbnail,imageGallery:product.imageGallery}
            }))
            }else{
                logs('error','script0',`unable to find user details for product: ${product._id}`)
            }
        });
        await Promise.all(dataCreation);
        logs('info','script0','Script0 is completed')
    } catch (error) {
        logs('error','script0',`Failed to completed Scrip0 ${error.stack}`)
        throw error
    }
}

module.exports=script0
