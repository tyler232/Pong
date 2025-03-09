document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('pongCanvas');
    const ctx = canvas.getContext('2d');

    const refSize = Math.min(canvas.width, canvas.height);
    const INITIAL_BALL_SPEED_X = refSize * 0.005;
    const INITIAL_BALL_SPEED_Y = refSize * 0.005;

    const ball = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: refSize * 0.013,
        speedX: -INITIAL_BALL_SPEED_X,
        speedY: INITIAL_BALL_SPEED_Y,
        firstCollision: true
    };

    const paddleWidth = refSize * 0.015;
    const paddleHeight = refSize * 0.13;

    const player = {
        x: refSize * 0.08,
        y: canvas.height / 2 - paddleHeight / 2,
        score: 0,
        speed: refSize * 0.02,
        reactionTimer: 0,
        targetY: canvas.height / 2 - paddleHeight / 2,
        lastUpdate: 0
    };

    const ai = {
        x: canvas.width - refSize * 0.08 - paddleWidth,
        y: canvas.height / 2 - paddleHeight / 2,
        score: 0,
        speed: refSize * 0.015
    };

    let keys = { ArrowUp: false, ArrowDown: false };
    let paused = false;
    let isStarted = false;
    const winningScore = 11;
    let gameOver = false;

    let lastTime = performance.now();

    document.addEventListener('keydown', (e) => {
        if (e.key in keys) keys[e.key] = true;
        if (e.key === 'r' && gameOver) restartGame();
        if (e.key === 'Escape') paused = !paused;
        if (e.key === ' ' && !isStarted) isStarted = true;
    });

    document.addEventListener('keyup', (e) => {
        if (e.key in keys) keys[e.key] = false;
    });

    function update(deltaTime) {
        if (gameOver) return;

        const speedScale = deltaTime / (1000 / 60);

        if (keys.ArrowUp && player.y > 0) player.y -= player.speed * speedScale;
        if (keys.ArrowDown && player.y < canvas.height - paddleHeight) player.y += player.speed * speedScale;

        updateAIPaddle(ball, ai, canvas, paddleHeight, deltaTime, player.y);

        ball.x += ball.speedX * speedScale;
        ball.y += ball.speedY * speedScale;

        if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
            ball.speedY = -ball.speedY * 1.1;
        }

        let speedIncrease = ball.firstCollision ? refSize * 0.01 : refSize * 0.001;

        if (
            ball.x - ball.radius < player.x + paddleWidth &&
            ball.y > player.y && ball.y < player.y + paddleHeight &&
            ball.speedX < 0
        ) {
            ball.speedX = -ball.speedX;
            let hitPosition = (ball.y - player.y) / paddleHeight;
            ball.speedY = (hitPosition - 0.5) * 15;
            ball.speedX += speedIncrease;
            ball.speedY += speedIncrease * (ball.speedY > 0 ? 1 : -1);
            ball.x = player.x + paddleWidth + ball.radius;
            ball.firstCollision = false;
        }

        if (
            ball.x + ball.radius > ai.x &&
            ball.y > ai.y && ball.y < ai.y + paddleHeight &&
            ball.speedX > 0
        ) {
            ball.speedX = -ball.speedX;
            let hitPosition = (ball.y - ai.y) / paddleHeight;
            ball.speedY = (hitPosition - 0.5) * 15;
            ball.speedX -= speedIncrease;
            ball.speedY -= speedIncrease * (ball.speedY > 0 ? 1 : -1);
            ball.x = ai.x - ball.radius;
            ball.firstCollision = false;
        }

        if (ball.x < 0) {
            ai.score++;
            checkWinner();
            resetBall('ai');
        } else if (ball.x > canvas.width) {
            player.score++;
            checkWinner();
            resetBall('player');
        }
    }

    function checkWinner() {
        if (
            isStarted &&
            (player.score >= winningScore || ai.score >= winningScore) &&
            Math.abs(player.score - ai.score) >= 2
        ) {
            gameOver = true;
        }
    }

    function resetBall(winner) {
        if (gameOver) return;

        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;

        if (winner === 'player') {
            ball.speedX = -INITIAL_BALL_SPEED_X;
        } else if (winner === 'ai') {
            ball.speedX = INITIAL_BALL_SPEED_X;
        }

        ball.speedY = INITIAL_BALL_SPEED_Y * (Math.random() > 0.5 ? 1 : -1);
        ball.firstCollision = true;
    }

    function draw() {
        console.log('Drawing frame...');

        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (!isStarted) {
            ctx.fillStyle = 'white';
            ctx.font = `${refSize * 0.08}px Arial`;
            ctx.fillText("Pong", canvas.width / 2 - refSize * 0.08, canvas.height / 2 - refSize * 0.067);
            ctx.font = `${refSize * 0.04}px Arial`;
            ctx.fillText("Press Space to Start", canvas.width / 2 - refSize * 0.15, canvas.height / 2 + refSize * 0.067);
            return;
        }

        ctx.setLineDash([5, 15]);
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.strokeStyle = 'white';
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.closePath();

        ctx.fillStyle = 'white';
        ctx.fillRect(player.x, player.y, paddleWidth, paddleHeight);
        ctx.fillRect(ai.x, ai.y, paddleWidth, paddleHeight);

        ctx.font = `${refSize * 0.053}px Arial`;
        ctx.fillText(player.score, canvas.width / 4, refSize * 0.083);
        ctx.fillText(ai.score, 3 * canvas.width / 4, refSize * 0.083);

        if (gameOver) {
            ctx.font = `${refSize * 0.08}px Arial`;
            ctx.fillText(
                player.score > ai.score ? "You Won!" : "You Lost",
                canvas.width / 2 - refSize * 0.16,
                canvas.height / 2
            );
            ctx.font = `${refSize * 0.04}px Arial`;
            ctx.fillText("Press R to Restart", canvas.width / 2 - refSize * 0.13, canvas.height / 2 + refSize * 0.067);
        }

        if (paused && !gameOver) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'white';
            ctx.font = `${refSize * 0.08}px Arial`;
            ctx.fillText("Paused", canvas.width / 2 - refSize * 0.1, canvas.height / 2);
            ctx.font = `${refSize * 0.04}px Arial`;
            ctx.fillText("Press Esc to Resume", canvas.width / 2 - refSize * 0.15, canvas.height / 2 + refSize * 0.067);
        }
    }

    function restartGame() {
        player.score = 0;
        ai.score = 0;
        gameOver = false;
        isStarted = true;
        resetBall('player');
    }

    function gameLoop(currentTime) {
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;

        if (!paused && !gameOver) {
            update(deltaTime);
        }
        draw();
        requestAnimationFrame(gameLoop);
    }
    
    gameLoop(performance.now());
});
