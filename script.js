const accountValueInput = document.getElementById('accountValue')
const goalSlider = document.getElementById('goalSlider')
const dateSlider = document.getElementById('dateSlider')
const aspSlider = document.getElementById('aspSlider')
const goalValue = document.getElementById('goalValue')
const dateValue = document.getElementById('dateValue')
const aspValue = document.getElementById('aspValue')
const periodButtons = document.querySelectorAll('.period-buttons button')

let selectedPeriodMonths = 12 // Default to 1 year
let chart

function formatAccountValue(value) {
  return parseFloat(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function parseAccountValue(value) {
  return parseFloat(value.replace(/,/g, ''))
}

function updateAccountValueDisplay() {
  accountValueInput.value = formatAccountValue(
    parseAccountValue(accountValueInput.value)
  )
}

function parseAccountValue(value) {
  return parseFloat(value.replace(/[$,]/g, ''))
}

function updateAccountValueDisplay() {
  accountValueInput.value = formatAccountValue(
    parseAccountValue(accountValueInput.value)
  )
}

// Get today's date from the device calendar
const today = new Date()

function updateDateSliderRange() {
  let minDate, maxDate, defaultDate

  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)

  switch (selectedPeriodMonths) {
    case 1: // 1 Month
      minDate = tomorrow
      maxDate = new Date(
        today.getFullYear(),
        today.getMonth() + 2,
        today.getDate()
      )
      defaultDate = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        today.getDate()
      )
      break
    case 12: // 1 Year
      minDate = tomorrow
      maxDate = new Date(
        today.getFullYear() + 2,
        today.getMonth(),
        today.getDate()
      )
      defaultDate = new Date(
        today.getFullYear() + 1,
        today.getMonth(),
        today.getDate()
      )
      break
    case 36: // 3 Years
      minDate = tomorrow
      maxDate = new Date(
        today.getFullYear() + 6,
        today.getMonth(),
        today.getDate()
      )
      defaultDate = new Date(
        today.getFullYear() + 3,
        today.getMonth(),
        today.getDate()
      )
      break
    case 60: // 5 Years
      minDate = tomorrow
      maxDate = new Date(
        today.getFullYear() + 10,
        today.getMonth(),
        today.getDate()
      )
      defaultDate = new Date(
        today.getFullYear() + 5,
        today.getMonth(),
        today.getDate()
      )
      break
    case 120: // 10 Years
      minDate = tomorrow
      maxDate = new Date(
        today.getFullYear() + 20,
        today.getMonth(),
        today.getDate()
      )
      defaultDate = new Date(
        today.getFullYear() + 10,
        today.getMonth(),
        today.getDate()
      )
      break
  }

  dateSlider.min = 0
  dateSlider.max = 100
  dateSlider.dataset.minDate = minDate.getTime()
  dateSlider.dataset.maxDate = maxDate.getTime()
  dateSlider.dataset.defaultDate = defaultDate.getTime()

  // Set the slider to the default date for the selected period
  setSliderToDate(defaultDate)

  updateDate()
  updateChartLabels()
  updateChart()
}

function updateGoalSliderRange() {
  const accountValue = parseAccountValue(accountValueInput.value)
  goalSlider.min = accountValue

  // If the current goal is less than the new minimum, update it
  if (parseFloat(goalSlider.value) < accountValue) {
    goalSlider.value = accountValue
    updateGoal()
  }

  // Update the slider color to reflect the new range
  updateSliderColor(goalSlider)
}

function setSliderToDate(targetDate) {
  const minDate = new Date(parseInt(dateSlider.dataset.minDate))
  const maxDate = new Date(parseInt(dateSlider.dataset.maxDate))
  const totalRange = maxDate.getTime() - minDate.getTime()
  const targetValue =
    ((targetDate.getTime() - minDate.getTime()) / totalRange) * 100
  dateSlider.value = Math.min(Math.max(targetValue, 0), 100)
}

function updateDate() {
  const sliderValue = parseInt(dateSlider.value)
  const minDate = new Date(parseInt(dateSlider.dataset.minDate))
  const maxDate = new Date(parseInt(dateSlider.dataset.maxDate))
  const totalRange = maxDate.getTime() - minDate.getTime()
  const targetDate = new Date(
    minDate.getTime() + totalRange * (sliderValue / 100)
  )

  dateValue.textContent = formatDate(targetDate)
  updateSliderColor(dateSlider)
  updateASP()
}

