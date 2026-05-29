const express = require('express')
const problemroutes = express.Router()
const adminverification = require('../middleware/verifyadmin')
const verifyuser = require('../middleware/verification')

const {createproblem,updateproblem,deleteproblem,getallproblems,mysolvedproblems,problemSubmissions,checkProblemIdExists} = require('../controllers/problemapi')

//problem create

problemroutes.post('/create',adminverification,createproblem)

//problem delete
problemroutes.delete('/delete/:id',adminverification, deleteproblem)

//fetch all problem
problemroutes.get('/getallproblems',verifyuser,getallproblems)

//problem update
problemroutes.put('/update/:id',adminverification,updateproblem) 

//my solved problem
problemroutes.get('/mysolvedproblem',verifyuser,mysolvedproblems)

//get my submissions
problemroutes.get('/submissions/:pid',verifyuser,problemSubmissions)

//check if problem id exists
problemroutes.get('/check/:problemid',checkProblemIdExists)

module.exports = problemroutes;
