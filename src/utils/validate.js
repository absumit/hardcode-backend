const validator = require('validator')

const validation = (userdata)=>{

    const mandatoryField = ['firstname','emailid','password'];

    const isallowed = mandatoryField.every((k)=>Object.keys(userdata).includes(k));

    if(!isallowed)
        throw new Error('some field missing');

    if(!validator.isEmail(userdata.emailid))
        throw new Error('invalid email')

    if(!validator.isStrongPassword(userdata.password))
        throw new Error("weak password")

}


const validateproblem = (problemdata) => {
  const mandatoryFields = ['problemid', 'title', 'description', 'difficulty', 'examples', 'refsolution'];

  const isallowed = mandatoryFields.every((k) =>
    Object.keys(problemdata).includes(k)
  );

  if (!isallowed) throw new Error('Some mandatory fields missing');

  if (!validator.isLength(problemdata.problemid, { min: 2, max: 4 }))
    throw new Error('Problem ID must be between 2 and 4 characters');

  if (!validator.isLength(problemdata.title, { min: 3, max: 200 }))
    throw new Error('Title must be between 3 and 200 characters');

  if (!validator.isLength(problemdata.description, { min: 10, max: 5000 }))
    throw new Error('Description must be between 10 and 5000 characters');

  const validDifficulties = ['easy', 'medium', 'hard'];
  if (!validDifficulties.includes(problemdata.difficulty.toLowerCase()))
    throw new Error('Difficulty must be easy, medium, or hard');

  // Validate examples
  if (Array.isArray(problemdata.examples)) {
    if (problemdata.examples.length === 0)
      throw new Error('At least one example is required');
    
    for (let i = 0; i < problemdata.examples.length; i++) {
      const ex = problemdata.examples[i];
      if (!ex.input || !ex.output)
        throw new Error(`Example ${i + 1} must have input and output`);
    }
  } else {
    throw new Error('Examples must be an array');
  }

  // Validate refsolution
  if (Array.isArray(problemdata.refsolution)) {
    if (problemdata.refsolution.length === 0)
      throw new Error('At least one reference solution is required');
    
    for (let i = 0; i < problemdata.refsolution.length; i++) {
      const sol = problemdata.refsolution[i];
      if (!sol.language || !sol.solution)
        throw new Error(`Solution ${i + 1} must have language and solution code`);
    }
  } else {
    throw new Error('Reference solutions must be an array');
  }
};


module.exports ={validation,validateproblem};