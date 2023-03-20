let img
let available = new Set()
let processing = false
let x = 0
let y = 0

function preload() {
  img = loadImage("hp-1.jpeg")
}

function setup() {
  pixelDensity(1)
  createCanvas(260, 395)
  colorMode(RGB)
  img.resize(width, height)
  img.loadPixels()
  img.updatePixels()
  shufflePixels(img.pixels)
  loadPixels()
  available.add(`${Math.floor(width/2)},${Math.floor(height/2)}`)
  console.log("setup done!")
  noStroke()
}

function draw() {
  if (!processing) {
    processing = true
    processPixels()
  }
}

function shufflePixels(pixels) {
  for (let i = 0; i < pixels.length; i += 4) {
    let randomIndex = Math.floor(Math.random() * (pixels.length / 4)) * 4
    for (let j = 0; j < 4; j++) {
      let temp = pixels[i + j]
      pixels[i + j] = pixels[randomIndex + j]
      pixels[randomIndex + j] = temp
    }
  }
}
function processPixels() {
  let startTime = performance.now()

  while (performance.now() - startTime < 50 && available.size > 0) {
      processOnePixel()
  }

  updatePixels()

  processing = false

  if (available.size <= 0) {
    noLoop()
  }
}

function processOnePixel() {
  let bestFitness = Number.MAX_VALUE
  let bestX
  let bestY
  let bestLocation

  let pixelLocation = (y * width + x) * 4

  if (available.size == 1) {
    bestFitness = 1
    bestX = Math.floor(width/2)
    bestY = Math.floor(height/2)
    bestLocation = pixelLocation
  } else {
    for (const cPixel of available) {
      let [cx, cy] = cPixel.split(',').map(Number)
      let fitness = calculateFitness(cx, cy, pixelLocation)
      if (fitness < bestFitness) {
        bestFitness = fitness
        bestX = cx
        bestY = cy
        bestLocation = pixelLocation
      }
    }
  }

  if (bestFitness < Number.MAX_VALUE) {
    let pixelIndex = (bestY * width + bestX) * 4
    pixels[pixelIndex] = img.pixels[bestLocation]
    pixels[pixelIndex + 1] = img.pixels[bestLocation+1]
    pixels[pixelIndex + 2] = img.pixels[bestLocation+2]
    pixels[pixelIndex + 3] = img.pixels[bestLocation+3]
    available.delete(`${bestX},${bestY}`)
    addNeighboringPixels(bestX, bestY)
  }

  x++
  if (x >= width) {
    x = 0
    y++
  }
}

function addNeighboringPixels(x, y){
  let neighbors = getNeighbors(x, y)
  for (let neighbor of neighbors){
    let nx = neighbor[0]
    let ny = neighbor[1]
    let nLocation = (ny * width + nx) * 4;
    if (pixels[nLocation + 3] == 0){
      available.add(`${nx},${ny}`)
    }
  }
}

function calculateFitness(x, y, pixelLocation){
  let neighbors = getNeighbors(x, y)
  let bestPixFitness = Number.MAX_VALUE
  let filledNeighborBonus = 0
  let count = 0

  for (let i=0; i<neighbors.length; i++){
    let nx = neighbors[i][0]
    let ny = neighbors[i][1]
    let nLocation = (ny * width + nx) * 4
    if (pixels[nLocation + 3] != 0){
      let nFitness = dist(pixels[nLocation], pixels[nLocation+1], pixels[nLocation+2], img.pixels[pixelLocation], img.pixels[pixelLocation+1], img.pixels[pixelLocation+2])
      if (nFitness < bestPixFitness){
        bestPixFitness = nFitness
      }
      filledNeighborBonus += 50
      count++
    }
  }
  return count > 0 ? bestPixFitness-filledNeighborBonus : Number.MAX_VALUE
}

function getNeighbors(x, y){
  let neighbors = []
  for (let i = x-1; i <= x+1; i++){
    for (let j = y-1; j <= y+1; j++){
      if (!(i==x && j==y) && (i >= 0 && i < width) && (j >= 0 && j < height)){
        neighbors.push([i, j])
      }
    }
  }
  return neighbors
}
