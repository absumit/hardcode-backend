const User = require('../models/user')
const Submission = require('../models/submission')
const mongoose = require('mongoose') 

const deleteuser = async(req,res)=>{

       const id = req.params.id;

       if(!id)
       return res.status(400).json({msg:"id is missing",success:false})

       try{
 
         
            
        const deleteduser = await User.findByIdAndDelete({_id:id});

        if(!deleteduser)
            res.status(400).json({msg:"User not found",success:false})
       
        const usersubmissions = await Submission.deleteMany({ userid: id });
          
         res.status(200).json({msg:"user deleted",success:true,deleted:deleteduser?.firstname,submissiondeleted:usersubmissions})
       }
       catch(err)
       {
          res.status(400).json({msg:err.message,success:false}) 
       }


}

module.exports = deleteuser;