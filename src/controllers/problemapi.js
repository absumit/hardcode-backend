const Problem = require('../models/problem')
const User = require('../models/user')
const Submission = require('../models/submission')
const {validateproblem,validation} = require('../utils/validate')
const {gettokensjudge, submitBatchjudge, getLanguageId} = require('../utils/judge0')

const createproblem = async (req,res)=>{
  try {
    const newproblem = req.body;
    validateproblem(newproblem)

    // Add createdBy from authenticated admin
    if(!req.user || !req.user.id) {
      return res.status(401).json({msg: "Admin not authenticated", success: false});
    }
    newproblem.createdBy = req.user.id;

    // Parse constraints if it's a string
    if(typeof newproblem.constraints === 'string') {
      newproblem.constraints = newproblem.constraints.split('\n').filter(c => c.trim());
    }

    // Parse tags if it's a string
    if(typeof newproblem.tags === 'string') {
      newproblem.tags = newproblem.tags.split(',').map(t => t.trim()).filter(t => t);
    }

    // Parse examples if it's a string (JSON)
    if(typeof newproblem.examples === 'string') {
      newproblem.examples = JSON.parse(newproblem.examples);
    }

    // Parse hiddentestcases if it's a string (JSON)
    if(typeof newproblem.hiddentestcases === 'string') {
      newproblem.hiddentestcases = JSON.parse(newproblem.hiddentestcases);
    }

    // Parse refsolution if it's a string (JSON)
    if(typeof newproblem.refsolution === 'string') {
      newproblem.refsolution = JSON.parse(newproblem.refsolution);
    }

    const {refsolution, examples} = newproblem

    // Test each language solution with examples
    for(const {language, solution} of refsolution) {

      const submissions = examples.map((test) => ({
        source_code: solution,
        language_id: getLanguageId(language),
        stdin: test.input,
        expected_output: test.output
      }))

      try {
        
        const tokenResponse = await gettokensjudge(submissions);
        const tokens = tokenResponse.map(sub => sub.token);

      
        const testResults = await submitBatchjudge(tokens);

        
        for(let i = 0; i < testResults.length; i++) {
          const result = testResults[i];
          
          if(result.status_id !== 3) {
            return res.status(400).json({
              msg: `Test ${i+1} failed for ${language}`,
              success: false
            })
          }
        }

      } catch(err) {
        return res.status(400).json({
          msg: `Error testing solution for ${language}`,
          error: err.message,
          success: false
        })
      }
    }
    
    await Problem.create(newproblem)
    res.status(201).json({msg: "Problem created successfully", success: true})

  } catch(err) {
    console.log(err);
    res.status(400).json({msg: err.message || "Failed to create problem", success: false})
  }
}

const updateproblem = async(req,res)=>{

     const toupdateid = req.params.id;
     
     if(!toupdateid)
      return res.status(400).json({msg:"Problem ID is required", success: false});

     const existingproblem = await Problem.findOne({problemid:toupdateid})

     if(!existingproblem) {
       return res.status(404).json({msg: "Problem not found", success: false})
     }

     const newproblem = req.body;
    validateproblem(newproblem); 

     try {
    const {refsolution, examples} = newproblem

    for(const {language, solution} of refsolution) {

      const submissions = examples.map((test) => ({
        source_code: solution,
        language_id: getLanguageId(language),
        stdin: test.input,
        expected_output: test.output
      }))

      try {
        
        const tokenResponse = await gettokensjudge(submissions);
        const tokens = tokenResponse.map(sub => sub.token);

      
        const testResults = await submitBatchjudge(tokens);

        
        for(let i = 0; i < testResults.length; i++) {
          const result = testResults[i];
          
          if(result.status_id !== 3) {
            return res.status(400).json({
              msg: `Test ${i+1} failed for ${language}`,
              success: false
            })
          }
        }

      } catch(err) {
        return res.status(400).json({
          msg: `Error testing solution for ${language}`,
          error: err.message,
          success: false
        })
      }
    }
    const updatedProblem = await Problem.findOneAndUpdate({ problemid: toupdateid },newproblem,{returnDocument: 'after'})
    
    if(!updatedProblem) {
      return res.status(404).json({msg: "Problem not found", success: false})
    }

    res.status(200).json({msg: "Problem updated successfully", success: true})

  } catch(err) {
    console.log(err);
    res.status(400).json({msg: err.message || "Failed to update problem", success: false})
  }


}


const deleteproblem = async(req,res)=>{
    const todeleteid = req.params.id;
    
    if(!todeleteid)
      return res.status(400).json({msg:"Problem ID is required", success: false});

    try {
      const deletedProblem = await Problem.findOneAndDelete({problemid:todeleteid})

      if(!deletedProblem)
        return res.status(404).json({msg:"Problem not found", success: false});

      res.status(200).json({msg:`Problem ${todeleteid} deleted successfully`, success: true})
    }
    catch(err) {
      res.status(500).json({msg: err.message || "Failed to delete problem", success: false})
    }
}

const getallproblems = async(req,res)=>{

     try{
         
        const allproblems = await Problem.find({}).select('-createdBy')

        if(allproblems.length==0)
          return res.status(500).json({msg:"no questions in the database"})

        res.status(200).json({allproblems})

     }
     catch(err)
     {
       res.status(500).json({msg:err,success:false})
     }

}

const mysolvedproblems = async (req,res)=>{
    
    try{
      if(!req.user || !req.user.id) {
        return res.status(400).json({msg: "User not authenticated", success: false});
      }
       
      const userid = req.user.id;

      const user = await User.findById(userid).populate({
        path:"problemsolved",
        select:"_id title difficulty tags"
      });
      
      if(!user) {
        return res.status(404).json({msg: "User not found", success: false});
      }
      
      res.status(200).json({problems:user.problemsolved, success: true});

    }
    catch(err){
      console.log(err);
      res.status(500).json({msg:err.message || "Server Error", success: false});
    }

}

const problemSubmissions = async(req,res)=>{

  try{
    if(!req.user || !req.user.id) {
      return res.status(400).json({msg: "User not authenticated", success: false});
    }
    
    if(!req.params.pid) {
      return res.status(400).json({msg: "Problem ID is required", success: false});
    }
     
    const userid = req.user.id;
    const mongoproblemid = req.params.pid;

    const ans = await Submission.find({userid, mongoproblemid});
  
    if(ans.length==0)
      return res.status(200).json({msg:"No submissions", success: true});

    res.status(200).json({submissions:ans, success: true});

  }
  catch(err){
    console.log(err);
    res.status(500).json({msg: err.message || "Internal Server Error", success: false});
  }
}

const checkProblemIdExists = async(req,res)=>{
  try {
    const {problemid} = req.params;
    
    if(!problemid)
      return res.status(400).json({msg:"Problem ID is required", success: false});
    
    const problem = await Problem.findOne({problemid: problemid});
    
    res.status(200).json({
      exists: !!problem,
      success: true
    });
  }
  catch(err){
    console.log(err);
    res.status(500).json({msg: err.message || "Internal Server Error", success: false});
  }
}

module.exports = {createproblem,updateproblem,deleteproblem,getallproblems,mysolvedproblems,problemSubmissions,checkProblemIdExists}
