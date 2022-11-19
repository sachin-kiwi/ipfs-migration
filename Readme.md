Migration from one Ipfs Node to Another
**In Case of Infura managed solution, seperate pinning is not required since it is done during file upload alreafy**

Migration is broken into 3 Scripts for simplicity
1. Script0 will prepare product details whose metadata needs to be uploaded
2. Scropt1 wil uploaded those product metadata into infura/self hosted node
3. Script2 will fetch details concerning nft purchased i.e tokenData,productData as well as rewards
4. Script3 will prepare fresh tokenURI for nfts and upload them into infura/self hosted node


Steps to execute
1. Take latest pull from branch mentioned by author
2. run **yarn install**
3. add .env file related to project
4. run commands in following sequence 
   1. npm run script0
   2. npm run script1
   3. npm run script2
   4. npm run script3
5. Verify result: 
   1. calculating no. of unique products involved in nft purchase
   2. completed purchases belonging to palm and ethereum in pinmigration collections
   3. all must have isPinned true after completion

Note: 
    1. Currently, It is made for palm and ethereum specific migration only and only for those products which are used in nft purchase
    2. Recommended Node version is Node v14.19
