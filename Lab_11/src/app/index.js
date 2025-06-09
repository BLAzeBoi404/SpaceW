const rulesBtn = document.getElementById("rules-btn");
const closeBtn = document.getElementById("close-btn");
const rules = document.getElementById("rules");
const scoreDisplay = document.getElementById("score-display");
const speedDisplay = document.getElementById("speed-display");

rulesBtn.addEventListener("click", () => {
    rules.classList.add("show");
});

closeBtn.addEventListener("click", () => {
    rules.classList.remove("show");
});

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 220; 
}
resizeCanvas();
window.addEventListener('resize', () => {
    resizeCanvas();
    resetGame();
});

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 12,
    speed: 5,
    dx: 5,
    dy: -5
};

const paddle = {
    x: canvas.width / 2 - 70,
    y: canvas.height - 70,  
    w: 180,
    h: 20,
    speed: 12,
    dx: 0
};

const brickInfo = {
    w: 120,
    h: 30,
    padding: 15,
    offsetY: 70,
    visible: true
};

let brickRowCount = 5;  
let brickColumnCount = 0; 
const bricks = [];

let score = 0;
let speedIncreaseCounter = 0;
let gameRunning = true;

function initBricks() {
    bricks.length = 0;
    brickColumnCount = Math.floor((canvas.width - brickInfo.padding) / (brickInfo.w + brickInfo.padding));
    const totalPadding = (brickColumnCount + 1) * brickInfo.padding;
    const totalBricksWidth = brickColumnCount * brickInfo.w;
    const offsetX = (canvas.width - (totalBricksWidth + totalPadding)) / 2 + brickInfo.padding;

    for (let row = 0; row < brickRowCount; row++) {
        bricks[row] = [];
        for (let col = 0; col < brickColumnCount; col++) {
            let x = offsetX + col * (brickInfo.w + brickInfo.padding);
            let y = row * (brickInfo.h + brickInfo.padding) + brickInfo.offsetY;
            bricks[row][col] = { x, y, ...brickInfo };
        }
    }
}
initBricks();

function updateUI() {
    if (score >= 25) {
        scoreDisplay.textContent = "ІПЗ найкращі!!!";
        scoreDisplay.style.background = "linear-gradient(45deg, #FFD700, #FFA500)";
        scoreDisplay.style.color = "#000";
    } else {
        scoreDisplay.textContent = `Score: ${score}`;
        scoreDisplay.style.background = "";
        scoreDisplay.style.color = "";
    }
    speedDisplay.textContent = `Speed: ${ball.speed}`;
}

function drawScore() {
    ctx.font = "24px Arial";
    ctx.fillStyle = "#ddd";
    if (score >= 25) {
        ctx.fillText("ІПЗ найкращі!!!", 15, 40);
    } else {
        ctx.fillText(`Score: ${score}`, 15, 40);
    }
    ctx.fillText(`Speed: ${ball.speed}`, 15, 75);
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    ctx.fillStyle = '#ff4957';
    ctx.shadowColor = '#ff4957';
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.roundRect(paddle.x, paddle.y, paddle.w, paddle.h, 10);
    ctx.fillStyle = '#30e3ca';
    ctx.shadowColor = '#30e3ca';
    ctx.shadowBlur = 20;
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    bricks.forEach(row => {
        row.forEach(brick => {
            if (brick.visible) {
                const centerX = brick.x + brick.w / 2;
                const centerY = brick.y + brick.h / 2;
                const radius = Math.min(brick.w, brick.h) / 2 - 3;
                
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.fillStyle = '#667eea';
                ctx.shadowColor = '#667eea';
                ctx.shadowBlur = 12;
                ctx.fill();
                ctx.closePath();
                
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius - 8, 0, Math.PI * 2);
                ctx.fillStyle = '#ffffff';
                ctx.fill();
                ctx.closePath();
                
                ctx.beginPath();
                ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
                ctx.fillStyle = '#764ba2';
                ctx.fill();
                ctx.closePath();
            }
        });
    });
}

function movePaddle() {
    paddle.x += paddle.dx;

    if (paddle.x + paddle.w > canvas.width) {
        paddle.x = canvas.width - paddle.w;
    }

    if (paddle.x < 0) {
        paddle.x = 0;
    }
}

function moveBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.x + ball.size > canvas.width || ball.x - ball.size < 0) {
        ball.dx *= -1;
    }

    if (ball.y - ball.size < 0) {
        ball.dy *= -1;
    }

    if (
        ball.x - ball.size > paddle.x &&
        ball.x + ball.size < paddle.x + paddle.w &&
        ball.y + ball.size > paddle.y &&
        ball.y - ball.size < paddle.y + paddle.h
    ) {
        ball.dy = -Math.abs(ball.dy);
        
        const hitPos = (ball.x - paddle.x) / paddle.w;
        ball.dx = ball.speed * (hitPos - 0.5) * 2;
    }

    bricks.forEach(row => {
        row.forEach(brick => {
            if (brick.visible) {
                if (
                    ball.x - ball.size > brick.x &&
                    ball.x + ball.size < brick.x + brick.w &&
                    ball.y + ball.size > brick.y &&
                    ball.y - ball.size < brick.y + brick.h
                ) {
                    ball.dy *= -1;
                    brick.visible = false;
                    increaseScore();
                }
            }
        });
    });

    if (ball.y + ball.size > canvas.height) {
        resetGame();
    }
}

function resetGame() {
    showAllBricks();
    score = 0;
    speedIncreaseCounter = 0;
    ball.speed = 5;
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = 5;
    ball.dy = -5;
    paddle.x = canvas.width / 2 - paddle.w / 2;
    paddle.y = canvas.height - 60;
    updateUI();
}

function showAllBricks() {
    bricks.forEach(row => {
        row.forEach(brick => (brick.visible = true));
    });
}

function increaseScore() {
    score++;
    speedIncreaseCounter++;
    
    if (speedIncreaseCounter >= 10) {
        ball.speed += 1;
        ball.dx = ball.dx > 0 ? ball.speed : -ball.speed;
        ball.dy = ball.dy > 0 ? ball.speed : -ball.speed;
        speedIncreaseCounter = 0;
    }
    
    if (score % (brickRowCount * brickColumnCount) === 0) {
        showAllBricks();
    }
    
    updateUI();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawScore();
    drawBall();
    drawPaddle();
    drawBricks();
}

function update() {
    if (gameRunning) {
        movePaddle();
        moveBall();
        draw();
    }
    requestAnimationFrame(update);
}

document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

function keyDown(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        paddle.dx = paddle.speed;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        paddle.dx = -paddle.speed;
    }
    
    if (e.key === " " || e.key === "Spacebar") {
        gameRunning = !gameRunning;
    }
}

function keyUp(e) {
    if (
        e.key === "Right" ||
        e.key === "ArrowRight" ||
        e.key === "Left" ||
        e.key === "ArrowLeft"
    ) {
        paddle.dx = 0;
    }
}

if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
        this.beginPath();
        this.moveTo(x + radius, y);
        this.lineTo(x + width - radius, y);
        this.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.lineTo(x + width, y + height - radius);
        this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.lineTo(x + radius, y + height);
        this.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.lineTo(x, y + radius);
        this.quadraticCurveTo(x, y, x + radius, y);
        this.closePath();
    };
}

updateUI();
update();
