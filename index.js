const canvas = document.querySelector("canvas");

const gameOver = document.querySelector(".glow-wrapper");
const finalScoreEl = document.querySelector("#final-score-value");

const scoreEl = document.querySelector("#score");

const c = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

class Player {
  constructor() {
    // the position is shifted to the image onload as the spaceship position depends on the spaceship image

    this.velocity = {
      x: 0,
      y: 0,
    };

    this.rotation = 0; // this gives the effect of tilting the spaceship minutely

    const image = new Image();

    image.src = "./public/spaceship.png";

    // this will cause issue has the image has load properly so we do this
    image.onload = () => {
      this.image = image;
      this.width = image.width * 0.25;
      this.height = image.height * 0.25;
      this.position = {
        x: canvas.width / 2 - this.width / 2,
        y: canvas.height - this.height - 50,
      };
    };
  }
  draw() {
    // c.fillStyle = 'red'
    // c.fillRect(this.position.x, this.position.y, this.width, this.height);

    c.save();
    // this below is to give the tilt effect of the spaceship

    c.translate(
      this.position.x + this.width / 2,
      this.position.y + this.height / 2,
    );

    c.rotate(this.rotation);

    c.translate(
      -this.position.x - this.width / 2,
      -this.position.y - this.height / 2,
    );

    c.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.width,
      this.height,
    );

    c.restore();
  }

  update(dt = 1) {
    if (this.image) {
      this.draw();
      this.position.x += this.velocity.x * dt;
    }
  }
}

class Projectile {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = 3;
  }

  draw() {
    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    c.fillStyle = "red";
    c.fill();
    c.closePath();
  }

  update(dt = 1) {
    this.draw();
    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;
  }
}

class Particle {
  constructor({ position, velocity, radius, color, fades = true }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = radius;
    this.color = color;
    this.opacity = 1;
    this.fades = fades;
  }

  draw() {
    c.save();
    c.globalAlpha = this.opacity;
    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    c.fillStyle = this.color;
    c.fill();
    c.closePath();

    c.restore();
  }

  update(dt = 1) {
    this.draw();
    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;
    if (this.fades) {
      this.opacity -= 0.01 * dt;
    }
  }
}

class InvaderProjectile {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;
    this.width = 3;
    this.height = 10;
  }

  draw() {
    c.fillStyle = "white";
    c.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  update(dt = 1) {
    this.draw();
    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;
  }
}

class Invader {
  constructor({ position }) {
    // the position is shifted to the image onload as the inavder position depends on the invader image

    this.velocity = {
      x: 0,
      y: 0,
    };

    const image = new Image();

    image.src = "./public/invader.png";

    // this will cause issue has the image has load properly so we do this
    image.onload = () => {
      this.image = image;
      this.width = image.width;
      this.height = image.height;
      this.position = {
        x: position.x,
        y: position.y,
      };
    };
  }
  draw() {
    // c.fillStyle = 'red'
    // c.fillRect(this.position.x, this.position.y, this.width, this.height);

    c.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.width,
      this.height,
    );
  }

  update({ velocity, dt = 1 }) {
    if (this.image) {
      this.draw();
      this.position.x += velocity.x * dt;
      this.position.y += velocity.y * dt;
    }
  }

  shoot(invaderProjectiles) {
    invaderProjectiles.push(
      new InvaderProjectile({
        position: {
          x: this.position.x + this.width / 2,
          y: this.position.y + this.height,
        },
        velocity: {
          x: 0,
          y: 5,
        },
      }),
    );
  }
}

// To set the invader in the canvas we need the Grid

class Grid {
  constructor() {
    this.position = {
      x: 5,
      y: 0,
    };

    this.velocity = {
      x: 8,
      y: 0,
    };

    this.invaders = [];

    const rows = Math.floor(Math.random() * 5 + 1);
    const cols = Math.floor(Math.random() * 3 + 2);

    this.width = cols * 35;
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        this.invaders.push(
          new Invader({
            position: {
              x: i * 35,
              y: j * 35,
            },
          }),
        );
      }
    }
  }

  update(dt = 1) {
    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y;

    this.velocity.y = 0;

    if (this.position.x + this.width >= canvas.width || this.position.x <= 5) {
      this.velocity.x = -this.velocity.x;
      this.velocity.y = 35;
    }
  }
}

