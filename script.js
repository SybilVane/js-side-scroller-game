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

  class Player {
    constructor(gameWidth, gameHeight) {
      this.gameWidth = gameWidth;
      this.gameHeight = gameHeight;
      this.width = 200;
      this.height = 200;
      this.x = 0;
      this.y = 0;
      this.image = document.getElementById('playerImage');
      this.frameX = 0;
      this.frameY = 0;
      this.speed = 0;
    }

    draw(context) {
      context.fillStyle = 'white';
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
    update() {
      this.x += this.speed;
      input.keys.has('ArrowRight')
        ? (this.speed = 5)
        : input.keys.has('ArrowLeft')
        ? (this.speed = -5)
        : (this.speed = 0);

      if (this.x < 0) this.x = 0;
      else if (this.x > this.gameWidth - this.width)
        this.x = this.gameWidth - this.width;
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
