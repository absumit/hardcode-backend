const express = require("express")
const submitroutes = express.Router()
const verifyuser = require("../middleware/verification")
const {submitcode,runthecode} = require("../controllers/submission")


submitroutes.post("/submit/:id",verifyuser,submitcode)

submitroutes.post("/runcode/:id",verifyuser,runthecode)


module.exports = submitroutes;