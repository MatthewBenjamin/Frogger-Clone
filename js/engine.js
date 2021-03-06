/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine is available globally via the Engine variable and it also makes
 * the canvas' context (ctx) object globally available to make writing app.js
 * a little simpler to work with.
 */

var Engine = (function(global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime;

    canvas.width = 505;
    canvas.height = 606;
    doc.body.appendChild(canvas);

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        // Render game mode selection first, then instructions/difficulty selection, then render the game
        if (!currentMode) {
            requestAnimationFrame(modeSelectRender);
        } else if (!instructShown) {
            instructRender();
        } else if (paused) {
            // This freezes the game and waits to be unpaused
        } else {
            /* Call our update/render functions, pass along the time delta to
             * our update function since it may be used for smooth animation.
             */
            update(dt);
            render();
        }


        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
        win.requestAnimationFrame(main);
    }

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        reset();
        lastTime = Date.now();
        main();
    }

     // Called by main()
    function update(dt) {
        if (levelUp) {
            nextLevel();
        }
        updateEntities(dt);
    }

    // Updates all game objects
    function updateEntities(dt) {
        // update hearts, gems, stars, and rocks based on currentMode (located in app.js)
        updateItems[currentMode](dt);

        allEnemies.forEach(function(enemy) {
            enemy.update(dt);
        });

        player.update(dt);
    }

     // Renders game level & objects every game tick
    function render() {
        /* This array holds the relative URL to the image used
         * for that particular row of the game level.
         */
        var rowImages = [
                'images/water-block.png',   // Top row is water
                'images/stone-block.png',   // Row 1 of 3 of stone
                'images/stone-block.png',   // Row 2 of 3 of stone
                'images/stone-block.png',   // Row 3 of 3 of stone
                'images/grass-block.png',   // Row 1 of 2 of grass
                'images/grass-block.png'    // Row 2 of 2 of grass
            ],
            numRows = 6,
            numCols = 5,
            row, col;

        /* Loop through the number of rows and columns we've defined above
         * and, using the rowImages array, draw the correct image for that
         * portion of the "grid"
         */

        // Clear canvas (to prevent images sticking above the water)
        ctx.clearRect(0,0,canvas.width, canvas.height);

        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                /* The drawImage function of the canvas' context element
                 * requires 3 parameters: the image to draw, the x coordinate
                 * to start drawing and the y coordinate to start drawing.
                 * We're using our Resources helpers to refer to our images
                 * so that we get the benefits of caching these images, since
                 * we're using them over and over.
                 */
                ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
            }
        }

        renderEntities();

        // If player dies, show game over screen
        if (player.health <= 0) {
            renderDeath();
        }
    }
    // Renders 'Game Over' screen
    function renderDeath() {
        // change player x/y so it doesn't collide with enemies in bug mode
        player.x = -1000;
        player.y = -1000;
        ctx.fillStyle = 'black';
        ctx.fillRect(100,132,303,249);
        ctx.textAlign = 'center';
        ctx.fillStyle = 'white';
        ctx.font = '34pt Impact';
        ctx.fillText('GAME OVER', canvas.width / 2, 175);
        ctx.font = '20pt Impact';
        ctx.fillText('FINAL SCORE: ' + player.score, canvas.width / 2, 175 + 83);
        ctx.fillText('Press ENTER to play again', canvas.width / 2, 175 + 83 + 83);

        // restart game
        if (resetGame) {
            init();
        }
    }
     // Loop through all game objects and calls their render functions
    function renderEntities() {
        allItems.gems.forEach(function(gem) {
            gem.render();
        });

        allItems.rocks.forEach(function(rock) {
            rock.render();
        });

        allItems.stars.forEach(function(star) {
            star.render();
        });

        allItems.hearts.forEach(function(heart) {
            heart.render();
        });

        allEnemies.forEach(function(enemy) {
            enemy.render();
        });

        player.render();
    }

    // level up in human mode
    function nextLevel() {
        levelUp = false;
        level ++;
        allEnemies.forEach(function(enemy) {
            enemy.levelUp();
        });
        player.levelUp();
        allItems.stars = [];
        allItems.hearts = [];
        allItems.gems = [];
        allItems.rocks = [];
        Rock.initHuman();
    }

    modeSelectRender = function() {
        // clear canvas
        ctx.clearRect(0,0,canvas.width, canvas.height);

        ctx.font = '34pt Impact';
        ctx.textAlign = 'center';
        ctx.fillText('SELECT GAME MODE', canvas.width / 2, 40);
        ctx.fillStyle = 'black';
        ctx.strokeStyle = 'black';

        if (inputPos === 0) {
            // highlight human mode
            ctx.fillRect(canvas.width / 2 - 225,100,200,100);

            // display passive bug mode
            ctx.strokeRect(canvas.width / 2 - 225,250,200,100);

            // display human mode desc
            ctx.font = '18pt Impact';
            ctx.strokeText('Human', canvas.width / 2 + 125, 125);
            ctx.font = '14pt Impact';
            ctx.fillText('Cross the road while', canvas.width / 2 + 125, 150);
            ctx.fillText('avoiding the ladybugs', canvas.width / 2 + 125, 170);
        } else if (inputPos === 1) {
            // passive human mode
            ctx.strokeRect(canvas.width / 2 - 225,100,200,100);

            // highlight bug mode
            ctx.fillRect(canvas.width / 2 - 225,250,200,100);

            // display bug mode desc
            ctx.font = '18pt Impact';
            ctx.strokeText('Bug', canvas.width / 2 + 125, 125);
            ctx.font = '14pt Impact';
            ctx.fillText('Prevent the humans from', canvas.width / 2 + 125, 150);
            ctx.fillText('crossing the road', canvas.width / 2 + 125, 170);
        }

        ctx.font = '18pt Impact';
        ctx.strokeRect(canvas.width / 2 + 25,100,200,250);

        // select screen instructions
        ctx.strokeRect(canvas.width / 2 - 225, 375, 450, 100);
        ctx.fillText('Directions', canvas.width / 2, 400);
        ctx.fillText('Use UP and DOWN arrows to toggle selection', canvas.width / 2, 430);
        ctx.fillText('Press ENTER to select game mode', canvas.width / 2, 460);

    };

    instructShown = false;
    instructRender = function() {
        ctx.clearRect(0,0,canvas.width, canvas.height);

        if (inputPos === 0) {
            ctx.fillRect(canvas.width / 2 - 250, 200 , 150, 100);
            ctx.strokeRect(canvas.width / 2 -75, 200 , 150, 100);
            ctx.strokeRect(canvas.width / 2 +100, 200 , 150, 100);
            ctx.fillText('EASY', canvas.width / 2, 350);
        } else if (inputPos === 1) {
            ctx.strokeRect(canvas.width / 2 - 250, 200 , 150, 100);
            ctx.fillRect(canvas.width / 2 -75, 200 , 150, 100);
            ctx.strokeRect(canvas.width / 2 +100, 200 , 150, 100);
            ctx.fillText('MEDIUM', canvas.width / 2, 350);
        } else if (inputPos === 2) {
            ctx.strokeRect(canvas.width / 2 - 250, 200 , 150, 100);
            ctx.strokeRect(canvas.width / 2 -75, 200 , 150, 100);
            ctx.fillRect(canvas.width / 2 +100, 200 , 150, 100);
            ctx.fillText('HARD', canvas.width / 2, 350);
        }

        ctx.font = '34pt Impact';
        ctx.textAlign = 'center';
        ctx.fillText('INSTRUCTIONS:', canvas.width / 2, 40);
        ctx.font = '18pt Impact';

        if (currentMode === 'human') {
            ctx.fillText('Cross the road while avoiding ladybugs.', canvas.width / 2 , 80);
            ctx.fillText('Stars will briefly make you invincible.', canvas.width / 2 , 105);

        } else {
            ctx.fillText('Prevent the humans from crossing the road.', canvas.width / 2 , 80);
            ctx.fillText('Stars kill all humans and create rocks.', canvas.width / 2 , 105);
        }
        ctx.fillText('Collect gems for extra points.', canvas.width / 2 , 155);
        ctx.fillText('Collect hearts to increase your health.', canvas.width / 2 , 130);
        ctx.fillText('Rocks will block your path.', canvas.width / 2 , 180);
        ctx.fillText('Press ENTER to select difficulty and start the game', canvas.width / 2, 400);
    };

    // Resets game state variables (to start a new game)
    function reset() {
        level = 1;
        levelUp = false;
        currentMode = null;
        currentDiff = null;
        instructShown = false;
        inputPos = 0;
        allEnemies = [];
        allItems.gems = [];
        allItems.rocks = [];
        allItems.stars = [];
        allItems.hearts = [];
        resetGame = false;
   }

    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load([
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',
        'images/enemy-bug.png',
        'images/char-boy.png',
        'images/char-cat-girl.png',
        'images/char-horn-girl.png',
        'images/char-pink-girl.png',
        'images/char-princess-girl.png',
        'images/Gem-Orange.png',
        'images/Gem-Green.png',
        'images/Gem-Blue.png',
        'images/Heart.png',
        'images/Small-Heart.png',
        'images/Not-a-Heart.png',
        'images/Rock.png',
        'images/Star.png',
        'images/Selector.png'
    ]);
    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developer's can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;
})(this);