class Game {
  constructor() {
    this.resetTitle = createElement("h2")
    this.resetButton = createButton("");

    this.leadboard = createElement("h2");
    this.leader1 = createElement("h2");
    this.leader2 = createElement("h2");
    this.colliding = false;
    this.playerMoving = false;
    this.explosing = false;
  }


  start() {
    form = new Form();
    form.display();

    player = new Player();
    playerCount = player.getCount();

    car1 = createSprite(width / 2 - 50, height - 100);
    car1.addImage(carImage1);
    car1.scale = 0.07;

    car2 = createSprite(width / 2 + 100, height - 100);
    car2.addImage(carImage2);
    car2.scale = 0.07;

    cars = [car1, car2];

    car1.addImage("blast", blastImg);
    car2.addImage("blast", blastImg);

    fuels = new Group();
    coins = new Group();
    obstacles = new Group();

    var obstaclesPositions = [
      { x: width / 2 + 250, y: height - 800, image: obstacle2Image },
      { x: width / 2 - 150, y: height - 1300, image: obstacle1Image },
      { x: width / 2 + 250, y: height - 1800, image: obstacle1Image },
      { x: width / 2 - 180, y: height - 2300, image: obstacle2Image },
      { x: width / 2, y: height - 2800, image: obstacle2Image },
      { x: width / 2 - 180, y: height - 3300, image: obstacle1Image },
      { x: width / 2 + 180, y: height - 3300, image: obstacle2Image },
      { x: width / 2 + 250, y: height - 3800, image: obstacle2Image },
      { x: width / 2 - 150, y: height - 4300, image: obstacle1Image },
      { x: width / 2 + 250, y: height - 4800, image: obstacle2Image },
      { x: width / 2, y: height - 5300, image: obstacle1Image },
      { x: width / 2 - 180, y: height - 5500, image: obstacle2Image }
    ];

    this.addSprites(coins, 10, coinImage, 0.09);
    this.addSprites(fuels, 5, fuelImage, 0.02);
    this.addSprites(obstacles, obstaclesPositions.length, obstacle1Image, 0.04, obstaclesPositions);
  }


  addSprites(spriteGroup, numberOfSprites, spriteImage, scale, positions = []) {
    for (var i = 0; i < numberOfSprites; i++) {
      var x, y;


      if (positions.length > 0) {
        //posições fixas de acordo com a matriz de posições
        x = positions[i].x;
        y = positions[i].y;
        spriteImage = positions[i].image

      } else {
        //posições aleatorias para as moedas e combustiveis
        x = random(width / 2 + 150, width / 2 - 150);
        y = random(-height * 4.5, height - 400);
      }




      var sprite = createSprite(x, y);
      sprite.addImage(spriteImage);
      sprite.scale = scale;
      spriteGroup.add(sprite);

    }
  }


  getState() {
    var gameStateRef = database.ref("gameState");
    gameStateRef.on("value", (data) => {
      gameState = data.val();
    })
  }

  updateState(state) {
    database.ref("/").update({
      gameState: state
    });
  }

  handleElements() {
    form.hide();
    form.titleImg.position(40, 50);
    form.titleImg.class("gameTitleAfterEffect");


    this.resetTitle.html("Reiniciar Jogo");
    this.resetTitle.class("resetText");
    this.resetTitle.position(width / 2 + 230, 30);

    this.resetButton.class("resetButton");
    this.resetButton.position(width / 2 + 280, 100);


    this.leadboard.html("Placar");
    this.leadboard.class("leadersText");
    this.leadboard.position(width / 4 - 205, 390);


    this.leader1.class("leadersText");
    this.leader1.position(width / 4 - 230, 430);

    this.leader2.class("leadersText");
    this.leader2.position(width / 4 - 230, 480);

  }


  play() {
    this.handleElements();
    this.handleResetButton();

    Player.getPlayersInfo();
    player.getCarsAtEnd();

    if (allPlayers !== undefined) {
      image(trackImage, 0, -height * 5, width, height * 6);

      this.showLeaderboard();
      this.showFuelBar();
      this.showLifeBar();

      var index = 0;
      for (var plr in allPlayers) {
        index += 1;
        var x = allPlayers[plr].positionX;
        var y = height - allPlayers[plr].positionY;

        var currentLife = allPlayers[plr].life

        if (currentLife <= 0) {
          cars[index-1].changeImage("blast");
          cars[index-1].scale = 0.2;
        }

        cars[index - 1].position.x = x;
        cars[index - 1].position.y = y;

        if (index === player.index) {
          stroke(10);
          fill('blue')
          ellipse(x, y, 50, 50);
          this.handleFuel(index);
          this.handleCoins(index);
          this.handleCollision(index);
          this.handleCarsCollision(index);

          if (currentLife <= 0) {
            this.explosing = true;
            this.playerMoving = false;
            this.gameOver();
            updateState(2);
          }

          camera.position.y = cars[index - 1].position.y;
        }
      }

      this.handlePlayerControls();

      const finishLine = height * 6 - 100;

      if (player.positionY > finishLine) {
        gameState = 2;
        player.rank += 1;
        Player.updateCarsAtEnd(player.rank);
        player.update();
        this.showRank();
      }
      drawSprites();
    }

  }

