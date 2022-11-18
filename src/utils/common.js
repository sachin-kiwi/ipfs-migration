const { connnectDb } = require("../database")
const { connectToIpfs } = require("../ipfs/upload")
const { logs } = require("../logger")
const { createCollectionIfNotExists } = require("./mongoUtils")
const { initPalmServices } = require("./palm")

const bootupServices = async() => {
  try {
    await initPalmServices()
    await connectToIpfs()
    await connnectDb()
    await createCollectionIfNotExists('pinmigrations')
  } catch (error) {
    logs('error','bootupServics',`Error occured during bootup serivces : ${error.stack}`)
    throw error
  }

}

module.exports={
    bootupServices
}