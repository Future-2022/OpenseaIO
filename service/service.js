const axios = require("axios");
const moment = require("moment");
const {formatDate} = require('./util');
const sql = require("../config/mySql");
const options = {method: 'GET', headers: {Accept: 'application/json', 'X-API-KEY': '7c01ed670df3403bb8105e5587f93d7f'}};
const LimitNumber = 100;
const ItemNumber = 8;
const MiniInterval = 60;

const  getCollectionInfoV1  = async (pageNumber, pageLimit) => {
    const collectionData = (await axios.get(`https://api.opensea.io/api/v1/collections?offset=${pageNumber}&limit=${LimitNumber}`, options)).data;
    return collectionData;
}


const getSalesDataAssets =async (contractAddress) => {
    const collectionStats = (await axios.get(`https://api.opensea.io/api/v1/events?asset_contract_address=${contractAddress}&limit=${LimitNumber}&event_type=successful`, options)).data;
    // const nextParam = collectionStats['next'];

    console.log(collectionStats["asset_events"]);
    const assetData = collectionStats["asset_events"];

    const salesData = {};
    var key = "Sales";
    salesData[key] = [];
    
    assetData.forEach(item => {
        if(salesData[key].length < 8) {
            if(item['listing_time'] == null) {
                const record = {};
                record['id'] = item['asset']['id'];
                record['name'] = item['asset']['name'];
                record['image_url'] = item['asset']['image_url'];

                if(item['payment_token'] !== null)
                    record['market_image_url'] = item['payment_token']['image_url'];
                else 
                    record['market_image_url'] = '';

                record['sold_date'] = item['event_timestamp'].replace(/T/, ' ').replace(/\..+/, '');
                record['sold_price'] = item['total_price'] / (10 ** 18) + " ETH";

                if(item['asset']['name'].indexOf('#') > 0)
                    record['rarity'] = Number(item['asset']['name'].split('#')[1]);
                else 
                    record['rarity'] = 0;
                    
                salesData[key].push(record);
            }
        }
    });

    console.log(salesData[key].length);
    return assetData; 
}

const getListingDataAssets =async (contractAddress) => {
    const collectionStats = (await axios.get(`https://api.opensea.io/api/v1/events?asset_contract_address=${contractAddress}&limit=${LimitNumber}&event_type=successful`, options)).data;
    // const nextParam = collectionStats['next'];

    const assetData = collectionStats["asset_events"];

    const salesData = {};
    var key = "Listing";
    salesData[key] = [];
    
    assetData.forEach(item => {
        if(salesData[key].length < 8) {
            if(item['listing_time'] != null) {
                // console.log(item);
                const record = {};
                record['id'] = item['asset']['id'];
                record['name'] = item['asset']['name'];
                record['image_url'] = item['asset']['image_url'];

                if(item['payment_token'] !== null)
                    record['market_image_url'] = item['payment_token']['image_url'];
                else 
                    record['market_image_url'] = '';

                record['listing_date'] = item['event_timestamp'].replace(/T/, ' ').replace(/\..+/, '');
                record['listing_price'] = item['total_price'] / (10 ** 18) + " ETH";

                if(item['asset']['name'].indexOf('#') > 0)
                    record['rarity'] = Number(item['asset']['name'].split('#')[1]);
                else 
                    record['rarity'] = 0;
                    
                salesData[key].push(record);
            }
        }
    });
    console.log(salesData[key]);
    return salesData; 
}


const saveSalesData = async (contractAddress, timeInterval) => {
    const nowTime = new Date();
    const prevTime = new Date(nowTime.getTime()-1000*60*timeInterval);
    const salesStats = (await axios.get(`https://api.opensea.io/api/v1/events?asset_contract_address=${contractAddress}&occurred_before=${formatDate(nowTime)}&occurred_after=${formatDate(prevTime)}&event_type=successful`, options)).data;
    console.log(salesStats);
    const salesHistory = {};
    var key = "SalesHistory";
    salesHistory[key] = [];
    var query = "DELETE FROM sales";
    sql.query(query, function (err, result) {
        if (err) throw err;
        console.log("All records has been deleted");
    });

    for(var timeCount = nowTime.getTime(); timeCount > prevTime.getTime(); timeCount -= 1000*60*timeInterval / MiniInterval) {
        var volume = 0;
        var itemNum = 0;
        salesStats['asset_events'].map(item => {
            if(item['listing_time'] == null) {
                const unix = new Date(item['event_timestamp']);
                if(unix.getTime() < timeCount && unix.getTime() > (timeCount - 1000*60*timeInterval / MiniInterval)) {
                    volume += item['total_price'] / (10**18);
                    itemNum ++;
                }
            }
        })
        console.log(' item num' + itemNum + ' volume' + volume);
        
        const record = {};
        record['start_date'] = formatDate(new Date(timeCount - 1000*60*timeInterval / MiniInterval));
        record['end_date'] = formatDate(new Date(timeCount));
        record['volume'] = volume;
        record['avg_volume'] = itemNum == 0 ? volume = 0 : volume / itemNum;
        record['item_num'] = itemNum;

        salesHistory[key].push(record);
        
        sql.query(`INSERT INTO sales (start_date, end_date, volume, avg_volume, item_num) VALUES ('${formatDate(new Date(timeCount - 1000*60*timeInterval / MiniInterval))}', '${formatDate(new Date(timeCount))}', ${volume}, ${ itemNum == 0 ? volume = 0 : volume / itemNum}, ${itemNum})`, function (err) {
            if (err) throw err;
            console.log("1 record inserted");
        });
    }    
    return salesHistory;
}

