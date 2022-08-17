const express = require('express');
const router = express.Router();

const {getCollectionInfoV1, getSalesDataAssets, getListingDataAssets, saveSalesData, saveListingData,
  assetsForSales
} = require('../../service/service');


// @route    GET api/auth
// @desc     Get user by token
// @access   Private

router.get('/getCollection/:pageNumber/:limitNumber', async (req, res) => {
  try {
    const pageNum = req.params.pageNumber;
    const pageLim = req.params.limitNumber;
    const collectionData = await getCollectionInfoV1(pageNum, pageLim);
    res.json(collectionData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/getSalesDataAssets/:contractAddress', async (req, res) => {
  try {
    const contractAddress = req.params.contractAddress;

    const assetData = await getSalesDataAssets(contractAddress);
    res.json(assetData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/getListingDataAssets/:contractAddress', async (req, res) => {
  try {
    const contractAddress = req.params.contractAddress;

    const assetData = await getListingDataAssets(contractAddress);
    res.json(assetData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/saveSalesDataChart/:contractAddress/:timeInterval', async (req, res) => {
  try {
    const contractAddress = req.params.contractAddress;
    const timeInterval = req.params.timeInterval;

    const assetData = await saveSalesData(contractAddress, timeInterval);
    res.json(assetData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
router.get('/saveListingDataChart/:contractAddress/:timeInterval', async (req, res) => {
  try {
    const contractAddress = req.params.contractAddress;
    const timeInterval = req.params.timeInterval;

    const assetData = await saveListingData(contractAddress, timeInterval);
    res.json(assetData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
router.get('/assetsForSalesChart/:contractAddress/:timeInterval', async (req, res) => {
  try {
    const contractAddress = req.params.contractAddress;
    const timeInterval = req.params.timeInterval;

    const assetData = await assetsForSales(contractAddress, timeInterval);
    res.json(assetData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// //@route GET api/getCollectionInfo/:collection_slug
// //@access Private

// router.get('/getCollectionInfo/:collection_slug', async(req, res) => {
//   try{
//     const collectionSlug = req.params.collection_slug;

//     const collectionStatData = await getCollectionInfo(collectionSlug);
//     res.json(collectionStatData);
//   } catch(err) {
//     console.log(err)
//     res.status(500).json('Server Error'); 
//   }
// });

// // @router GET api/collectionInfo/getContractInfo/:address
// // @access Private

// router.get(`/getContractInfo/:address`, async(req, res) => {
//   try{
//     const address = req.params.address;
//     const contractData = await getContractInfo(address);
//     res.json(contractData);
//   } catch(err) {
//     console.log(err)
//     res.status(500).json('Server Error'); 
//   }
// });



module.exports = router;
