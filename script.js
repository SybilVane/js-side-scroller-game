window.addEventListener('load', () => {
  const canvas = document.getElementById('canvas1');
  const ctx = canvas.getContext('2d');
  canvas.width = 800;
  canvas.height = 720;

  class InputHandler {
    constructor() {
      this.keys = new Set();
      window.addEventListener('keydown', (e) => {
        if (
          e.key === 'ArrowDown' ||
          e.key === 'ArrowUp' ||
          e.key === 'ArrowLeft' ||
          e.key === 'ArrowRight'
        )
          this.keys.add(e.key);
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
      this.width = 200;
      this.height = 200;
      this.x = 0;
      this.y = gameHeight - this.height;
      this.image = document.getElementById('playerImage');
      this.frameX = 0;
      this.frameY = 0;
      this.speed = 0;
      this.vy = 0;
      this.weight = 1;
    }

    draw(context) {
      context.fillRect(this.x, this.y, this.width, this.height);
      context.drawImage(
        this.image,
        this.frameX * this.width, // source x
        this.frameY * this.height, // source y
        this.width, // source width
        this.height, // source height
        this.x,
        this.y,
        this.width,
        this.height
      );
    }
    update(input) {
      if (input.keys.has('ArrowRight')) this.speed = 5;
      else if (input.keys.has('ArrowLeft')) this.speed = -5;
      else if (input.keys.has('ArrowUp') && this.onGround()) this.vy -= 32;
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
      } else {
        this.vy = 0; // if it's not on ground then you can't jump
        this.frameY = 0; // set frame to standing
      }
      if (this.y > this.gameHeight - this.height)
        // bottom boundary
        this.y = this.gameHeight - this.height;
    }
    onGround() {
      return this.y >= this.gameHeight - this.height; // if it's on ground then return true
    }
  }

  class Background {}

  class Enemy {}

  function handleEnemies() {}

  function displayStatusText() {}

  const input = new InputHandler();
  const player = new Player(canvas.width, canvas.height);

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.draw(ctx);
    player.update(input);
    requestAnimationFrame(animate);
  }

  animate();
});
