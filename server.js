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
  duration: Number
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
      duration: null
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
    const logs = await Log.find({})
    let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <title>Life Logs</title>
      <link href="styles.css" rel="stylesheet" />
    </head>
    <body>
      <a href="/" style="display: initial; margin: 20px">👈</a>
      <table>
        <tr>
          <th>Description</th>
          <th>Duration</th>
          <th>Started At</th>
        </tr>`;
    logs.forEach( log => {
      if (log.duration) {
        const totalMinutes = Math.floor(log.duration / 60000)
        const hours = Math.floor(totalMinutes / 60)
        const minutes = hours > 0 ? totalMinutes - (hours * 60) : totalMinutes
        html += `
        <tr>
          <td>${log.description}</td>
          <td>
            ${hours > 0 ? hours + 'hs ' : ' '}
            ${minutes} mins
          </td>
          <td>${log.startTime}</td>
        </tr>
        `
      }
    })
    html += '</table></body></html>'
    res.send(html)
  } catch (err) {
    res.send(err.message).status(500);
  }
})

app.listen(3000, () => {
  console.log('listening on 3000')
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