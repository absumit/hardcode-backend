const Problem = require('../models/problem')
const Submission = require('../models/submission')
const User = require('../models/user')
const {gettokensjudge, submitBatchjudge, getLanguageId} = require('../utils/judge0')


const submitcode = async(req,res)=>{

    const userid = req.user.id;
    const mongoproblemid = req.params.id;

    try{

    const{code,language}=req.body;

    const problem = await Problem.findById(mongoproblemid);
    
    if(!problem){
      return res.status(404).json({message: "Problem not found"});
    }

   const submittedResult = await Submission.create({
        userid,mongoproblemid,code,language,status:'pending',testCasesTotal:problem.hiddentestcases.length
    })

    const languageId = getLanguageId(language);

    const submissions = problem.hiddentestcases.map((testcase)=>({
        source_code:code,
        language_id: languageId,
        stdin: testcase.input,
        expected_output: testcase.output
    }));


    const submitResult = await gettokensjudge(submissions);
    
    const resultToken = submitResult.map((value)=> value.token);

    const testResult = await submitBatchjudge(resultToken);

    // submittedResult ko update karo
    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let status = 'accepted';
    let errorMessage = null;


    for(const test of testResult){
        if(test.status_id==3){
           testCasesPassed++;
           runtime = runtime+parseFloat(test.time)
           memory = Math.max(memory,test.memory);
        }else if(test.status_id===6){
          // Compilation Error
          status = 'error'
          errorMessage = test.compile_output || test.stderr
        }
        else if(test.status_id===7){
          // Runtime Error
          status = 'error'
          errorMessage = test.stderr
        }
        else{
          // Wrong Answer, TLE, or other
          status = 'wrong'
          errorMessage = test.stderr
        }
    }

    
    if(testCasesPassed !== problem.hiddentestcases.length){
      status = status === 'error' ? 'error' : 'wrong';
    }


    
    submittedResult.status   = status;
    submittedResult.testCasesPassed = testCasesPassed;
    submittedResult.errorMessage = errorMessage;
    submittedResult.runtime = runtime;
    submittedResult.memory = memory;

    await submittedResult.save();
    
    // ProblemId ko insert karenge userSchema ke problemSolved mein if it is not persent there.
    
    const currentUser = await User.findById(userid);
    if(currentUser && !currentUser.problemSolved.includes(mongoproblemid)){
      currentUser.problemSolved.push(mongoproblemid);
      await currentUser.save();
    }

    res.status(201).json(submittedResult);
 
   }
   catch(err)
   {
      const status = err.status || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({message: message});
   }
   }


const runthecode = async(req,res)=>{

    const mongoproblemid = req.params.id;
   

    try{

    const{code,language}=req.body;

    const problem = await Problem.findById(mongoproblemid);
    
    if(!problem){
      return res.status(404).json({message: "Problem not found"});
    }

    const languageId = getLanguageId(language);

    const submissions = problem.examples.map((testcase)=>({
        source_code:code,
        language_id: languageId,
        stdin: testcase.input,
        expected_output: testcase.output
    }));


    const submitResult = await gettokensjudge(submissions);
    
    const resultToken = submitResult.map((value)=> value.token);

    const testResult = await submitBatchjudge(resultToken);

    res.status(201).json(testResult);
 
   }
   catch(err)
   {
      const status = err.status || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({message: message});
   }





}

module.exports = {submitcode,runthecode}
