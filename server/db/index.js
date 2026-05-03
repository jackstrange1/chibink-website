const mongoose = require('mongoose');
const chalk = require('chalk');

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log(chalk.yellow('DB CONNECTED'));
  })
  .catch(e => {
    console.log(chalk.red(e));
  });

module.exports = mongoose;
