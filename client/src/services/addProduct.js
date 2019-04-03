import ipfs from '../utils/solidity/ipfs';

const productServices = (() => {

  const prepareProductsForIPFS = productModel => Buffer.from(JSON.stringify(productModel));
  const addToIPFS = async productsInBytes => await ipfs.add(productsInBytes);
  const extractHashFromIPFSResponse = IPFSResponse => IPFSResponse[0].hash;
  const getFromIPFS = async hash => await ipfs.cat(hash);
  const parseToObject = objToParse => JSON.parse(objToParse);

  const initialSet = async productModel => {
    // Convert to byte array
    const userProductsInByte = prepareProductsForIPFS([{ ...productModel, createdAt: Date.now() }]);
    const allProductsInByte = prepareProductsForIPFS([{ ...productModel, createdAt: Date.now() }]);
    // Get hashes
    const addSingleProductsIPFS = await addToIPFS(userProductsInByte);
    const addProductsIPFs = await addToIPFS(allProductsInByte);
    // Add to contract
    const singleProductsIPFSHash = extractHashFromIPFSResponse(addSingleProductsIPFS);
    const allProductsIPFSHash = extractHashFromIPFSResponse(addProductsIPFs);
    return [singleProductsIPFSHash, allProductsIPFSHash];
  }

  const initUserProducts = async productModel => {
    const userProductsInByte = prepareProductsForIPFS([{ ...productModel, createdAt: Date.now() }]);
    const singleProductHash = await addToIPFS(userProductsInByte);
    return singleProductHash[0].hash;
  }

  const collectionOfProducts = async (hash, productModel) => {
    const allProductsIpfsHash = await getFromIPFS(hash);
    const allProducts = parseToObject(allProductsIpfsHash);
    productModel.createdAt = Date.now();
    allProducts.push(productModel);
    const allProductsInByte = prepareProductsForIPFS(allProducts);
    const addProductsIPFs = await addToIPFS(allProductsInByte);
    return addProductsIPFs[0].hash;
  }
  return {
    initialSet,
    initUserProducts,
    collectionOfProducts,
    addToIPFS,
    getFromIPFS,
    parseToObject
  }

})();

export default productServices;