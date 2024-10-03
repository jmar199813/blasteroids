const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const retryButton = document.getElementById('retryButton');

// Game variables
let gameRunning = false;
let score = 0; // Initialize the score
let lives = 3; // Initialize the number of lives

const spaceship = {
    x: canvas.width / 2 - 15, // Centre horizontally
    y: canvas.height - 30, // Position it at the bottom of the screen
    width: 30,
    height: 30,
    speed: 10, // Speed player moves
    dx: 0
};

const missiles = [];
const missileSpeed = 8;

const enemies = [];
const enemySpeed = 1;
const enemyWidth = 40;
const enemyHeight = 40;

// Stars
const stars = [];
const numStars = 100; // Number of stars to display
const starSpeed = 1; // Reduced speed at which stars move upward

// Particles
const particles = [];
const particleCount = 20; // Number of particles per explosion
const particleLifetime = 500; // Lifespan of particles in milliseconds

// Initialize stars with random positions
function createStars() {
    for (let i = 0; i < numStars; i++) {
        stars.push({
            x: Math.random() * canvas.width, // Random horizontal position
            y: Math.random() * canvas.height, // Random vertical position
            radius: Math.random() * 2 + 1 // Random size
        });
    }
}

// Generates a random color for particles
function getRandomColor() {
    const colors = ['red', 'yellow', 'orange', 'green'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Creates a new particle explosion
function createParticles(x, y) {
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 4, // Random velocity in x direction
            vy: (Math.random() - 0.5) * 4, // Random velocity in y direction
            lifetime: particleLifetime,
            color: getRandomColor() // Assign random color to each particle
        });
    }
}

// Spaceship
function drawSpaceship() {
    ctx.fillStyle = '#65BFAE';
    ctx.beginPath();
    ctx.moveTo(spaceship.x + spaceship.width / 2, spaceship.y); // Top vertex
    ctx.lineTo(spaceship.x, spaceship.y + spaceship.height); // Bottom-left vertex
    ctx.lineTo(spaceship.x + spaceship.width, spaceship.y + spaceship.height); // Bottom-right vertex
    ctx.closePath();
    ctx.fill();
}

// Creates a new missile
function createMissile() {
    const missile = {
        x: spaceship.x + spaceship.width / 2 - 2.5, // Centres the missile
        y: spaceship.y,
        width: 5,
        height: 15,
        speed: missileSpeed
    };
    missiles.push(missile);
}

// Create a new enemy
function createEnemy() {
    const enemy = {
        x: Math.random() * (canvas.width - enemyWidth), // Random horizontal position
        y: -enemyHeight, // Start above the canvas
        width: enemyWidth,
        height: enemyHeight,
        speed: enemySpeed
    };
    enemies.push(enemy);
}

// Draws all enemies (simple design)
function drawEnemies() {
    ctx.fillStyle = 'green';
    enemies.forEach(enemy => {
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });
}

