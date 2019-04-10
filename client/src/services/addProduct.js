import ipfs from '../utils/solidity/ipfs';

const productServices = (() => {

  const prepareProductsForIPFS = productModel => Buffer.from(JSON.stringify(productModel));
  const addToIPFS = async productsInBytes => await ipfs.add(productsInBytes);
  const extractHashFromIPFSResponse = IPFSResponse => IPFSResponse[0].hash;
  const getFromIPFS = async hash => await ipfs.cat(hash);
  const parseToObject = objToParse => JSON.parse(objToParse);

  const initialSet = async productModel => {
    // Convert to byte array
    const userProductsInByte = prepareProductsForIPFS([{ ...productModel, createdAt: Date.now(), id: 1 }]);
    const allProductsInByte = prepareProductsForIPFS([{ ...productModel, createdAt: Date.now(), id: 1 }]);
    // Get hashes
    const addSingleProductsIPFS = await addToIPFS(userProductsInByte);
    const addProductsIPFs = await addToIPFS(allProductsInByte);
    // Add to contract
    const singleProductsIPFSHash = extractHashFromIPFSResponse(addSingleProductsIPFS);
    const allProductsIPFSHash = extractHashFromIPFSResponse(addProductsIPFs);
    return [singleProductsIPFSHash, allProductsIPFSHash];
  }

  const initSingleProduct = async (productModel, id) => {
    console.log(id);
    productModel.createdAt = Date.now();
    productModel.id = id;
    console.log(productModel);
    const userProductsInByte = prepareProductsForIPFS([productModel]);
    const singleProductHash = await addToIPFS(userProductsInByte);
    return singleProductHash[0].hash;
  }

  const collectionOfProducts = async (hash, productModel, id) => {
    const allProductsIpfsHash = await getFromIPFS(hash);
    const allProducts = parseToObject(allProductsIpfsHash);
    productModel.createdAt = Date.now();

    if (id) {
      productModel.id = id;
    } else {
      productModel.id = allProducts.length + 1;
    }
    allProducts.push(productModel);
    console.log(allProducts);
    const allProductsInByte = prepareProductsForIPFS(allProducts);
    const addProductsIPFs = await addToIPFS(allProductsInByte);
    return [addProductsIPFs[0].hash, productModel.id];
  }

  const addToIPFSAfterFilter = async productToSave => {
    const productInBytes = prepareProductsForIPFS(productToSave);
    const newHash = await addToIPFS(productInBytes);
    return newHash[0].hash;
  }












  return {
    initialSet,
    initSingleProduct,
    collectionOfProducts,
    prepareProductsForIPFS,
    addToIPFS,
    getFromIPFS,
    parseToObject,
    addToIPFSAfterFilter
  }

})();

export default productServices;