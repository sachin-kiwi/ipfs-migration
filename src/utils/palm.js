const WEB3 = require('web3')
const { PALM_HTTP_PROVIDER } = require('../appconfig')
const { logs } = require('../logger')

let web3 = null

const initPalmServices = async () => {
  const methodName = '[initPalmServices]'
  try {
    web3 = new WEB3(new WEB3.providers.HttpProvider(PALM_HTTP_PROVIDER))
  } catch (error) {
    logs('info', methodName, 'Issue with connecting', `${error.stack}`)
    throw error
  }
  logs('info', methodName, 'Connected to web3 now')
}

const getPalmParameters = () => {
  return { web3 }
}

module.exports = {
  initPalmServices,
  getPalmParameters
}