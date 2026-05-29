const axios = require('axios');

const languageIdMap = {
  'javascript': 63,
  'nodejs': 63,
  'node': 63,
  'js': 63,
  'python': 71,
  'python3': 71,
  'py': 71,
  'cpp': 54,
  'c++': 54,
  'cpp14': 54,
  'cpp17': 54,
  'java': 62,
  'c': 50,
  'bash': 46,
  'ruby': 72,
  'go': 60,
  'golang': 60,
  'rust': 73,
  'typescript': 74,
  'ts': 74,
  'php': 68,
  'haskell': 61,
  'clojure': 18,
  'r': 71, // Default to Python if R not found, adjust as needed
  'elixir': 57,
  'erlang': 58,
  'lua': 64,
  'ocaml': 65,
  'pascal': 67,
  'fortran': 59,
  'csharp': 51,
  'c#': 51,
  'commonlisp': 55,
  'lisp': 55,
  'd': 56,
  'prolog': 69,
  'plaintext': 43,
  'executable': 44
};


const getLanguageId = (languageName) => {
  if (!languageName) {
    throw new Error('Language name is required');
  }
  
  const langId = languageIdMap[languageName.toLowerCase().trim()];
  
  if (!langId) {
    throw new Error(`Language '${languageName}' not supported. Supported languages: ${Object.keys(languageIdMap).join(', ')}`);
  }
  
  return langId;
};

// Helper function to decode base64
const decodeBase64 = (str) => {
  if (!str) return null;
  try {
    return Buffer.from(str, 'base64').toString('utf-8');
  } catch (err) {
    return str; // Return as-is if decode fails
  }
};

const gettokensjudge = async(submissions)=>{

  // Base64 encode all submissions before sending to Judge0
  const encodedSubmissions = submissions.map((sub) => ({
    ...sub,
    source_code: Buffer.from(sub.source_code).toString('base64'),
    stdin: Buffer.from(sub.stdin).toString('base64'),
    expected_output: Buffer.from(sub.expected_output).toString('base64')
  }));

  const options = {
    method: 'POST',
    url: 'https://judge029.p.rapidapi.com/submissions/batch',
    params: {
      base64_encoded: 'true'
    },
    headers: {
      'x-rapidapi-key': process.env.JUDGE0_API_KEY,
      'x-rapidapi-host': process.env.JUDGE0_API_HOST,
      'Content-Type': 'application/json'
    },
    data: {
      submissions: encodedSubmissions
    }
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    let errorMsg = 'Submission failed';
    if (error.response?.data?.error) {
      errorMsg = error.response.data.error;
      console.error('Judge0 API Error:', errorMsg);
    } else {
      console.error('Judge0 Error:', error.message);
    }
    
    const err = new Error(errorMsg);
    err.status = error.response?.status || 500;
    throw err;
  }
}

const waiting = async(timer)=>{
  return new Promise((resolve) => {
    setTimeout(resolve, timer);
  });
}

const submitBatchjudge = async(tokens)=>{
  const options = {
    method: 'GET',
    url: 'https://judge029.p.rapidapi.com/submissions/batch',
    params: {
      tokens: tokens.join(','),
      base64_encoded: 'true',
      fields: '*'
    },
    headers: {
      'x-rapidapi-key': process.env.JUDGE0_API_KEY,
      'x-rapidapi-host': process.env.JUDGE0_API_HOST,
      'Content-Type': 'application/json'
    }
  };

 const maxRetries = 30; // Max 30 seconds (30 * 1 second)
 let retries = 0;

 async function fetchData() {
  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    let errorMsg = 'Failed to fetch submission results';
    if (error.response?.data?.error) {
      errorMsg = error.response.data.error;
      console.error('Judge0 API Error:', errorMsg);
    } else {
      console.error('Judge0 Fetch Error:', error.message);
    }
    throw new Error(errorMsg);
  }
 }

  
 while(retries < maxRetries){

 const result =  await fetchData();

  const IsResultObtained =  result.submissions.every((r)=>r.status_id>2);

  if(IsResultObtained){
    // Decode all base64 fields
    const decodedSubmissions = result.submissions.map((sub) => ({
      ...sub,
      source_code: decodeBase64(sub.source_code),
      stdin: decodeBase64(sub.stdin),
      expected_output: decodeBase64(sub.expected_output),
      stdout: decodeBase64(sub.stdout),
      stderr: decodeBase64(sub.stderr),
      compile_output: decodeBase64(sub.compile_output)
    }));
    return decodedSubmissions;
  }

  retries++;
  await waiting(1000);
}

throw new Error('Judge0 API timeout: Results not obtained within 30 seconds');

}

module.exports = {gettokensjudge, submitBatchjudge, getLanguageId}
