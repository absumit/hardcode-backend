const {validation} = require('../utils/validate')
const user = require('../models/user')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const getSafeUser = (dbUser) => ({
    _id: dbUser._id,
    firstname: dbUser.firstname,
    lastName: dbUser.lastName,
    emailid: dbUser.emailid,
    age: dbUser.age,
    role: dbUser.role,
    problemSolved: dbUser.problemSolved,
    createdAt: dbUser.createdAt,
    updatedAt: dbUser.updatedAt,
});

const getCookieBaseOptions = () => {
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieDomain = process.env.AUTH_COOKIE_DOMAIN;

    const options = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/',
    };

    // Helps with some cross-site cookie scenarios in modern Chromium browsers.
    if (isProduction) {
        options.partitioned = true;
    }

    if (cookieDomain) {
        options.domain = cookieDomain;
    }

    return options;
};

const getCookieOptions = () => ({
    ...getCookieBaseOptions(),
    maxAge: 7 * 24 * 60 * 60 * 1000,
});

const getCookieClearOptions = () => ({
    ...getCookieBaseOptions(),
    maxAge: undefined,
    expires: new Date(0),
});

const dashboard = async (req,res)=>{
    res.send("into the dashboard")
}

const register = async (req,res)=>{

    try{
           
         validation(req.body);
         const {firstname,password}=req.body
         req.body.password = await bcrypt.hash(password,10);

        const newUser = await user.create(req.body);

        res.status(201).json({
            message: `${firstname} registered successfully`,
            success: true,
            user: getSafeUser(newUser),
        })
    }
    catch(err)
    {
        res.status(400).json({ message: err.message, success: false })
    }

}

const login = async (req,res)=>{

    try{
         
          const {emailid,password}=req.body;

          const dbdata = await user.findOne({emailid})
          if(!dbdata)
          throw new Error("email doesnot exist")

          const valid = await bcrypt.compare(password,dbdata.password)
          if(!valid)
            throw new Error("invalid password");

         const token = jwt.sign({id:dbdata._id,emailid:emailid,name:dbdata.firstname,role:dbdata.role},process.env.JWT_KEY,{expiresIn:60*60*24*7})

         res.cookie('token',token,getCookieOptions())
         
         res.status(200).json({
            message: "Logged in successfully",
            success: true,
            user: getSafeUser(dbdata),
         })
    }
    catch(err)
    {
       res.status(400).json({ message: err.message, success: false });
    }
}

const logout = async (req,res)=>{
     
    res.clearCookie('token', getCookieClearOptions())
    res.status(200).json({ message: "Logged out successfully", success: true });
}

const myprofile = async (req,res)=>{
     
    try{
        const emailid = req.user.emailid;
        const dbdata = await user.findOne({emailid}).select('-password');
        res.status(200).json({ data: dbdata, success: true });
    }
    catch(err){
        res.status(400).json({ message: err.message, success: false });
    }
}

module.exports={register,login,logout,myprofile,dashboard}
