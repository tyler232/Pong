document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('pongCanvas');
    const ctx = canvas.getContext('2d');

    const refSize = Math.min(canvas.width, canvas.height);

    const ball = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: refSize * 0.013,
        speedX: refSize * 0.013,
        speedY: refSize * 0.013,
        firstCollision: true
    };

    const paddleWidth = refSize * 0.015;
    const paddleHeight = refSize * 0.13;

    const player = {
        x: refSize * 0.08,
        y: canvas.height / 2 - paddleHeight / 2,
        score: 0,
        speed: refSize * 0.013
    };

    const ai = {
        x: canvas.width - refSize * 0.08 - paddleWidth,
        y: canvas.height / 2 - paddleHeight / 2,
        score: 0,
        speed: refSize * 0.0065
    };

    let keys = { ArrowUp: false, ArrowDown: false };

    const winningScore = 11;
    let gameOver = false;

    document.addEventListener('keydown', (e) => {
        if (e.key in keys) keys[e.key] = true;
        if (e.key === 'r' && gameOver) restartGame();
    });

    document.addEventListener('keyup', (e) => {
        if (e.key in keys) keys[e.key] = false;
    });

    function update() {
        if (gameOver) return;

        if (keys.ArrowUp && player.y > 0) player.y -= player.speed;
        if (keys.ArrowDown && player.y < canvas.height - paddleHeight) player.y += player.speed;

        updateAIPaddle(ball, ai, canvas, paddleHeight);

        ball.x += ball.speedX;
        ball.y += ball.speedY;

        if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
            ball.speedY = -ball.speedY * 1.1;
        }

        let speedIncrease = ball.firstCollision ? refSize * 0.0033 : refSize * 0.0008;

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
            resetBall();
        } else if (ball.x > canvas.width) {
            player.score++;
            checkWinner();
            resetBall();
        }
    }

    function checkWinner() {
        if (
            (player.score >= winningScore || ai.score >= winningScore) &&
            Math.abs(player.score - ai.score) >= 2
        ) {
            gameOver = true;
        }
    }

    function resetBall() {
        if (gameOver) return;
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.speedX = (-ball.speedX > 0 ? refSize * 0.013 : -refSize * 0.013);
        ball.speedY = refSize * 0.013 * (ball.speedY > 0 ? 1 : -1);
        ball.firstCollision = true;
    }

    function draw() {
        console.log('Drawing frame...');

        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

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
                player.score > ai.score ? "Player Wins!" : "AI Wins!",
                canvas.width / 2 - refSize * 0.16,
                canvas.height / 2
            );
            ctx.font = `${refSize * 0.04}px Arial`;
            ctx.fillText("Press R to Restart", canvas.width / 2 - refSize * 0.13, canvas.height / 2 + refSize * 0.067);
        }
    }

    function restartGame() {
        player.score = 0;
        ai.score = 0;
        gameOver = false;
        resetBall();
    }

    function gameLoop() {
        if (!gameOver) {
            update();
        }
        draw();
        requestAnimationFrame(gameLoop);
    }

    gameLoop();
});
