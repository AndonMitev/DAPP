const IPFS = require('ipfs-http-client');
const ipfs = new IPFS({ host: 'ipfs.infura.io', post: 5001, protocol: 'https' });
export default ipfs;