const player = new Player();
const projectiles = [];
const grids = [];
const invaderProjectiles = [];
const particles = [];

// mobile touch controls
let touchStartX = null;
let lastTouchX = null;

let score = 0;

let animationId;

const game = {
  over: false,
  active: true,
};

let frames = 0;
let randomInterval = Math.floor(Math.random() * 1000) + 500;

const keys = {
  a: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
  space: {
    pressed: false,
  },
};

// --- shooting rate limit ---
const SHOOT_COOLDOWN = 300; // ms between shots, tweak to taste
let lastShotTime = 0;

function fireProjectile() {
  if (!player.position) return; // player image not loaded yet

  const now = Date.now();
  if (now - lastShotTime < SHOOT_COOLDOWN) return; // still on cooldown
  lastShotTime = now;

  projectiles.push(
    new Projectile({
      position: {
        x: player.position.x + player.width / 2,
        y: player.position.y,
      },
      velocity: {
        x: 0,
        y: -5,
      },
    }),
  );
}
// --- end shooting rate limit ---

player.update(); // the image will load later we need to shift this code to requestAnimate function

for (let i = 0; i < 100; i++) {
  particles.push(
    new Particle({
      position: {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
      },
      velocity: {
        x: 0,
        y: 0.3,
      },
      radius: Math.random() * 3,
      color: "#BAA0DE",
      fades: false,
    }),
  );
}

function createParticles({ object, color, value = 3, iter = 30 }) {
  for (let i = 0; i < iter; i++) {
    particles.push(
      new Particle({
        position: {
          x: object.position.x + object.width / 2,
          y: object.position.y + object.height / 2,
        },
        velocity: {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
        },
        radius: Math.random() * value,
        color: color || "#BAA0DE",
      }),
    );
  }
}

// --- frame-rate independent movement ---
// requestAnimationFrame fires at the display's refresh rate (60Hz desktop,
// often 90/120Hz on phones), so raw per-frame increments run faster on
// high refresh-rate screens. We normalize every update() call against a
// 60fps baseline (16.67ms/frame) using the real time elapsed since the
// last frame, so movement speed stays consistent across devices.
let lastTime = 0;

