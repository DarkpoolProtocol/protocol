const Asset = artifacts.require('./Asset.sol');
const Exchange = artifacts.require('./Exchange.sol');
const PriceFeed = artifacts.require('./PriceFeed.sol');
const Universe = artifacts.require('./Universe.sol');

const tokenInfo = require('./config/token_info.js');
const dataFeedInfo = require('./config/data_feed_info.js');
const exchangeInfo = require('./config/exchange_info.js');


module.exports = async function (deployer, network) {
  if (network !== 'development') {
    const ethTokenAddress = tokenInfo[network].find(t => t.symbol === 'ETH-T').address;
    const tokenAddresses = tokenInfo[network].filter(
      t => // Note: Must be subset of what data feeds provide data for
        t.symbol !== 'AVT-T' &&
        t.symbol !== 'DGX-T' &&
        t.symbol !== 'MKR-T' &&
        t.symbol !== 'ZRX-T',
    ).map(t => t.address);
    try {
      await deployer.deploy(Universe,
        ethTokenAddress,
        tokenAddresses,
        Array(tokenInfo[network].length).fill(dataFeedInfo[network].find(d => d.name === 'CryptoCompare').address),
        Array(tokenInfo[network].length).fill(exchangeInfo[network].find(e => e.name === 'OasisDex').address),
      );
    } catch (e) {
      throw e;
    }
  } else {
    let ethAddr;
    let mlnAddr;
    let btcAddr;
    deployer.deploy(Asset, 'Ether Token', 'ETH-T', 18)
    .then(() => ethAddr = Asset.address)
    .then(() => deployer.deploy(Asset, 'Bitcoin Token', 'BTC-T', 18))
    .then(() => btcAddr = Asset.address)
    .then(() => deployer.deploy(Asset, 'Melon Token', 'MLN-T', 18))
    .then(() => mlnAddr = Asset.address)
    .then(() => deployer.deploy(PriceFeed, 0, mlnAddr, [ethAddr, btcAddr]))
    .then(() => deployer.deploy(Exchange))
    .then(() => {
      deployer.deploy(Universe,
        ethAddr,
        [mlnAddr, btcAddr],
        PriceFeed.address,
        Exchange.address,
      );
    })
    .catch(e => { throw e });
  }
};
