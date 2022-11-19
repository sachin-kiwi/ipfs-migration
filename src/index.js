const { bootupServices } = require("./utils/common");
const {script0,script1,script2Part1,script2Part2,script3} = require('./services/scripts')
const { logs } = require("./logger");

const migrationScript = async() => {
    try {
        await bootupServices().then(()=>{
        }).catch(err=>{
            logs('error','bootupServices','Failure occured in bootupServices')
            throw err
        })
        await executeScript().catch(err=>{
                logs('error','executeScript','Failure occured in executeScript')
                throw err
            })
    } catch (error) {
        logs('error','main',`${error.stack}`)
        throw error
    }
}

const executeScript = async() =>{
    const flag = process.argv[2]
    const options = ['-0','-1','-2.1','-2.2','-3']
    if (!options.includes(flag)){
        throw new Error('Flag is not present to run script')
    }
    if (flag==='-0'){
        await script0()
    }
    else if (flag==='-1'){
        const resp = await script1()
        console.log(resp)
    }else if (flag==='-2.1'){
        const resp = await script2Part1()
        console.log(resp)
    }else if (flag==='-2.2'){
        const resp = await script2Part2()
        console.log(resp)
    }
    else{
        await script3()
    }
}

migrationScript().then(resp =>{
     console.log('Script Completed')
     process.exit(0)
}).catch(err=>{
    console.log(err.stack)
    process.exit(1)
})