const express = require('express');
const chalk = require('chalk');
const cors = require('cors');
require('dotenv').config();

const db = require('./db');
const routes = require('./routes');

const app = express();

app.use(express.json());
app.use(cors());
app.use(routes);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(chalk.yellow(`App is running @${PORT}`));
});