function animate(timestamp = 0) {
  animationId = requestAnimationFrame(animate);

  const rawDelta = lastTime ? timestamp - lastTime : 16.67;
  lastTime = timestamp;
  // clamp to avoid huge jumps after e.g. switching tabs
  const dt = Math.min(rawDelta / 16.67, 3);

  c.fillStyle = "black";
  c.fillRect(0, 0, canvas.width, canvas.height);
  invaderProjectiles.forEach((invaderProjectile, index) => {
    if (
      invaderProjectile.position.y + invaderProjectile.height >=
      canvas.height
    ) {
      setTimeout(() => {
        invaderProjectiles.splice(index, 1);
      });
    } else {
      invaderProjectile.update(dt);
    }

    if (
      invaderProjectile.position.y + invaderProjectile.height >=
        player.position.y &&
      invaderProjectile.position.x + invaderProjectile.width >=
        player.position.x &&
      invaderProjectile.position.x <= player.position.x + player.width
    ) {
      setTimeout(() => {
        invaderProjectiles.splice(index, 1);
        player.image = "";
        createParticles({ object: player, color: "red", value: 5, iter: 30 });
        game.over = true;
      });

      setTimeout(() => {
        game.active = false;
        showGameOver();
      }, 2000);
    }
  });

  particles.forEach((particle, index) => {
    if (particle.position.y - particle.radius >= canvas.height) {
      particle.position.x = Math.random() * canvas.width;
      particle.position.y = -particle.radius;
    }

    if (particle.opacity < 0) {
      setTimeout(() => {
        particles.splice(index, 1);
      });
    } else {
      particle.update(dt);
    }
  });

  grids.forEach((grid) => {
    grid.update(dt);

    if (frames % 100 === 0 && grid.invaders.length > 0) {
      grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(
        invaderProjectiles,
      );
    }

    grid.invaders.forEach((invader, i) => {
      invader.update({
        velocity: grid.velocity,
        dt,
      });

      // projectile hit enemy
      projectiles.forEach((projectile, j) => {
        if (
          projectile.position.y - projectile.radius <=
            invader.position.y + invader.height &&
          projectile.position.x + projectile.radius >= invader.position.x &&
          projectile.position.x - projectile.radius <= invader.position.x &&
          projectile.position.y + projectile.radius >= invader.position.y
        ) {
          setTimeout(() => {
            const invaderFound = grid.invaders.find(
              (invader2) => invader === invader2,
            );
            const projectileFound = projectiles.find(
              (projectile2) => projectile === projectile2,
            );

            if (invaderFound && projectileFound) {
              scoreEl.innerHTML = score += 10;
              createParticles({ object: invader });
              grid.invaders.splice(i, 1);
              projectiles.splice(j, 1);

              if (grid.invaders.length > 0) {
                const firstInvader = grid.invaders[0];
                const lastInvader = grid.invaders[grid.invaders.length - 1];

                grid.width =
                  lastInvader.position.x -
                  firstInvader.position.x +
                  lastInvader.width;
              } else {
                grids.splice(grids.indexOf(grid), 1);
              }
            }
          });
        }
      });
    });
  });

  projectiles.forEach((projectile, index) => {
    // delete the projectile which is not in the screen and to optimize the memory
    if (projectile.position.y + projectile.radius < 0) {
      setTimeout(() => {
        projectiles.splice(index, 1);
      });
    } else {
      projectile.update(dt);
    }
  });

  player.velocity.x = 0; // reset every frame
  player.rotation = 0;

  if (keys.a.pressed && player.position.x >= 0) {
    player.velocity.x = -5;
    player.rotation = -0.15;
  } else if (
    keys.d.pressed &&
    player.position.x <= canvas.width - player.width
  ) {
    player.velocity.x = 5;
    player.rotation = 0.15;
  }

  if (keys.space.pressed) {
    fireProjectile();
  }

  if (frames % randomInterval === 0) {
    randomInterval = Math.floor(Math.random() * 500) + 500;
    frames = 0;
    grids.push(new Grid());
  }

  frames++;

  player.update(dt);
}

animate();

addEventListener("keydown", ({ key }) => {
  switch (key) {
    case "a":
    case "ArrowLeft":
      keys.a.pressed = true;
      break;

    case "d":
    case "ArrowRight":
      keys.d.pressed = true;
      break;

    case " ":
      keys.space.pressed = true;
      break;
  }
});

addEventListener("keyup", ({ key }) => {
  switch (key) {
    case "a":
    case "ArrowLeft":
      keys.a.pressed = false;
      break;

    case "d":
    case "ArrowRight":
      keys.d.pressed = false;
      break;

    case " ":
      keys.space.pressed = false;
      break;
  }
});

addEventListener("resize", ({ target }) => {
  canvas.width = target.innerWidth;
  canvas.height = target.innerHeight;
  //  handleStart();
});

canvas.addEventListener("touchmove", (e) => {
  const touch = e.touches[0];

  if (!lastTouchX) {
    lastTouchX = touch.clientX;
  }

  const deltaX = touch.clientX - lastTouchX;

  player.position.x += deltaX;

  lastTouchX = touch.clientX;

  // prevent player leaving screen
  if (player.position.x < 0) player.position.x = 0;
  if (player.position.x > canvas.width - player.width)
    player.position.x = canvas.width - player.width;
});

canvas.addEventListener("touchstart", (e) => {
  const touch = e.touches[0];

  touchStartX = touch.clientX;

  fireProjectile();
});

canvas.addEventListener("touchend", () => {
  lastTouchX = null;
});

canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
});

function showGameOver() {
  console.log("Out");
  finalScoreEl.innerHTML = score;
  gameOver.style.display = "flex";
  cancelAnimationFrame(animationId);
}

function handleStart() {
  console.log("click");
  window.location.reload();
}