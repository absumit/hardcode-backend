const express = require('express');
const {register,login,logout,myprofile,dashboard}=require('../controllers/userauthentication')
const verifyuser=require('../middleware/verification')

const authrouter = express.Router();

authrouter.get('/',dashboard)
authrouter.post('/register',register);
authrouter.post('/login',login)
authrouter.get('/logout',verifyuser,logout)
authrouter.get('/myprofile',verifyuser,myprofile)

module.exports=authrouter;
