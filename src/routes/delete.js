const express = require('express')
const deleteroutes = express.Router();
const verifyuser = require('../middleware/verification')
const deleteuser  = require('../controllers/deletionapi')


deleteroutes.delete("/deleteprofile/:id",verifyuser,deleteuser)


module.exports = deleteroutes;