const saveListingData = async (contractAddress, timeInterval) => {
    const nowTime = new Date();
    const prevTime = new Date(nowTime.getTime()-1000*60*timeInterval);
    const salesStats = (await axios.get(`https://api.opensea.io/api/v1/events?asset_contract_address=${contractAddress}&occurred_before=${formatDate(nowTime)}&occurred_after=${formatDate(prevTime)}&event_type=successful`, options)).data;
    console.log(salesStats);
    const listingHistory = {};
    var key = "ListingHistory";
    listingHistory[key] = [];
    var query = "DELETE FROM listing";
    sql.query(query, function (err, result) {
        if (err) throw err;
        console.log("All records has been deleted");
    });

    for(var timeCount = nowTime.getTime(); timeCount > prevTime.getTime(); timeCount -= 1000*60*timeInterval / MiniInterval) {
        var volume = 0;
        var itemNum = 0;
        salesStats['asset_events'].map(item => {
            if(item['listing_time'] != null) {
                const unix = new Date(item['event_timestamp']);
                if(unix.getTime() < timeCount && unix.getTime() > (timeCount - 1000*60*timeInterval / MiniInterval)) {
                    volume += item['total_price'] / (10**18);
                    itemNum ++;
                }
            }
        })
        
        const record = {};
        record['start_date'] = formatDate(new Date(timeCount - 1000*60*timeInterval / MiniInterval));
        record['end_date'] = formatDate(new Date(timeCount));
        record['volume'] = volume;
        record['avg_volume'] = itemNum == 0 ? volume = 0 : volume / itemNum;
        record['item_num'] = itemNum;

        listingHistory[key].push(record);
        
        sql.query(`INSERT INTO listing (start_date, end_date, volume, avg_volume, item_num) VALUES ('${formatDate(new Date(timeCount - 1000*60*timeInterval / MiniInterval))}', '${formatDate(new Date(timeCount))}', ${volume}, ${ itemNum == 0 ? volume = 0 : volume / itemNum}, ${itemNum})`, function (err) {
            if (err) throw err;
            // console.log("1 record inserted");
        });
    }    
    return salesStats;
}

const assetsForSales = async (contractAddress, timeInterval) => {
    const nowTime = new Date();
    const prevTime = new Date(nowTime.getTime()-1000*60*timeInterval);
    const salesStats = (await axios.get(`https://api.opensea.io/api/v1/events?asset_contract_address=${contractAddress}&occurred_before=${formatDate(nowTime)}&occurred_after=${formatDate(prevTime)}&event_type=successful`, options)).data;
    // console.log(salesStats);
    const listingHistory = {};
    var key = "ListingHistory";
    listingHistory[key] = [];
    var query = "DELETE FROM assetsForSales";
    sql.query(query, function (err, result) {
        if (err) throw err;
        console.log("All records has been deleted");
    });

    for(var timeCount = nowTime.getTime(); timeCount > prevTime.getTime(); timeCount -= 1000*60*timeInterval / (MiniInterval * 100)) {
        var volume = 0;
        var itemNum = 0;
        salesStats['asset_events'].map(item => {
            if(item['listing_time'] != null) {
                const unix = new Date(item['event_timestamp']);
                if(unix.getTime() < timeCount && unix.getTime() > (timeCount - 1000*60*timeInterval / (MiniInterval * 100))) {
                    volume += item['total_price'] / (10**18);
                    itemNum ++;
                }
            }
        })
        
        const record = {};
        // record['start_date'] = formatDate(new Date(timeCount - 1000*60*timeInterval / (MiniInterval * 100)));
        // record['end_date'] = formatDate(new Date(timeCount));
        record['start_date'] = timeCount - 1000*60*timeInterval / (MiniInterval * 100);
        record['end_date'] = timeCount;
        record['volume'] = volume;
        record['avg_volume'] = itemNum == 0 ? volume = 0 : volume / itemNum;
        record['item_num'] = itemNum;

        listingHistory[key].push(record);
        
        sql.query(`INSERT INTO assetsForSales (start_date, end_date, volume, avg_volume, item_num) VALUES ('${timeCount - 1000*60*timeInterval / (MiniInterval * 100)}', '${timeCount}', ${volume}, ${ itemNum == 0 ? volume = 0 : volume / itemNum}, ${itemNum})`, function (err) {
            if (err) throw err;
            // console.log("1 record inserted");
        });
    }    
    return listingHistory;
}

module.exports = { getCollectionInfoV1, getSalesDataAssets, getListingDataAssets, saveSalesData, saveListingData, assetsForSales };