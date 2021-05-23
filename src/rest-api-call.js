const axios = require('axios');
const logger = require('./utils/logger')();
const config = require('config')

const API = axios.create({
    baseURL: config.BackendAPI,
    headers: {
        'Authorization': config.AuthToken
    }
});

const callRestAPI_POST = async (url, params) => {
    try {
       return await API.post(url, params)        
    } catch (err) {
        logger.error(`REST API CALL FAILED for : ${url}`)
    }
}

const callRestAPI_GET = async (url) => {
    try {
       return await API.get(url)        
    } catch (err) {
        logger.error(`REST API CALL FAILED for : ${url}`)
    }
}

module.exports = {
    callRestAPI_POST: callRestAPI_POST,
    callRestAPI_GET: callRestAPI_GET
}