function updateASP() {
  const accountValue = parseAccountValue(accountValueInput.value)
  const goal = parseFloat(goalSlider.value)
  const targetDate = new Date(
    parseInt(dateSlider.dataset.minDate) +
      (parseInt(dateSlider.dataset.maxDate) -
        parseInt(dateSlider.dataset.minDate)) *
        (dateSlider.value / 100)
  )
  const months =
    (targetDate.getFullYear() - today.getFullYear()) * 12 +
    targetDate.getMonth() -
    today.getMonth()
  const weeklyContribution = (goal - accountValue) / (months * 4)
  aspSlider.value = Math.max(Math.round(weeklyContribution), 1)
  aspValue.textContent = `${formatCurrency(
    Math.max(Math.round(weeklyContribution), 1)
  )} / week`
  updateSliderColor(aspSlider)
}

function updateDateFromASP() {
  const accountValue = parseFloat(accountValueInput.value)
  const goal = parseFloat(goalSlider.value)
  const weeklyContribution = parseFloat(aspSlider.value)
  const weeksToGoal = (goal - accountValue) / weeklyContribution
  const monthsToGoal = Math.ceil(weeksToGoal / 4)
  const targetDate = new Date(today.getTime())
  targetDate.setMonth(targetDate.getMonth() + monthsToGoal)

  setSliderToDate(targetDate)
  updateDate()
}

