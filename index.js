let prompt = require('prompt');
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
        // Entered invalid number
        if(!addrNum){
            console.error('Invalid number.')
            return;
        }
        console.log("\nEnter your mnemonic phrase:")
        prompt.get([{
            name: 'mnemonic',
            hidden: true
          }], (err, result) => {
            let mnemonic = result.mnemonic.trim();

            let words = mnemonic.split(' ').filter(word => {
                return !(word==='');
            });

            if(words.length !== 24){
                console.error('The mnemonic phrase is not valid. Please make sure it has 24 words.')
                return;
            }

            let cleanMnemonic = words.join(' ');
            let addresses = generateAddresses(cleanMnemonic, addrNum);

            console.log('\n');
            for(let i=0; i<addresses.length; i++){
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
    for(let i=0; i<num; i++){
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
