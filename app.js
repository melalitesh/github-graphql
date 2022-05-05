const express = require('express')
const bodyParser = require('body-parser');
const app = express();
require('dotenv').config();

//routes
app.use('/api/v1',require('./routes'));

//local http server port
const port = process.env.PORT || 3000;

//body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//start the server
app.listen(port,() => {
  console.info(`Server listening on ${port}`);  
});