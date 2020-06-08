let logs = []
let days = []
let dailyLogs = []

const requestLogs = (range) => {
  httpRequest = new XMLHttpRequest()
  httpRequest.onreadystatechange = getLogs
  httpRequest.open('GET', `logs?${range ? 'range=' + range : ''}`)
  httpRequest.send()
}

const getLogs = () => {
  if (httpRequest.readyState === XMLHttpRequest.DONE) {
    if (httpRequest.status === 200) {
      logs = JSON.parse(httpRequest.responseText)
      loadLogs()
    } else {
      alert('There was a problem with the request.');
    }
  }
}

const labelIcon = (label) => {
  switch (label) {
    case 'transition':
      return '🔄'
    case 'thinking':
      return '💡'
    case 'organization':
      return '📋'
    case 'management':
      return '💼'
    case 'dev':
      return '👨‍💻'
    case 'communication':
      return '💬'
    case 'learn':
      return '🧠'
    case 'sleep':
      return '🛌'
    case 'exercise':
      return '🏃‍♂'
    case 'care':
      return '🚿'
    case 'food':
      return '🍕'
    case 'love':
      return '❤️'
    case 'social':
      return '🧑‍🤝‍🧑'
    case 'home':
      return '🏠'
    case 'finance':
      return '💰'
    case 'grosseries':
      return '🛒'
    case 'tv':
      return '📺'
    case 'podcast':
      return '📻'
    case 'play':
      return '🕹️'
    case 'news':
      return '📰'
    case 'read':
      return '📘'
    case 'write':
      return '✏️'
    case 'nil':
      return '🏷️'
  }
}

const convertTime = (miliseconds) => {
  const totalMinutes = Math.floor(miliseconds / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = hours > 0 ? totalMinutes - (hours * 60) : totalMinutes
  return `${hours}:${minutes < 10 ? '0' + minutes : minutes}`
}

function init() {
  initDays()
  initWeeks()
  document.getElementsByClassName('overlay')[0].onclick = deselect
}

function initDays () {
  days = document.getElementsByClassName('day');
  for (let i = 0; i < days.length; i++) {
    const day = days[i];
    const logs = dailyLogs[i]; // [{name, time}, .., {name, time}]
    logs.sort((a, b) => b.time - a.time)
    day.innerHTML += drawTags(logs)
    $(day).click(dayClicked)
  }
}

function drawTags(logs) {
  let html = '<div class="tags">';
  for (let index = 0; index < logs.length; index++) {
    const log = logs[index];
    html += `
        <span class="tag ${index > 2 ? 'secondary' : ''}" ms="${log.time}">
          ${labelIcon(log.name)}
          ${convertTime(log.time)}
        </span>`;
  }
  html += '</div>'
  return html
}

function initWeeks () {
  const firstDays = [1,4,11,18,25,32]
  weeks = document.getElementsByClassName('week');
  for (let i = 0; i < weeks.length; i++) {
    const week = weeks[i];
    const logs = weekLogs(firstDays[i]-1, firstDays[i+1]-1)
    week.innerHTML += drawTags(logs)
    $(week).click(dayClicked)
  }
}

function weekLogs(first, last) {
  let logs = dailyLogs[first]
  for (let index = first+1; index < last; index++) {
    const newLogs = dailyLogs[index]
    for (let index = 0; index < newLogs.length; index++) {
      const newLog = newLogs[index];
      const logIndex = logs.findIndex(log => log.name === newLog.name)
      if (logIndex > -1) {
        logs[logIndex].time += newLog.time
      } else {
        logs.push(newLog)
      }
    }
  }
  return logs
}

function deselect() {
  // hide overlay
  $('.overlay').css('display', 'none');
  $('.detail').remove();
}

function dayClicked(evt) {
  deselect();
  // mask background
  $('.overlay').css('display', 'initial');
  const dayEl = evt.currentTarget;
  // create detail to show on top
  const detail = $(dayEl).clone();
  const isWeek = detail.hasClass('week')
  if (isWeek) {
    detail.find('>.tag').prepend('Week ')
  }
  detail.removeClass('day');
  detail.removeClass('week');
  detail.addClass('detail');
  $('body').append(detail);
  // draw bars on detail
  drawBars(detail, isWeek);
}

function drawBars(el, small) {
  $(el).find('.tags').find('.tag').each(function (index) {
    $(this).wrap('<div class="bar-container">')
    const bar = $('<div class="bar"></div>')
    bar.insertBefore(this)
    const color = '#' + (Math.random() * 0xFFFFFF << 0).toString(16);
    bar.css('backgroundColor', color);
    const count = $(this).attr('ms');
    let reducer = 60000
    if (small) {
      reducer *= 60
    }
    bar.height(count / reducer);
    // $(this).css('backgroundColor', color);
  })
}

/*
* Structure:
* [
*   [ //day 1
*     { 
*       name: label1,
*       time: totalTime1
*     },
*     ..,
*     {
*        name: labelN,
*        time: totalTimeN
*     }
*   ],
*   ..,
*   [ //day 31
*     { 
*       name: label1,
*       time: totalTime1
*     },
*     ..,
*     {
*        name: labelN,
*        time: totalTimeN
*     }
*   ],
* ]
*/
function loadLogs () {
  for (let day = 1; day <= 31; day++) {
    const dayLogs = logs.filter(log => {
      return new Date(log.startTime).getDate() === day
    })
    let currentLogs = []
    dayLogs.forEach(log => {
      const labels = log.labels && log.labels.length > 0 ? log.labels.split(',') : ['nil']
      labels.forEach(label => {
      const logIndex = currentLogs.findIndex(log => log.name === label)
        if (logIndex > -1) {
          currentLogs[logIndex].time += log.duration
        } else {
          currentLogs.push({
            name: label,
            time: log.duration
          })
        }
      })
    })
    dailyLogs[day-1] = currentLogs
  }
  console.log(dailyLogs)
  init()
}

requestLogs('all');