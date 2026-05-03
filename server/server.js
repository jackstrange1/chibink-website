const express = require('express');
const chalk = require('chalk');
const cors = require('cors');

const db = require('./db');
const routes = require('./routes');

const app = express();

app.use(express.json());
app.use(cors());
app.use(routes);

app.listen(3000, () => {
  console.log(chalk.yellow('App is running @3000'));
});
