import ipfs from '../utils/solidity/ipfs';

const productServices = (() => {

  const prepareProductsForIPFS = objectToSave => Buffer.from(JSON.stringify([{ ...objectToSave }]));
  const addToIPFS = async productsInBytes => await ipfs.add(productsInBytes);
  const extractHashFromIPFSResponse = IPFSResponse => IPFSResponse[0].hash;
  const getFromIPFS = async hash => await ipfs.cat(hash);
  const parseToObject = objToParse => JSON.parse(objToParse);

  const initialSet = async objectToSave => {
    // Convert to byte array
    const userProductsInByte = prepareProductsForIPFS({ ...objectToSave, createdAt: Date.now() });
    const allProductsInByte = prepareProductsForIPFS({ ...objectToSave, createdAt: Date.now() });
    // Get hashes
    const addSingleProductsIPFS = await addToIPFS(userProductsInByte);
    const addProductsIPFs = await addToIPFS(allProductsInByte);
    // Add to contract
    const singleProductsIPFSHash = extractHashFromIPFSResponse(addSingleProductsIPFS);
    const allProductsIPFSHash = extractHashFromIPFSResponse(addProductsIPFs);
    return [singleProductsIPFSHash, allProductsIPFSHash];
  }

  const initUserProducts = async objectToSave => {
    const userProductsInByte = prepareProductsForIPFS({ ...objectToSave, createdAt: Date.now() });
    const singleProductHash = await addToIPFS(userProductsInByte);
    return singleProductHash[0].hash;
  }

  const collectionOfProducts = async (hash, objectToSave) => {
    const allProductsIpfsHash = await getFromIPFS(hash);
    const allProducts = parseToObject(allProductsIpfsHash);
    allProducts.push({ ...objectToSave, createdAt: Date.now() });
    const allProductsInByte = prepareProductsForIPFS(allProducts);
    const addProductsIPFs = await addToIPFS(allProductsInByte);

    return addProductsIPFs[0].hash;
  }

  return {
    initialSet,
    initUserProducts,
    collectionOfProducts
  }

})();

export default productServices;