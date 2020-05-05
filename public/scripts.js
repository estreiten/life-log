let labels = []

const toggleLabel = (el) => {
  const label = el.title
  const index = labels.indexOf(label)
  if (index > -1) {
    labels.splice(index, 1)
    el.classList.remove('selected')
  } else {
    labels.push(label)
    el.classList.add('selected')
  }
  document.getElementById("labels").value = labels.toString()
}