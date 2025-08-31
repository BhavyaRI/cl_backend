const dotenv = require('dotenv');
const express = require('express');
const statsroutes = require('./src/routes/statsroutes');
const cors = require('cors');
const app = express();
dotenv.config({ path: "./config.env" });

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors());

app.use('/api',statsroutes);

module.exports = app;