function updateAIPaddle(ball, ai, canvas, paddleHeight, deltaTime, player_location) {
    if (ball.speedX > 0) {
        // predict where the ball will land on AI's side
        let timeToReach = (ai.x - ball.x) / ball.speedX;
        let predictedY = ball.y + ball.speedY * timeToReach;

        // ball bouncing off top and bottom walls
        while (predictedY < 0 || predictedY > canvas.height) {
            if (predictedY < 0) predictedY = -predictedY;
            else if (predictedY > canvas.height) predictedY = 2 * canvas.height - predictedY;
        }

        // calculate and try to hit as far from current player as possible
        let playerCenterY = player_location + paddleHeight / 2;
        let furthestY = (playerCenterY < canvas.height / 2) ? 0 : canvas.height;
        let distanceToPlayerSide = canvas.width - ai.x;
        let timeToPlayerSide = distanceToPlayerSide / Math.abs(ball.speedX);
        let deltaYNeeded = furthestY - predictedY;
        let requiredSpeedY = deltaYNeeded / timeToPlayerSide;

        let bounceAdjustedY = furthestY;
        let bounces = 0;
        while (bounceAdjustedY < 0 || bounceAdjustedY > canvas.height) {
            if (bounceAdjustedY < 0) bounceAdjustedY = -bounceAdjustedY;
            else if (bounceAdjustedY > canvas.height) bounceAdjustedY = 2 * canvas.height - bounceAdjustedY;
            bounces++;
        }
        let effectiveDeltaY = (bounces % 2 === 0) ? furthestY - predictedY : - (furthestY - predictedY);
        requiredSpeedY = effectiveDeltaY / timeToPlayerSide;

        let maxBounceAngle = Math.PI / 3;
        let ballSpeedMagnitude = Math.sqrt(ball.speedX * ball.speedX + ball.speedY * ball.speedY);
        let maxSpeedY = ballSpeedMagnitude * Math.tan(maxBounceAngle);

        requiredSpeedY = Math.max(-maxSpeedY, Math.min(maxSpeedY, requiredSpeedY));

        let hitPosition = requiredSpeedY / maxSpeedY * 0.5;
        let targetY = predictedY - paddleHeight / 2 + hitPosition * paddleHeight;

        targetY = Math.max(0, Math.min(canvas.height - paddleHeight, targetY));

        // apply movement
        const speedScale = deltaTime / (1000 / 60);
        const moveSpeed = ai.speed * speedScale;

        if (ai.y < targetY && ai.y < canvas.height - paddleHeight) {
            ai.y += Math.min(moveSpeed, targetY - ai.y);
        } else if (ai.y > targetY && ai.y > 0) {
            ai.y -= Math.min(moveSpeed, ai.y - targetY);
        }
    }
}
