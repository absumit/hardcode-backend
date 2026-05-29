const jwt = require('jsonwebtoken')

const verifyuser=(req,res,next)=>{
      
    try{
          const token = req.cookies.token;
          if(!token)
            return res.status(401).json({ message: "No token provided", success: false })
          
          const payload = jwt.verify(token,process.env.JWT_KEY)
          req.user=payload;
          next();

    }
    catch(err)
    {
         res.status(401).json({ message: "Invalid token", success: false });
    }
   
}

module.exports = verifyuser;