function updateAIPaddle(ball, ai, canvas, paddleHeight, deltaTime, player_location) {
    const reactionDelay = 100; // milliseconds
    ai.reactionTimer = ai.reactionTimer || 0;
    ai.targetY = ai.targetY || ai.y;

    if (ball.speedX > 0) {
        ai.reactionTimer += deltaTime;
        if (ai.reactionTimer >= reactionDelay) {
            // predict where the ball will land on AI's side
            let timeToReach = (ai.x - ball.x) / ball.speedX;
            let predictedY = ball.y + ball.speedY * timeToReach;

            // ball bouncing off top and bottom walls
            while (predictedY < 0 || predictedY > canvas.height) {
                if (predictedY < 0) predictedY = -predictedY;
                else if (predictedY > canvas.height) predictedY = 2 * canvas.height - predictedY;
            }

            // calculate and try to hit as far from current player as possible using four contact point
            const hitPositions = [-0.45, -0.25, 0, 0.25, 0.45];

            const maxBounceAngle = Math.PI / 3;
            const ballSpeedMagnitude = Math.sqrt(ball.speedX * ball.speedX + ball.speedY * ball.speedY);

            let bestTargetY = ai.y;
            let bestDistance = -Infinity;

            for (let relativePos of hitPositions) {
                let bounceAngle = relativePos * maxBounceAngle;

                let newSpeedX = -Math.abs(ballSpeedMagnitude * Math.cos(bounceAngle)); // go back to player
                let newSpeedY = ballSpeedMagnitude * Math.sin(bounceAngle);

                let distanceToPlayer = ai.x - 0; // distance from ai to player
                let timeToPlayer = distanceToPlayer / Math.abs(newSpeedX);
                let landingY = predictedY + newSpeedY * timeToPlayer;

                while (landingY < 0 || landingY > canvas.height) {
                    if (landingY < 0) landingY = -landingY;
                    else if (landingY > canvas.height) landingY = 2 * canvas.height - landingY;
                }

                let playerCenterY = player_location + paddleHeight / 2;
                let distanceFromPlayer = Math.abs(landingY - playerCenterY);

                if (distanceFromPlayer > bestDistance) {
                    bestDistance = distanceFromPlayer;
                    bestTargetY = predictedY - paddleHeight / 2 + relativePos * paddleHeight;
                }
            }

            ai.targetY = Math.max(0, Math.min(canvas.height - paddleHeight, bestTargetY));
            
            ai.reactionTimer = 0;
        }

        // apply movement
        const speedScale = deltaTime / (1000 / 60);
        const moveSpeed = ai.speed * speedScale;
        const reactionFactor = 0.1;

        const distanceToTarget = ai.targetY - ai.y;
        const movement = distanceToTarget * reactionFactor * speedScale;
        
        if (Math.abs(movement) > 0.1) { // minimum movement threshold
            ai.y += Math.min(Math.max(movement, -moveSpeed), moveSpeed);
            ai.y = Math.max(0, Math.min(canvas.height - paddleHeight, ai.y));
        }
        
    } else {
        // reset when ball is moving away
        ai.reactionTimer = 0;
        ai.targetY = canvas.height / 2 - paddleHeight / 2;
    }
}
