var prompt = require('prompt');
const HDKey = require('hdkey');
const bip39 = require('bip39');
const Buffer = require('buffer/').Buffer;
const Avalanche = require('avalanche');
const AVAX_ACCOUNT_PATH = `m/44'/9000'/0'`;

try{
    prompt.start();
    console.log();
    console.log("How many addresses do you want to generate?")
    prompt.get(['num_addr'], (err, result) => {
        let addrNum = parseInt(result.num_addr);
        console.log("\nEnter your mnemonic phrase:")
        prompt.get(['mnemonic'], (err, result) => {
            let mnemonic = result.mnemonic.trim();
            let words = mnemonic.split(' ');

            if(words.length !== 24){
                console.error('Invalid mnemonic phrase.')
                return;
            }
            let addresses = generateAddresses(mnemonic, addrNum);
            console.log('\n');
            for(var i=0; i<addresses.length; i++){
                console.log(`${i}:\t${addresses[i]}`);
            }
            console.log();
        });
    })
}catch(e){
    console.error(e);
}


function generateAddresses(mnemonicIn, num){
    let hrp = Avalanche.getPreferredHRP(1);
    let keychain = new Avalanche.AVMKeyChain(hrp,'X');

    let mnemonic = mnemonicIn.trim();
    const seed = bip39.mnemonicToSeedSync(mnemonic)
    const hdkey = HDKey.fromMasterSeed(seed)

    let keys = [];
    for(var i=0; i<num; i++){
        let derivationPath = `${AVAX_ACCOUNT_PATH}/0/${i}`;
        let key = hdkey.derive(derivationPath)
        keys.push(key);
    }

    let addrs = keys.map((key) => {
        let pkHex = key.privateKey.toString('hex');
        let pkBuf = new Buffer(pkHex, 'hex');
        let addr = keychain.importKey(pkBuf);
        let keypair = keychain.getKey(addr)
        return keypair.getAddressString();
    });

    return addrs;
}
