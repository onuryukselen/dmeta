const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

// const DB = process.env.DATABASE.replace(
//   '<PASSWORD>',
//   process.env.DATABASE_PASSWORD
// );

mongoose
  .connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('DB Connections Successful');
  });

process.on('uncaughtException', err => {
  console.log(err);
  console.log(err.name, ':', err.message);
  console.log('UNCAUGHT EXCEPTION CLOSING THE APP!');

  process.exit(1);
});

const app = require('./app');

//console.log(process.env);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', err => {
  console.log(err);
  console.log(err.name, ':', err.message);
  console.log('UNHANDLED REJECTION CLOSING THE APP!');
  server.close(() => {
    process.exit(1);
  });
});
