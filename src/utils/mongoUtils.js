const { getMongoDbParameter } = require("../database");
const { logs } = require("../logger");

const readUniqueProductWithCompletedPurchase = async(db)=>{
    try {
       return await db.collection('revenues').distinct('productId',{isBlockChainUpdated:true})
    } catch (error) {
        logs('error','readUniqueProductWithCompletedPurchase',`${error.stack}`)
        throw error
    }
}

const fetchProductDetails = async(db)=>{
    try {
        const productIds = await readUniqueProductWithCompletedPurchase(db)
        const productDetails = await db.collection('products').find({_id: {$in: productIds}}).toArray()
        return {productIds,productDetails}
    } catch (error) {
        throw error
    }
}
const listCollections = async (db)=>{
        try {
            const collections = await db.listCollections().toArray();
            return collections.map(c => c.name);
        } catch (error) {
            logs('error','listCollections',`${error.stack}`)
            throw error
        }
}

const fetchPurchasefilterByProductId = async(db,productId)=>{
    try {
        return await db.collection('revenues').find({isBlockChainUpdated:true, productId}).toArray()
    } catch (error) {
        throw error
    }
}

const createCollectionIfNotExists = async(collectionName='pinmigrations')=>{
    const {db} = getMongoDbParameter()
    await listCollections(db).then(resp => {
      if (!resp.includes(collectionName)) {
        logs('info','bootup','creating pinmigrations collection since it does not exists')
        db.createCollection('pinmigrations')
      }
    })
}

module.exports={
    listCollections,
    readUniqueProductWithCompletedPurchase,
    fetchProductDetails,
    fetchPurchasefilterByProductId,
    createCollectionIfNotExists
}