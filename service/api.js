const axios = require("axios");
const moment = require("moment");

const calculatorBuyRank = async (rarity) => {    
    const result = await Number(rarity) * 10 / 5;
    
    return result;  
}

module.exports = { calculatorBuyRank };