  showLeaderboard() {
    var leader1, leader2;
    var players = Object.values(allPlayers);
    if (
      (players[0].rank === 0 && players[1].rank === 0) ||
      players[0].rank === 1
    ) {
      // &emsp;    Essa etiqueta é usada para exibir quatro espaços.
      leader1 =
        players[0].rank +
        "&emsp;" +
        players[0].name +
        "&emsp;" +
        players[0].score;

      leader2 =
        players[1].rank +
        "&emsp;" +
        players[1].name +
        "&emsp;" +
        players[1].score;
    }

    if (players[1].rank === 1) {
      leader1 =
        players[1].rank +
        "&emsp;" +
        players[1].name +
        "&emsp;" +
        players[1].score;

      leader2 =
        players[0].rank +
        "&emsp;" +
        players[0].name +
        "&emsp;" +
        players[0].score;
    }

    this.leader1.html(leader1);
    this.leader2.html(leader2);
  }


  handleResetButton() {
    this.resetButton.mousePressed(() => {
      database.ref("/").set({
        gameState: 0,
        playerCount: 0,
        players: {},
        score: 0,
        rank: 0,
        carsAtEnd: 0
      });
      window.location.reload();
    })
  }


  handlePlayerControls() {
    if(!this.explosing){
    if (keyIsDown(UP_ARROW)) {
      this.playerMoving = true;
      player.positionY += 10;
      player.update();
    }
    if (keyIsDown(RIGHT_ARROW) && player.positionX < width / 2 + 300) {
      player.positionX += 5;
      this.colliding = true;
      player.update();
      this.playerMoving = false;
    }
    if (keyIsDown(LEFT_ARROW) && player.positionX > width / 3 - 50) {
      player.positionX -= 5;
      this.colliding = true;
      player.update();
      this.playerMoving = false;
    }
  }

  }

  handleFuel(index) {
    cars[index - 1].overlap(fuels, function (collector, collected) {
      player.fuel = 185;
      collected.remove();

    })

    if (player.fuel > 0 && this.playerMoving) {
      player.fuel -= 0.5;
    }

    if (player.fuel == 0) {
      this.gameOver();
      this.updateState(2);
    }
  }

  handleCoins(index) {
    cars[index - 1].overlap(coins, function (collector, collected) {
      player.score += 20;
      player.update();
      collected.remove();
    })
  }

  handleCollision(index) {
    if (cars[index - 1].collide(obstacles)) {
      if (this.colliding) {
        player.positionX += 100;
      } else {
        player.positionX -= 100;
      }

      if (player.life > 0) {
        player.life -= 185 / 4
      }
      player.update();
    }
  }

 handleCarsCollision(index) {
    if (index === 1) {
      if(cars[index-1].collide(cars[1])){
        if (this.colliding) {
          player.positionX += 100;
        } else {
          player.positionX -= 100;
        }
        if(player.life > 0){
          player.life -= 185/4
        }
        player.update
      }
    }

    if (index === 2) {
      if(cars[index-1].collide(cars[0])){
        if (this.colliding) {
          player.positionX += 100;
        } else {
          player.positionX -= 100;
        }
        if(player.life > 0){
          player.life -= 185/4
        }
        player.update
      }
    }
  }

  showRank() {
    swal({
      title: `  Incrível! ${"\n"} ${player.rank} º lugar`,
      text: "Você alcançou a linha de chegada!",
      imageUrl: "https://raw.githubusercontent.com/vishalgaddam873/p5-multiplayer-car-race-game/master/assets/cup.png",
      imageSize: "100x100",
      confirmButtomText: "Ok"
    })
  }

  showLifeBar() {
    push();
    image(lifeImage, width / 2 - 30, height - player.positionY - 100, 20, 20);
    fill("white");
    rect(width / 2, height - player.positionY - 100, 185, 20);
    fill("#f50057");
    rect(width / 2, height - player.positionY - 100, player.life, 20);
    noStroke();
    pop();
  }

  showFuelBar() {
    push();
    image(fuelImage, width / 2 - 30, height - player.positionY - 70, 20, 20);
    fill("white");
    rect(width / 2, height - player.positionY - 70, 185, 20);
    fill("#ffc400");
    rect(width / 2, height - player.positionY - 70, player.fuel, 20);
    noStroke();
    pop();
  }

  gameOver() {
    swal({
      title: `Fim de Jogo`,
      text: "Você perdeu! Tente de Novo",
      imageUrl: "https://cdn.shopify.com/s/files/1/1061/1924/products/Thumbs_Down_Sign_Emoji_Icon_ios10_grande.png",
      imageSize: "100x100",
      confirmButtomText: "Ok"
    })
  }
}
