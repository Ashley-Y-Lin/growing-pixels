let img;
let available = []; // set of pixels on canvas that can be filled
let processing = false;
let x = 0;
let y = 0;

function preload() {
  img = loadImage("https://as1.ftcdn.net/v2/jpg/02/35/08/90/1000_F_235089049_1vbv6tn8pWC3y2nmKIywIR6W7S3oBqP2.jpg");
}

function setup() {
  pixelDensity(1);
  createCanvas(400, 400);
  colorMode(RGB);
  img.resize(width, height);
  img.loadPixels();
  loadPixels();
  available.push([0, 0]);
  console.log("setup done!");
  noStroke()
}

function draw() {
  if (!processing) {
    processing = true;
    processPixels();
  }
}

function processPixels() {
  let startTime = performance.now();

  while (performance.now() - startTime < 50 && available.length > 0) {
    for (let i = 0; i < 100 && available.length > 0; i++) {
      processOnePixel();
    }
  }

  updatePixels();

  processing = false;

  if (available.length <= 0) {
    noLoop();
  }
}

function processOnePixel() {
  let bestFitness = Number.MAX_VALUE;
  let bestX;
  let bestY;
  let bestColor;
  let bestIndex;

  let pixelLocation = (y * width + x) * 4;
  let pixelColor = color(img.pixels[pixelLocation], img.pixels[pixelLocation+1], img.pixels[pixelLocation+2], img.pixels[pixelLocation+3]);

  if (available.length == 1) {
    bestFitness = 1;
    bestX = available[0][0];
    bestY = available[0][1];
    bestColor = pixelColor;
    bestIndex = 0;
  } else {
    for (let i = 0; i < available.length; i++) {
      let fitness = calculateFitness(available[i][0], available[i][1], pixelColor);
      if (fitness < bestFitness) {
        bestFitness = fitness;
        bestX = available[i][0];
        bestY = available[i][1];
        bestColor = pixelColor;
        bestIndex = i;
      }
    }
  }

  if (bestFitness < Number.MAX_VALUE) {
    let pixelIndex = (bestY * width + bestX) * 4;
    pixels[pixelIndex] = red(bestColor);
    pixels[pixelIndex + 1] = green(bestColor);
    pixels[pixelIndex + 2] = blue(bestColor);
    pixels[pixelIndex + 3] = alpha(bestColor);
    available[bestIndex] = available[available.length - 1];
    available.pop();
    addNeighboringPixels(bestX, bestY);
  }

  x++;
  if (x >= width) {
    x = 0;
    y++;
  }
}

function addNeighboringPixels(x, y){
  let neighbors = getNeighbors(x, y)
  for (let neighbor of neighbors){
    let nx = neighbor[0]
    let ny = neighbor[1]
    let nLocation = (ny * width + nx) * 4
    if (pixels[nLocation + 3] == 0){
      available.push([nx, ny])
    }
  }
}

function calculateFitness(x, y, pixelColor){
  let neighbors = getNeighbors(x, y)
  // console.log(neighbors)
  let totalFitness = 0
  let count = 0

  for (let i=0; i<neighbors.length; i++){
    let nx = neighbors[i][0]
    let ny = neighbors[i][1]
    let nLocation = (ny * width + nx) * 4
    // console.log(nLocation)
    if (pixels[nLocation + 3] != 0){
      // console.log("this runs!")
      let neighborColor = color(pixels[nLocation], pixels[nLocation+1], pixels[nLocation+2], pixels[nLocation+3])
      let nFitness = dist(red(neighborColor), green(neighborColor), blue(neighborColor), red(pixelColor), green(pixelColor), blue(pixelColor))
      //console.log(nFitness)
      totalFitness += nFitness
      count++
    }
  }
  // console.log(totalFitness/count) -- figure out why this is giving NaN -- maybe the dist function isn't working?
  return count > 0 ? totalFitness / count : Number.MAX_VALUE
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
