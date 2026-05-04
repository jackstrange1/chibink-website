const express = require('express');
const chalk = require('chalk');
const cors = require('cors');
require('dotenv').config();

const mongoose = require('mongoose');
const routes = require('./routes');

const app = express();

app.use(express.json());
app.use(cors());
app.use('/api', routes);

const PORT = process.env.PORT || 3000;

// 🔥 CONNECT DB FIRST
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log(chalk.blue('DB CONNECTED'));

    app.listen(PORT, () => {
      console.log(chalk.yellow(`App is running @${PORT}`));
    });
  })
  .catch(err => {
    console.error('DB ERROR:', err);
  });
