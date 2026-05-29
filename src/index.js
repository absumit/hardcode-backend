const express = require('express')
const app = express();
const fs = require('fs');
const path = require('path');
const rootEnvPath = path.join(__dirname, '..', '.env');
const legacyEnvPath = path.join(__dirname, '.env');

require('dotenv').config({
  path: fs.existsSync(rootEnvPath) ? rootEnvPath : legacyEnvPath,
});
const cors = require('cors');
const main =  require('./config/db')
const cookieParser =  require('cookie-parser');
const user = require('./models/user')
const authrouter = require('./routes/authroutes')
const problemroutes = require('./routes/routesproblem')
const submitroutes = require("./routes/submit")
const deleteroutes = require("./routes/delete")
const airouter = require('./routes/gemini');

const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

app.set('trust proxy', 1);

app.use(cors({
  origin: clientOrigin,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Hardcode backend is running' });
});

app.use('/user', authrouter)
app.use('/problem',problemroutes)
app.use('/solution',submitroutes)
app.use('/profile',deleteroutes)
app.use('/ai',airouter)

main()
.then(async ()=>{
    const port = process.env.PORT || 3000;
    app.listen(port, ()=>{
        console.log("Server listening at port number: "+ port);
    })
})
.catch(err=> console.log("Error Occurred: "+err));
