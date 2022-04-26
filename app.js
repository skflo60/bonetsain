const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const routes = require('./api');
const mongoose = require('./config/mongoose');
const model = require('./app.model');
const cron = require('node-cron');
const compression = require('compression');
const syncDriveFermier = require('./api/sync-drive-fermier');
const syncDriveFermierPanier = require('./api/sync-drive-fermier-panier');
const syncNewDriveFermier = require('./api/sync-new-drive-fermier');
// Compress all HTTP responses
app.use(compression());
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));
app.use(cors());
// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

model.initialize();
mongoose.connect();
app.use('/static', express.static('./static'));

app.use(routes);

cron.schedule('30 2 * * *', () => {
  syncNewDriveFermier()
});
// syncNewDriveFermier()

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

module.exports = app;