function formatDate(date) {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

function formatCurrency(value) {
  return '$' + value.toLocaleString()
}

function formatShortCurrency(value) {
  if (value >= 1000000) {
    return '$' + (value / 1000000).toFixed(value % 1000000 ? 1 : 0) + 'M'
  } else if (value >= 1000) {
    return '$' + (value / 1000).toFixed(value % 1000 ? 1 : 0) + 'K'
  } else {
    return '$' + value.toFixed(0)
  }
}

function updateGoal() {
  const accountValue = parseAccountValue(accountValueInput.value)
  const goal = Math.max(parseFloat(goalSlider.value), accountValue)
  goalSlider.value = goal
  goalValue.textContent = formatCurrency(goal)
  updateSliderColor(goalSlider)
  updateASP()
  updateChart()
}

function updateSliderColor(slider) {
  const range = slider.max - slider.min
  const position = ((slider.value - slider.min) / range) * 100
  let color
  switch (slider.id) {
    case 'goalSlider':
      color = '#ff7f00'
      break
    case 'dateSlider':
      color = '#007bff'
      break
    case 'aspSlider':
      color = '#28a745'
      break
  }
  slider.style.background = `linear-gradient(to right, ${color} 0%, ${color} ${position}%, #e0e0e0 ${position}%, #e0e0e0 100%)`
}

//////////////////
///////////// chart

function initChart() {
  const ctx = document.getElementById('savingsChart').getContext('2d')
  const accountValue = parseAccountValue(accountValueInput.value)
  const goalAmount = parseFloat(goalSlider.value)

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: Array(16).fill(''),
      datasets: [
        {
          data: Array(16).fill(null),
          backgroundColor: 'rgba(255, 127, 0, 0.2)',
          borderColor: '#ff7f00',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return formatShortCurrency(context.parsed.y)
            },
          },
        },
        title: {
          display: false, // This will hide the title
        },
      },
      scales: {
        y: {
          beginAtZero: false,
          position: 'right',
          ticks: {
            callback: function (value) {
              return formatShortCurrency(value)
            },
            font: {
              size: 10,
            },
            padding: 4,
          },
          grid: {
            drawBorder: false,
            drawTicks: false,
          },
          border: {
            display: false,
          },
        },
        x: {
          display: true,
          ticks: {
            display: false,
          },
          grid: {
            display: true,
            drawBorder: false,
            drawTicks: false,
          },
          border: {
            display: false,
          },
        },
      },
    },
    plugins: [
      {
        id: 'chartAreaBorder',
        beforeDraw(chart, args, options) {
          const {
            ctx,
            chartArea: { left, top, width, height },
          } = chart
          ctx.save()
          ctx.strokeStyle = '#FFFFFF' // border color
          ctx.lineWidth = 1
          ctx.strokeRect(left, top, width, height)
          ctx.restore()
        },
      },
      {
        id: 'yearLineLabel',
        afterDraw(chart, args, options) {
          const { ctx, chartArea, scales } = chart
          const { top, bottom, left, right } = chartArea
          const yearIndex = 12 // Index for 1 year (0-based)
          const x = scales.x.getPixelForValue(yearIndex)

          // Find the y-value of the orange line at the year mark
          const dataset = chart.data.datasets[0]
          const yearValue = dataset.data[yearIndex]
          const y = scales.y.getPixelForValue(yearValue)

          // Draw the circle
          ctx.beginPath()
          ctx.arc(x, y, 5, 0, 2 * Math.PI)
          ctx.fillStyle = 'white'
          ctx.fill()
          ctx.strokeStyle = '#ff7f00'
          ctx.lineWidth = 3
          ctx.stroke()

          // Prepare the label text
          // const labelText = formatShortCurrency(yearValue)
          const labelText = formatCurrency(yearValue) // Use formatCurrency instead of formatShortCurrency
          ctx.font = '12px Arial'
          const textMetrics = ctx.measureText(labelText)
          const textWidth = textMetrics.width
          const textHeight = 12 // Approximate height of the text

          // Draw the blue background
          ctx.fillStyle = '#ff7f00' // Orange color
          const padding = 6 // Increased padding for more space
          const cornerRadius = 4 // 4px round corners

          // Calculate rectangle dimensions
          const rectWidth = textWidth + padding * 2
          const rectHeight = textHeight + padding * 2
          const rectX = x - rectWidth / 2
          // const rectY = y - textHeight - padding * 2 - 14 // Moved up slightly
          const rectY = y - textHeight - padding * 2 - 4 // Moved down 10px (changed from -14 to -4)

          // Draw rounded rectangle
          ctx.beginPath()
          ctx.moveTo(rectX + cornerRadius, rectY)
          ctx.lineTo(rectX + rectWidth - cornerRadius, rectY)
          ctx.quadraticCurveTo(
            rectX + rectWidth,
            rectY,
            rectX + rectWidth,
            rectY + cornerRadius
          )
          ctx.lineTo(rectX + rectWidth, rectY + rectHeight - cornerRadius)
          ctx.quadraticCurveTo(
            rectX + rectWidth,
            rectY + rectHeight,
            rectX + rectWidth - cornerRadius,
            rectY + rectHeight
          )
          ctx.lineTo(rectX + cornerRadius, rectY + rectHeight)
          ctx.quadraticCurveTo(
            rectX,
            rectY + rectHeight,
            rectX,
            rectY + rectHeight - cornerRadius
          )
          ctx.lineTo(rectX, rectY + cornerRadius)
          ctx.quadraticCurveTo(rectX, rectY, rectX + cornerRadius, rectY)
          ctx.closePath()

          ctx.fill()

          // Draw the label
          ctx.fillStyle = '#FFFFFF' // White text color, or choose a color that contrasts well with orange
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(labelText, x, rectY + rectHeight / 2)

          ctx.restore()
        },
      },
    ],
  })

  updateChartLabels()
}
/////////////
Chart.register({
  id: 'yearLine',
  afterDraw: (chart, args, options) => {
    if (!options.enabled) return

    const { ctx, chartArea, scales } = chart
    const { top, bottom } = chartArea
    const yearIndex = 12 // Index for 1 year (0-based)
    const x = scales.x.getPixelForValue(yearIndex)

    // Draw the vertical line
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(x, top)
    ctx.lineTo(x, bottom)
    ctx.lineWidth = options.width || 2
    ctx.strokeStyle = options.color || '#007bff'
    ctx.setLineDash([2, 5]) // This creates a dashed line with dashes and gaps of 5px each
    ctx.stroke()
    ctx.restore()
  },
})

const leftLabel = document.getElementById('leftLabel')
const middleLabel = document.getElementById('middleLabel')
const rightLabel = document.getElementById('rightLabel')

