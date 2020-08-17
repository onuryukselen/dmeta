const mongoose = require('mongoose');
const dotenv = require('dotenv');
const https = require('https');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: './config.env' });

const options = {
  key: fs.readFileSync(path.join(__dirname, process.env.CERTS_PRIVATE_KEY)),
  cert: fs.readFileSync(path.join(__dirname, process.env.CERTS_CERTIFICATE))
};

//This setting is so that certificates will work although they are all self signed
if (process.env.NODE_ENV === 'development') {
  https.globalAgent.options.rejectUnauthorized = false;
}

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

const app = require('./app');

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

// Create our HTTPS server.
const port = process.env.PORT || 3000;
const server = https.createServer(options, app);
server.listen(port, function() {
  console.log(`App running on port ${port}...`);
});
process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
process.on('SIGTERM', () => {
  console.log('SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated!');
  });
});
