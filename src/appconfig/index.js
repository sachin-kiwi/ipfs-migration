require('dotenv').config()
const {env} = process
const IS_TESTING=env.IS_TESTING==='true'? true:false

module.exports={
    IS_TESTING,
    DB_URL: IS_TESTING ? env.TEST_MONGODB_URI : env.MONGODB_URI,
    TEST_DB_URL: env.TEST_MONGODB_URI,
    PALM_HTTP_PROVIDER:env.PALM_HTTP_PROVIDER,
    PINO_LOG_LEVEL:'info',
    dbName: IS_TESTING? env.TEST_DB:env.DB,
    INFURA_PROJECT_ID:env.INFURA_PROJECT_ID,
    INFURA_PROJECT_SECRET:env.INFURA_PROJECT_SECRET,
    IPFS_HTTP_PROVIDER: env.IPFS_HTTP_PROVIDER
}