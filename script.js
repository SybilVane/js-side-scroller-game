window.addEventListener('load', () => {
  const canvas = document.getElementById('canvas1');
  const ctx = canvas.getContext('2d');
  canvas.width = 800;
  canvas.height = 720;
  let enemies = [];
  let score = 0;
  let gameOver = false;

  class InputHandler {
    constructor() {
      this.keys = new Set();
      this.touchY = '';
      this.touchX = '';
      this.touchThresholdY = 30;
      this.touchThresholdX = 15;

      window.addEventListener('keydown', (e) => {
        if (
          e.key === 'ArrowDown' ||
          e.key === 'ArrowUp' ||
          e.key === 'ArrowLeft' ||
          e.key === 'ArrowRight'
        ) {
          this.keys.add(e.key);
        } else if (e.key === 'Enter' && gameOver) {
          restartGame();
        }
      });
      window.addEventListener('keyup', (e) => {
        if (
          (e.key === 'ArrowDown' && this.keys.has(e.key)) ||
          (e.key === 'ArrowUp' && this.keys.has(e.key)) ||
          (e.key === 'ArrowLeft' && this.keys.has(e.key)) ||
          (e.key === 'ArrowRight' && this.keys.has(e.key))
        )
          this.keys.delete(e.key);
      });
      window.addEventListener('touchstart', (e) => {
        this.touchY = e.changedTouches[0].pageY;
        this.touchX = e.changedTouches[0].pageX;
      });
      window.addEventListener('touchmove', (e) => {
        const swipeDistanceY = e.changedTouches[0].pageY - this.touchY;
        const swipeDistanceX = e.changedTouches[0].pageX - this.touchX;
        if (
          swipeDistanceX < -this.touchThresholdX &&
          !this.keys.has('swipe left')
        )
          this.keys.add('swipe left');
        else if (
          swipeDistanceX > this.touchThresholdX &&
          !this.keys.has('swipe right')
        )
          this.keys.add('swipe right');
        else if (
          swipeDistanceY < -this.touchThresholdY &&
          !this.keys.has('swipe up')
        )
          this.keys.add('swipe up');
        else if (
          swipeDistanceY > this.touchThresholdY &&
          !this.keys.has('swipe down')
        ) {
          this.keys.add('swipe down');
          if (gameOver) restartGame();
        }
      });
      window.addEventListener('touchend', (e) => {
        this.keys.delete('swipe up');
        this.keys.delete('swipe down');
        this.keys.delete('swipe left');
        this.keys.delete('swipe right');
      });
    }
  }

  /*  
TOP BOUNDARY OF SCREEN
x = 0 

BOTTOM BOUNDARY OF SCREEN
y = canvas height - height of player
gameHeight - this.height

LEFT BOUNDARY OF SCREEN
y = 0

RIGHT BOUNDARY OF SCREEN
x = canvas width - width of player
gameWidth - this.width
*/

  class Player {
    constructor(gameWidth, gameHeight) {
      this.gameWidth = gameWidth;
      this.gameHeight = gameHeight;
      this.image = document.getElementById('playerImage');
      this.width = 200; // width of player
      this.height = 200; // height of player
      this.x = 20; // x position of player
      this.y = gameHeight - this.height; // y position of player
      this.frameX = 0; // frame position from spritesheet horizontally
      this.frameY = 0; // frame position from spritesheet vertically
      this.maxFrame = 8; // maximum frame position from spritesheet horizontally
      this.fps = 20; // frames per second
      this.frameTimer = 0; // frame timer
      this.frameInterval = 1000 / this.fps; // frame interval
      this.speed = 0; // horizontal speed of player
      this.vy = 0; // vertical speed of player
      this.weight = 1; // weight of player
    }
    restart() {
      this.x = 20;
      this.y = this.gameHeight - this.height;
      this.maxFrame = 8;
      this.frameY = 0;
    }

    draw(context) {
      context.drawImage(
        this.image,
        this.frameX * this.width, // source x
        this.frameY * this.height, // source y
        this.width, // source width
        this.height, // source height
        this.x, // destination x
        this.y, // destination y
        this.width, // destination width
        this.height // destination height
      );
    }
    update(input, deltaTime, enemies) {
      // collision detection between player and enemies
      enemies.forEach((enemy) => {
        const dx = enemy.x + enemy.width / 2 - (this.x + this.width / 2);
        const dy = enemy.y + enemy.height / 2 - (this.y + this.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy) + 20; // distance between centers of circles (hypotenuse)
        if (distance < enemy.width / 2 + this.width / 2) {
          gameOver = true;
        }
      });

      // sprite animation
      if (this.frameTimer > this.frameInterval) {
        if (this.frameX >= this.maxFrame) this.frameX = 0;
        else this.frameX++;
        this.frameTimer = 0;
      } else this.frameTimer += deltaTime;

      // controls
      if (input.keys.has('ArrowRight') || input.keys.has('swipe right'))
        this.speed = 5;
      else if (input.keys.has('ArrowLeft') || input.keys.has('swipe left'))
        this.speed = -5;
      else if (
        (input.keys.has('ArrowUp') || input.keys.has('swipe up')) &&
        this.onGround()
      )
        this.vy -= 32;
      else this.speed = 0;

      this.x += this.speed; // move player horizontally
      if (this.x < 0) this.x = 0; // left boundary
      else if (this.x > this.gameWidth - this.width)
        // right boundary
        this.x = this.gameWidth - this.width;

      // vertical movement
      this.y += this.vy; // jump
      if (!this.onGround()) {
        this.vy += this.weight; // if it's on ground then you can jump
        this.frameY = 1; // set frame to jumping
        this.maxFrame = 5; // set max frame to jumping (fewer frames than running in the spritesheet)
      } else {
        this.vy = 0; // if it's not on ground then you can't jump
        this.frameY = 0; // set frame to standing
        this.maxFrame = 8; // set max frame to running (more frames than jumping in the spritesheet)
      }
      if (this.y > this.gameHeight - this.height)
        // bottom boundary
        this.y = this.gameHeight - this.height;
    }
    onGround() {
      return this.y >= this.gameHeight - this.height; // if it's on ground then return true
    }
  }

  class Background {
    constructor(gameWidth, gameHeight) {
      this.gameWidth = gameWidth;
      this.gameHeight = gameHeight;
      this.image = document.getElementById('backgroundImage');
      this.x = 0;
      this.y = 0;
      this.width = 2400;
      this.height = 720;
      this.speed = 1;
    }
    draw(context) {
      context.drawImage(this.image, this.x, this.y, this.width, this.height);
      context.drawImage(
        this.image,
        this.x + this.width - this.speed, // account for scrolling speed when setting x of second image
        this.y,
        this.width,
        this.height
      ); // draw second image to the right of the first one
    }
    update() {
      this.x -= this.speed;
      if (this.x < -this.width) this.x = 0; // if it's off screen then reset to 0
    }
    restart() {
      this.x = 0;
    }
  }

  class Enemy {
    constructor(gameWidth, gameHeight) {
      this.gameWidth = gameWidth;
      this.gameHeight = gameHeight;
      this.image = document.getElementById('enemyImage');
      this.width = 160;
      this.height = 119;
      this.x = this.gameWidth; // start off screen to the right
      this.y = this.gameHeight - this.height; // bottom boundary
      this.frameX = 0; // start at first frame
      this.maxFrameX = 5; // number of frames in spritesheet horizontally
      this.fps = 20; // frames per second
      this.frameTimer = 0; // frame timer
      this.frameInterval = 1000 / this.fps; // frame interval
      this.speed = 8; // speed of enemy
      this.toBeDeleted = false; // if enemy is to be deleted then set to true
    }

    draw(context) {
      context.drawImage(
        this.image,
        this.frameX * this.width, // source x
        0, // source y (always 0 because there's only one row)
        this.width, // source width
        this.height, // source height
        this.x, // destination x
        this.y, // destination y
        this.width, // destination width
        this.height // destination height
      );
    }
    update(deltaTime) {
      if (this.frameTimer > this.frameInterval) {
        if (this.frameX >= this.maxFrameX)
          this.frameX = 0; // reset to first frame
        else this.frameX++; // increment to next frame
        this.frameTimer = 0; // reset frame timer
      } else this.frameTimer += deltaTime; // add time to frame timer
      this.x -= this.speed;

      if (this.x < -this.width) {
        this.toBeDeleted = true; // if off screen then delete
        score++;
      }
    }
  }
  function handleEnemies(deltaTime) {
    if (enemyTimer > enemyInterval + randomEnemyInterval) {
      enemies.push(new Enemy(canvas.width, canvas.height));
      enemyTimer = 0;
    } else {
      enemyTimer += deltaTime;
    }
    enemies.forEach((enemy) => {
      enemy.draw(ctx);
      enemy.update(deltaTime);
    });
    enemies = enemies.filter((enemy) => !enemy.toBeDeleted);
  }

  function displayStatusText(context) {
    context.textAlign = 'left';
    context.fillStyle = 'white';
    context.font = '40px Courier New';
    context.fillText(`Score ${score}`, 20, 40);

    if (gameOver) {
      context.textAlign = 'center';
      context.fillStyle = 'black';
      context.font = '50px Courier New';
      context.fillText('GAME OVER!', canvas.width / 2, canvas.height / 2 - 25);
      context.fillStyle = 'white';
      context.fillText(
        'GAME OVER!',
        canvas.width / 2 + 2,
        canvas.height / 2 + 2 - 25
      );
      context.fillStyle = 'black';
      context.font = '40px Courier New';
      context.fillText(
        'Press enter or swipe down...',
        canvas.width / 2,
        canvas.height / 2 + 25
      );
      context.fillStyle = 'white';
      context.fillText(
        'Press enter or swipe down...',
        canvas.width / 2 + 2,
        canvas.height / 2 + 2 + 25
      );
    }
  }

  function restartGame() {
    player.restart();
    background.restart();
    enemies = [];
    score = 0;
    gameOver = false;
    animate(0);
  }

  const input = new InputHandler();
  const player = new Player(canvas.width, canvas.height);
  const background = new Background(canvas.width, canvas.height);

  let lastTime = 0;
  let enemyTimer = 0;
  let enemyInterval = 1000; // milliseconds between enemy spawns
  const randomEnemyInterval = Math.random() * 1000 + 500;

  function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    background.draw(ctx);
    background.update();
    player.draw(ctx);
    player.update(input, deltaTime, enemies);
    handleEnemies(deltaTime);
    displayStatusText(ctx);
    if (!gameOver) requestAnimationFrame(animate);
  }

  animate(0);
});
