let username = "";
let game = null;

window.startGame = function() {
  const input = document.getElementById("usernameInput");
  if (!input.value.trim()) {
    alert("Por favor, ingresa un nombre válido.");
    return;
  }

  username = input.value.trim();
  document.getElementById("start-screen").style.display = "none";

  if (!game) {
    const config = {
      type: Phaser.AUTO,
      width: 1000,
      height: 700,
      parent: 'game-container',
      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 800 },
          debug: false
        }
      },
      scene: {
        preload: preload,
        create: create,
        update: update
      }
    };

    game = new Phaser.Game(config);
  }
};

// Variables del juego
let player;
let platforms;
let cursors;
let stars;
let score = 0;
let scoreText;
let victoryText;
let restartButton;
let totalStars = 12;

function preload() {
  this.load.image("sky", "assets/sky.png");
  this.load.image("ground", "assets/platform.png");
  this.load.image("star", "assets/star.png");
  this.load.image("player", "assets/player.png");
}

function create() {
  // 1. Fondo
  this.add.image(0, 0, "sky").setOrigin(0, 0).setDisplaySize(1000, 700);

  // 2. Plataformas
  platforms = this.physics.add.staticGroup();
  
  const ground = platforms.create(500, 620, "ground")
    .setScale(2, 1.5)
    .refreshBody();
  ground.setOrigin(0.5, 0.5);
  
  platforms.create(700, 500, "ground").setScale(1.5).refreshBody();
  platforms.create(350, 378, "ground").setScale(1.5).refreshBody();
  platforms.create(700, 257, "ground").setScale(1.5).refreshBody();
  platforms.create(100, 255, "ground").setScale(1.5).refreshBody();

  // 3. Jugador
  player = this.physics.add.sprite(100, 550, "player");
  player.setScale(0.1);
  player.body.setSize(450, 600, (player.width * player.scaleX - 450) / 2, 10);
  player.setCollideWorldBounds(true);
  player.body.setGravityY(20);
  player.setBounce(0.1);

  this.physics.add.collider(player, platforms);

  // Controles
  cursors = this.input.keyboard.createCursorKeys();
  this.input.keyboard.addKey('space');

  // 4. Estrellas
  stars = this.physics.add.group({
    key: "star",
    repeat: 11,
    setXY: {
      x: 50,
      y: 200,
      stepX: 80
    }
  });

  stars.children.iterate(star => {
    star.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    star.setScale(0.3);
    star.body.setCollideWorldBounds(true);
  });

  this.physics.add.collider(stars, platforms);
  this.physics.add.overlap(player, stars, collectStar, null, this);

  // 5. Interfaz
  scoreText = this.add.text(20, 20, `Score: 0 | Jugador: ${username}`, {
    fontSize: "32px",
    fill: "#fff",
    fontFamily: "Arial",
    stroke: "#000",
    strokeThickness: 4,
    padding: { x: 10, y: 5 }
  });

  // Texto de victoria (inicialmente oculto)
  victoryText = this.add.text(500, 300, "¡VICTORIA!", {
    fontSize: "64px",
    fill: "#ff0",
    fontFamily: "Arial",
    stroke: "#000",
    strokeThickness: 8,
    shadow: { offsetX: 3, offsetY: 3, color: '#000', blur: 5 }
  }).setOrigin(0.5).setVisible(false);

  // Botón de reinicio (inicialmente oculto)
  restartButton = this.add.text(500, 400, "REINICIAR", {
    fontSize: "32px",
    fill: "#fff",
    backgroundColor: "#4CAF50",
    fontFamily: "Arial",
    stroke: "#000",
    strokeThickness: 4,
    padding: { x: 20, y: 10 }
  })
  .setOrigin(0.5)
  .setVisible(false)
  .setInteractive()
  .on('pointerdown', () => {
    this.scene.restart();
    score = 0;
    victoryText.setVisible(false);
    restartButton.setVisible(false);
    player.setTint(0xffffff);
    this.physics.resume();
  })
  .on('pointerover', () => restartButton.setBackgroundColor("#45a049"))
  .on('pointerout', () => restartButton.setBackgroundColor("#4CAF50"));
}

function update() {
  if (cursors.left.isDown) {
    player.setVelocityX(-250);
    player.flipX = true;
  } else if (cursors.right.isDown) {
    player.setVelocityX(250);
    player.flipX = false;
  } else {
    player.setVelocityX(0);
  }

  if ((cursors.up.isDown || this.input.keyboard.addKey('space').isDown) && 
      player.body.onFloor()) {
    player.setVelocityY(-450);
  }
}

function collectStar(player, star) {
  star.disableBody(true, true);
  score += 10;
  scoreText.setText(`Score: ${score} | Jugador: ${username}`);

  fetch("https://serverjuego.onrender.com", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, score })
  }).catch(err => console.log("Error al guardar:", err));

  if (score >= totalStars * 10) {
    showVictoryMessage.call(this);
  }
}

function showVictoryMessage() {
  victoryText.setVisible(true);
  restartButton.setVisible(true);
  player.setTint(0xffff00);
  player.setVelocity(0, 0);
  this.physics.pause();
}