const express = require('express');
const getGeminiResponse = require('../controllers/geminiapi')

const verifyuser=require('../middleware/verification')
const airouter = express.Router();

airouter.post('/getdata',verifyuser,getGeminiResponse)

module.exports=airouter;