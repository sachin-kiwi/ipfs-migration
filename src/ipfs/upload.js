const { create, urlSource } = require("ipfs-http-client");
const { getFileExt } = require("./utils");
const { logs } = require("../logger");
const {  INFURA_PROJECT_ID, INFURA_PROJECT_SECRET,IPFS_HTTP_PROVIDER} = require("../appconfig");

let infuraIpfsClient = null;
let hostedIpfsClient = null

const connectToIpfs = async() => {
  try {
    await connnectToInfura()
    // await connnectToIpfsHosted(IPFS_HTTP_PROVIDER)
  } catch (error) {
    throw error
  }
}

const connnectToInfura = async()=>{
  try {
    const auth = 'Basic ' + Buffer.from(INFURA_PROJECT_ID + ':' + INFURA_PROJECT_SECRET).toString('base64')
    infuraIpfsClient = create({
      host: 'ipfs.infura.io',
      port: 5001,
      protocol: 'https',
      headers: {
        authorization: auth
      }
    })
    logs("info", "[connnectToInfura]", "IPFS Client created for infura");
  } catch (error) {
    logs(
      "error",
      "[connnectToInfura]",
      `Error in Infura Ipfs Client Creation ${err.stack}`
    );
    throw error
  }
}

const connnectToIpfsHosted = async(ipfs)=>{
  try {
    hostedIpfsClient = create(ipfs)
    logs("info", "[connnectToIpfsHosted]", "IPFS Client created for self hosted node");
  } catch (error) {
    logs(
      "error",
      "[connnectToIpfsHosted]",
      `Error in self hosted Ipfs Client Creation ${err.stack}`
    );
    throw error
  }
}


const getIpfsClients = () =>{
  return {
    infura:infuraIpfsClient,
    self: hostedIpfsClient
  }
}

const sendJSONToIPFS = async (data,client) => {
  return client.add(JSON.stringify(data));
}

const uploadMediaToIPFSviaURL = async (url,client) => {
  if (!url.length) {
    return [];
  }
  const modURL = url.map((x) => urlSource(x));
  const arr = [];
  for await (const result of client.addAll(modURL)) {
    result.type = getFileExt(result.path);
    arr.push(result);
  }
  return arr;
};

const IPFSHelper = async (image, imageGallery, client) => {
  try {
    logs(
      "info",
      "[IPFSHelper]",
      `[IPFSHelper] image, imageGallery ${image} ${imageGallery}`
    );
    const res = { media: [] };
    logs("info", "[IPFSHelper]", "uploading cover image to IPFS");
    const imageData = await uploadMediaToIPFSviaURL([image],client);
    logs("info", "[IPFSHelper]", `Cover image uploaded to IPFS ${imageData}`);
    logs("info", "[IPFSHelper]", "Uploading image-gallery to IPFS");
    const imageGalleryData = await uploadMediaToIPFSviaURL(imageGallery,client);
    logs(
      "info",
      "[IPFSHelper]",
      `Image gallery uploaded to IPFS', ${imageGalleryData}`
    );
    res.media.push(...imageData, ...imageGalleryData);
    logs("info", "[IPFSHelper]", `[IPFSHelper] res media', ${res}`);
    return res;
  } catch (error) {
    logs(
      "error",
      "[IPFSHelper]",
      `Failed to upload media to IPFS: ${error.stack || error.message}`
    );
    throw error;
  }
};

const getIPFSURL = async (dataToUpload,client,onlyCid=false) => {
  const ipfsStoredObj = await sendJSONToIPFS(dataToUpload,client);
  return onlyCid? ipfsStoredObj.path: `https://ipfs.io/ipfs/${ipfsStoredObj.path}`;
};

const getMediaIpfsUrlViaMediaUrl = async (url,client,onlyCid=false) => {
  if (!url) {
    return "";
  }
  const res = await uploadMediaToIPFSviaURL([url],client);
  const cid = String(res[0].cid).replace("CID(", "").replace(")", "");
  return onlyCid ? cid :`https://ipfs.io/ipfs/${cid}`;
};



async function getDataFromIPFS(uri,client) {
  const hash = uri.split('/ipfs/')[1]
  const asyncitr = client.cat(hash)
  let data = "";
  for await (const itr of asyncitr) {
    data += Buffer.from(itr).toString();
  }
  logs("info", "[getDataFromIPFS]",`${data}`);
  return JSON.parse(data);
}
module.exports = {
  sendJSONToIPFS,
  IPFSHelper,
  getIPFSURL,
  getMediaIpfsUrlViaMediaUrl,
  getDataFromIPFS,
  getIpfsClients,
  connectToIpfs,
  connnectToIpfsHosted,
  connnectToInfura
};
