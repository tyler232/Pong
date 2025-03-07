function updateAIPaddle(ball, ai, canvas, paddleHeight) {
    if (ball.speedX > 0) { // only predict when ball is moving toward AI
        let timeToReach = (ai.x - ball.x) / ball.speedX;
        let predictedY = ball.y + ball.speedY * timeToReach; // predicted Y position

        while (predictedY < 0 || predictedY > canvas.height) {
            if (predictedY < 0) predictedY = -predictedY;
            else if (predictedY > canvas.height) predictedY = 2 * canvas.height - predictedY; // Bounce off bottom
        }

        let randomOffset = (Math.random() - 0.5) * paddleHeight;
        let targetY = predictedY - paddleHeight / 2 + randomOffset;

        let reactionDelay = 0.1;
        let errorMargin = Math.random() * 20 - 10;
        targetY += errorMargin;

        // move paddle toward target
        if (ai.y < targetY && ai.y < canvas.height - paddleHeight) {
            ai.y += Math.min(ai.speed * (1 + reactionDelay), targetY - ai.y);
        } else if (ai.y > targetY && ai.y > 0) {
            ai.y -= Math.min(ai.speed * (1 + reactionDelay), ai.y - targetY);
        }
    }
}
