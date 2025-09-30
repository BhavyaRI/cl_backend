require('dotenv').config();
const express = require('express');
const statsroutes = require('./src/routes/statsroutes');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors());

app.use('/api',statsroutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Backend server is running and listening on http://localhost:${PORT}`);
});

module.exports = app;