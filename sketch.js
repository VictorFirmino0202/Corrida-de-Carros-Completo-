var canvas;
var backgroundImage;
var bgImg;
var database;
var form, player;
var playerCount;
var gameState;
var allPlayers;

var car1, car2, carImage1, carImage2, trackImage, track;
var cars = [];

var blastImg;
var obstacle1Image, obstacle2Image, coinImage, fuelImage, lifeImage; 
var fuels, coins, obstacles;

function preload() {
  backgroundImage = loadImage("./assets/planodefundo.png");
  carImage1 = loadImage("assets/car1.png");
  carImage2 = loadImage("assets/car2.png");
  trackImage = loadImage("assets/track.jpg");

  obstacle1Image = loadImage("assets/obstacle1.png");
  obstacle2Image = loadImage("assets/obstacle2.png");
  coinImage = loadImage("assets/goldCoin.png");
  fuelImage = loadImage("assets/fuel.png");
  lifeImage = loadImage("assets/life.png");
  blastImg = loadImage("assets/blast.png");
}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  database = firebase.database();
  game = new Game();
  game.getState();
  game.start();

}

function draw() {
  background(backgroundImage);

  if (playerCount === 2) {
    game.updateState(1)
  }

  if (gameState === 1) {
    game.play();
  } 
  if (gameState === 2) {
    game.showLeaderboard();
  }

}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
