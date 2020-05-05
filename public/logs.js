let logs = []
let selectedLabels = []

const filterByRange = (el, range) => {
  requestLogs(range)
  const btns = document.getElementById('range').children
  for (let index = 0; index < btns.length; index++) {
    const btn = btns[index];
    if (btn.classList && btn.classList.contains('selected')) {
      btn.classList.remove('selected')
      break
    }
  }
  el.classList.add('selected')
}

const filterByLabel = (el) => {
  const index = selectedLabels.indexOf(el.title)
  if (index > -1) {
    selectedLabels.splice(index, 1)
    el.classList.remove('selected')
  } else {
    selectedLabels.push(el.title)
    el.classList.add('selected')
  }
  applyLabels()
}

const applyLabels = () => {
  let filteredLogs = logs
  for (let index = 0; index < selectedLabels.length; index++) {
    const label = selectedLabels[index]
    if (label === 'null') {
      filteredLogs = logs.filter(log => !log.labels)
    } else {
      filteredLogs = logs.filter(log => log.labels && log.labels.includes(label))
    }
  }
  renderLogs(filteredLogs)
}

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
      applyLabels()
    } else {
      alert('There was a problem with the request.');
    }
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
  console.log(date)
  return `${date.toLocaleDateString([],{ day: 'numeric', month: 'short' })} ${time}`
}

const renderLogs = (logs) => {
  let html = `
    <tr>
      <th>Description</th>
      <th>Duration</th>
      <th>Started At</th>
      <th>Labels</th>
    </tr>`
  logs.forEach(log => {
    if (log.duration) {
      const totalMinutes = Math.floor(log.duration / 60000)
      const hours = Math.floor(totalMinutes / 60)
      const minutes = hours > 0 ? totalMinutes - (hours * 60) : totalMinutes
      let labelIcons = ''
      if (log.labels) {
        const labels = log.labels.split(',')
        labels.forEach(label => {
          labelIcons += `<div class="label">${labelIcon(label)}</div>`
        })
      } else {
        labelIcons += `<div class="label">🏷️</div>`
      }
      html += `
        <tr>
          <td>${log.description}</td>
          <td>
            ${hours > 0 ? hours + 'hs ' : ' '}
            ${minutes} mins
          </td>
          <td>${formatDate(log.startTime)}</td>
          <td><div class="tags">${labelIcons}</div></td>
        </tr>`
    }
  })
  document.getElementsByTagName('table')[0].innerHTML = html
}

const labelIcon = (label) => {
  switch (label) {
    case 'transition': return '🔄'
    case 'thinking': return '💡'
    case 'organization': return '📋'
    case 'management': return '💼'
    case 'dev': return '👨‍💻'
    case 'communication': return '💬'
    case 'learn': return '🧠'
    case 'sleep': return '🛌'
    case 'exercise': return '🏃‍♂'
    case 'body care': return '🚿'
    case 'food': return '🍕'
    case 'love': return '❤️'
    case 'social': return '🧑‍🤝‍🧑'
    case 'home': return '🏠'
    case 'finance': return '💰'
    case 'grosseries': return '🛒'
    case 'tv': return '📺'
    case 'play': return '🕹️'
    case 'news': return '📰'
    case 'read': return '📘'
    case 'write': return '✏️'
  }
}

requestLogs()