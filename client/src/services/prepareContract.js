import { ethers } from 'ethers';
import contractAddress from '../utils/solidity/contractAddress';
import getWeb3 from '../utils/solidity/getWeb3';
import IPFSContractABI from '../utils/solidity/ABI/Ipfs.json';

const contractSetup = (async () => {
  const web3 = await getWeb3();

  const provider = new ethers.providers.Web3Provider(web3.currentProvider);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(contractAddress, IPFSContractABI, signer);

  return { web3, provider, signer, contract };
})();

export default contractSetup