// Draw stars in the background
function drawStars() {
    ctx.fillStyle = '#F0D971'; // Star color
    stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Draw particles
function drawParticles() {
    particles.forEach(particle => {
        const alpha = particle.lifetime / particleLifetime;
        ctx.fillStyle = `rgba(${parseColor(particle.color)}, ${alpha})`; // Particle color with decreasing alpha
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Convert color names to RGB values
function parseColor(color) {
    switch (color) {
        case 'red': return '255, 0, 0';
        case 'yellow': return '255, 255, 0';
        case 'orange': return '255, 165, 0';
        case 'green': return '0, 255, 0';
        default: return '255, 255, 255'; // fallback to white
    }
}

// Scoreboard and Lives counter
function drawScoreAndLives() {
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`Score: ${score}`, 10, 10); // Draw score at the top-left corner
    ctx.fillText(`Lives: ${lives}`, canvas.width - 100, 10); // Draw lives at the top-right corner
}

// Updates game state
function update() {
    spaceship.x += spaceship.dx;

    // Boundary detection for spaceship (horizontal movement only)
    if (spaceship.x < 0) spaceship.x = 0;
    if (spaceship.x + spaceship.width > canvas.width) spaceship.x = canvas.width - spaceship.width;

    // Updates missiles
    missiles.forEach((missile, index) => {
        missile.y -= missile.speed;

        // Removes missiles that go off-screen
        if (missile.y < 0) {
            missiles.splice(index, 1);
        }

        // Checks for collision with enemies
        enemies.forEach((enemy, enemyIndex) => {
            if (
                missile.x < enemy.x + enemy.width &&
                missile.x + missile.width > enemy.x &&
                missile.y < enemy.y + enemy.height &&
                missile.y + missile.height > enemy.y
            ) {
                // Create particles at the collision point
                createParticles(
                    enemy.x + enemy.width / 2,
                    enemy.y + enemy.height / 2
                );

                // Removes both missile and enemy on collision
                missiles.splice(index, 1);
                enemies.splice(enemyIndex, 1);
                score += 100; // Add points to user score
            }
        });
    });

    // Updates enemies
    enemies.forEach((enemy, index) => {
        enemy.y += enemy.speed;

        // Checks if enemy has reached the bottom of the screen
        if (enemy.y > canvas.height - enemy.height) {
            enemies.splice(index, 1); // Removes the enemy
            lives -= 1; // Loses a life

            if (lives <= 0) {
                gameOver(); // Game over when lives are depleted
            }
        }
    });

    // Updates stars
    stars.forEach((star) => {
        star.y -= starSpeed;

        // Reset star position if it goes off-screen
        if (star.y < 0) {
            star.y = canvas.height;
            star.x = Math.random() * canvas.width; // Randomize horizontal position
        }
    });

    // Update particles
    particles.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.lifetime -= 16; // Assuming ~60 FPS, so subtract ~16ms per frame

        // Remove particles that are out of lifespan
        if (particle.lifetime <= 0) {
            particles.splice(index, 1);
        }
    });
}

// Clear canvas
function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Draw everything
function draw() {
    clear();
    drawStars(); // Draw stars first to appear in the background
    drawScoreAndLives(); // Draw the scoreboard and lives counter
    drawSpaceship();
    drawEnemies(); // Draw enemies

    // Draw missiles
    ctx.fillStyle = 'red';
    missiles.forEach(missile => {
        ctx.fillRect(missile.x, missile.y, missile.width, missile.height);
    });

    // Draw particles
    drawParticles();

    // If the game is over, draw the game over message
    if (!gameRunning) {
        ctx.fillStyle = 'white';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Draw "GAME OVER" text
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 60);

        // Draw final score
        ctx.font = '36px Arial';
        ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2);
    }
}

// Ends the game
function gameOver() {
    console.log('Game Over function called');
    console.log('Final Score:', score);
    console.log('Lives left:', lives);

    gameRunning = false;

    // Shows retry button
    retryButton.style.display = 'block'; // Show the retry button
}

// Resets the game
function resetGame() {
    lives = 3;
    score = 0;
    enemies.length = 0; // Clears all enemies
    missiles.length = 0; // Clears all missiles
    stars.length = 0; // Clears all stars
    particles.length = 0; // Clears all particles
    createStars(); // Recreate stars
    spaceship.x = canvas.width / 2 - 15; // Resets spaceship position
    spaceship.y = canvas.height - 30;
    gameRunning = true;
    retryButton.style.display = 'none'; // Hides the retry button
    gameLoop(); // Starts the game loop
}

// Game loop
function gameLoop() {
    if (!gameRunning) return;
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// User Keyboard Input (simple)
function keyDownHandler(e) {
    if (e.key === 'ArrowLeft') spaceship.dx = -spaceship.speed; // Moves player left via keyboard
    if (e.key === 'ArrowRight') spaceship.dx = spaceship.speed; // Moves player right via keyboard
    if (e.key === ' ') createMissile(); // Fires missiles via space bar
}

function keyUpHandler(e) {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') spaceship.dx = 0;
}

// Starts the game
function startGame() {
    gameRunning = true;
    lives = 3; // Reset lives when starting a new game
    score = 0; // Reset score when starting a new game
    startButton.style.display = 'none'; // Hide the start button
    retryButton.style.display = 'none'; // Hide the retry button initially
    createStars(); // Initialize stars
    gameLoop(); // Start the game loop

    // Spawn enemies at regular intervals
    setInterval(createEnemy, 2000); // Adjust the interval as needed
}

// Event listeners for keyboard controls
document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);

// Event listener for start button
startButton.addEventListener('click', startGame);

// Event listener for retry button
retryButton.addEventListener('click', resetGame);

// Hide retry button initially
retryButton.style.display = 'none';