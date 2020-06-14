const express = require('express');
const mongoose = require('mongoose');
const config = require('./config')
const app = express();

app.use(express.static('public'))
app.use(express.json({ extended: true }))
app.use(express.urlencoded({ extended: true }))

mongoose.connect(`mongodb://${config.connectionString}`, (err) => {
  if (err) throw err;
  console.log('Mongoose connected!');
});
const Log = mongoose.model('Log', {
  description: String,
  startTime: Date,
  duration: Number,
  labels: String
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

app.post('/new', async (req, res) => {
  try {
    const lastLog = await Log.findOne({duration: null})
    if (lastLog) {
      await Log.updateOne({duration: null}, {duration: Date.now() - lastLog.startTime})
    }
    const log = new Log({
      description: req.body.description,
      startTime: Date.now(),
      duration: null,
      labels: req.body.labels
    });
    await log.save();
    res.sendFile(__dirname + '/submitted.html')
  } catch (err) {
    res.send(err.message).status(500);
  }
})

app.post('/stop', async (req, res) => {
  try {
    const lastLog = await Log.findOne({duration: null})
    if (lastLog) {
      if (req.body.hours || req.body.minutes) {
        const minutes = ((req.body.hours || 0) * 60) + +(req.body.minutes || 0)  // bug aca
        await Log.updateOne({duration: null}, {duration: minutes * 60000})
      } else if (req.body.date && req.body.time) {
        const date = new Date(req.body.date ? req.body.date + ' ' + req.body.time : req.body.time)
        await Log.updateOne({duration: null}, {duration: date - lastLog.startTime})
      } else {
        await Log.updateOne({duration: null}, {duration: Date.now() - lastLog.startTime})
      }
      res.sendFile(__dirname + '/closed.html')
    } else {
      res.sendFile(__dirname + '/noaction.html')
    }
  } catch (err) {
    res.send(err.message).status(500);
  }
})

app.get('/summary', async (req, res) => {
  try {
    res.sendFile(__dirname + '/summary.html')
  } catch (err) {
    res.send(err.message).status(500);
  }
})

app.get('/analysis', async (req, res) => {
  try {
    res.sendFile(__dirname + '/analysis.html')
  } catch (err) {
    res.send(err.message).status(500);
  }
})

app.get('/logs', async (req, res) => {
  let logs = await Log.find({})
  try {
    let logs = await Log.find({})
    let date = new Date()
    date.setHours(0, 0, 0, 0)
    switch (req.query.range) {
      case 'week':
        date.setDate(date.getDate() - date.getDay());
        break
      case 'month':
        const monthNumber = date.getMonth() + 1
        date = new Date(`${date.getFullYear()}-${monthNumber < 10 ? '0' + monthNumber : monthNumber}-01T00:00:00`)
        break
    }
    if (!req.query.range || req.query.range !== 'all')
      logs = logs.filter(log => log.startTime >= date)
    res.status(200).json(logs)
  } catch (err) {
    res.send(err.message).status(500)
  }
})

app.listen(config.port || 3000, () => {
  console.log(`listening on ${config.port || 3000}`)
})

process.on('SIGTERM', () => {
  console.info('SIGTERM signal received.');
  console.log('Closing http server.');
  server.close(() => {
    console.log('Http server closed.');
    // boolean means [force], see in mongoose doc
    mongoose.connection.close(false, () => {
      console.log('MongoDb connection closed.');
    });
  });
});