<<<<<<< HEAD
require('dotenv').config();
=======
const dotenv = require('dotenv');
>>>>>>> 911143ed954765d9b7d9a2b5e6d06fb734b91731
const express = require('express');
const statsroutes = require('./src/routes/statsroutes');
const cors = require('cors');
const app = express();
<<<<<<< HEAD
=======
dotenv.config({ path: "./config.env" });
>>>>>>> 911143ed954765d9b7d9a2b5e6d06fb734b91731

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors());

app.use('/api',statsroutes);

<<<<<<< HEAD
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Backend server is running and listening on http://localhost:${PORT}`);
});

=======
>>>>>>> 911143ed954765d9b7d9a2b5e6d06fb734b91731
module.exports = app;