function updateChartLabels() {
  const accountValue = parseAccountValue(accountValueInput.value)
  const goalAmount = parseFloat(goalSlider.value)

  if (selectedPeriodMonths === 12) {
    leftLabel.textContent = 'Today'
    middleLabel.textContent = '6M'
    rightLabel.textContent = '1Y'

    const dataPoints = Array(15)
      .fill(null)
      .map(
        (_, index) => accountValue + (goalAmount - accountValue) * (index / 12)
      )

    chart.data.labels = Array(15).fill('')
    chart.data.datasets[0].data = dataPoints
    chart.options.plugins.yearLine.enabled = true
  } else {
    const midPoint = new Date(
      today.getTime() + (selectedPeriodMonths * 30.44 * 24 * 60 * 60 * 1000) / 2
    )

    leftLabel.textContent = 'Today'
    middleLabel.textContent = formatDate(midPoint)
    rightLabel.textContent = `${selectedPeriodMonths} ${
      selectedPeriodMonths === 1 ? 'Month' : 'Years'
    }`

    chart.data.labels = ['', '', '']
    chart.data.datasets[0].data = [
      accountValue,
      (accountValue + goalAmount) / 2,
      goalAmount,
    ]

    chart.options.plugins.yearLine.enabled = false
  }

  chart.options.scales.x.ticks.display = false
  chart.options.scales.y.ticks.display = false

  chart.update()
}

/////////////////// end chart
////////////////////////////

function updateChart() {
  const accountValue = parseAccountValue(accountValueInput.value)
  const goalAmount = parseFloat(goalSlider.value)

  if (selectedPeriodMonths === 12) {
    const dataPoints = Array(15)
      .fill(null)
      .map(
        (_, index) => accountValue + (goalAmount - accountValue) * (index / 12)
      )

    chart.data.datasets[0].data = dataPoints
  } else {
    chart.data.datasets[0].data = [accountValue, goalAmount]
  }

  chart.options.scales.y.min = accountValue
  chart.options.scales.y.max = goalAmount * 1.2

  updateChartLabels()
}

function initializeSliders() {
  updateGoalSliderRange()
  updateDateSliderRange()
  updateGoal()
  updateASP()
  updateSliderColor(goalSlider)
  updateSliderColor(dateSlider)
  updateSliderColor(aspSlider)
}

// Event Listeners
goalSlider.addEventListener('input', updateGoal)

dateSlider.addEventListener('input', updateDate)

aspSlider.addEventListener('input', () => {
  updateDateFromASP()
  updateSliderColor(aspSlider)
})

periodButtons.forEach((button) => {
  button.addEventListener('click', () => {
    periodButtons.forEach((btn) => btn.classList.remove('selected'))
    button.classList.add('selected')
    selectedPeriodMonths = parseInt(button.dataset.months)
    updateDateSliderRange()
    updateChartLabels() // Add this line
  })
})

accountValueInput.addEventListener('input', (event) => {
  // Remove non-numeric characters except comma and dot
  event.target.value = event.target.value.replace(/[^\d.,]/g, '')

  updateGoalSliderRange()
  updateChart()
  updateASP()
  updateSliderColor(goalSlider)
  updateSliderColor(dateSlider)
  updateSliderColor(aspSlider)
})

accountValueInput.addEventListener('blur', () => {
  updateAccountValueDisplay()
  updateGoalSliderRange()
})

accountValueInput.addEventListener('blur', () => {
  updateAccountValueDisplay()
  updateGoalSliderRange()
  updateChart()
  updateASP()
})

//adjust Account value window width
// function adjustInputWidth() {
//   const input = document.getElementById('accountValue')
//   const valueLength = input.value.length
//   const maxLength = 15 // Adjust based on maximum expected length
//   const baseWidth = 20 // Minimum width
//   const extraWidth = 10 // Additional width per character

//   // Calculate the new width
//   const newWidth = Math.min(
//     baseWidth + valueLength * extraWidth,
//     window.innerWidth - 40
//   ) // 40px margin
//   input.style.width = newWidth + 'px'
// }

// // Call formatAccountValue on input change and on load
// document
//   .getElementById('accountValue')
//   .addEventListener('input', formatAccountValue)
// window.addEventListener('load', formatAccountValue)

// Initialization
initChart()
initializeSliders()
updateAccountValueDisplay()
