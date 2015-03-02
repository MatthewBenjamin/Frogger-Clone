/* *** TO DOs: ***

Basic Functionality:
-levels
-score

1   add helper functions (refactor gen player and enemy classes) to
    gameMode.human & gameMode.bug
    move difficulty object into gameMode.diffculty
2
    Implement Gems
        Human Mode: Generate upon next level(possibly with timer before appearing) - level and difficulty determine # and type
            i.e. var i = x - level, for (var a =0; i, a+=1) {equation for randomly picking if gem and type based on difficulty}
        Bug Mode: trigger potential generations occasionality based on dynamic levels (when certain score is reached)
            so, the better you play the higher potential for ALL items(score mod # based on difficulty & level)

        different gems give different benefits? - points, extra points when killing enemies, extra health/attack
3
    Implement Stars
        Human: generate upon next level(possibly with timer before appearing) - level and difficulty determine features (like gems) - star with player invinciblity upon contact
        Bug: star kills all humans upon player contact
4
    Rocks
        Human: generate upon next level based on level and difficulty like above
                rock blocks player movement
        Gem: generate the same way
                detroys all humans that come into contact with it
                possibly make it so player and hold onto and drop rocks later
5
    Character Selection
        select which character sprite during initial game setup (after instructions?)
6
    Character Traits
        different characters will have different traits
        i.e. Health & Speed(hold down arrow keys - use keydown instead of keyup) for human mode
                Speed & Attack for bug mode
7
    Character Creator
        player assigns character sprite and trait points
*/

var modeSelect= {};
//modeSelect.gameMode;

//TO DO: add helper functions to
//gameMode.human & gameMode.bug
//move difficulty object into gameMode.diffculty ?
var gameMode = {};
gameMode.mode;
gameMode.human = {};
gameMode.bug = {};
//gameMode.difficulty = {};
var inputPos = 0;

//features to implement: player characteristics: speed(?), health (human), attack (bug)

// Higher difficulty --> more enemies, less health
var difficulty = {}
difficulty.current;
difficulty.modes = {
    0 : "easy",
    1 : "medium",
    2 : "hard"
}
var instructions = {}
var paused = false;

var rows = [60, 140, 220];
var columns = [0, 100, 200, 300, 400];

//TO DO: refactor enemy objects to use these - ***THIS DOESN"T WORK - this.x/y points to function, not what
//the function returns
var randomArray = function(inputArray) {
    var decision = Math.floor(Math.random() * inputArray.length);
    return inputArray[decision];
}


//TO DO: implement level function in human mode, higher level --> faster enemies
//bug mode won't have discrete levels, instead it will progressively get harder as each enemy is killed
var level;
var score;
var allEnemies = [];
var allGems = [];
var player;

//ROCKS, STARS, & GEMS should NOT occupy the same same (implement this after everything else works?)
//Generate these objects in nextlevel function!
//refactor gems help vars into Gem object?
var gemSprites = {
    0 : 'images/Gem Orange.png',
    1 : 'images/Gem Green.png',
    2 : 'images/Gem Blue.png'
}

var gemPoints = {
    0 : 5,
    1 : 10,
    2 : 20
}
var Gem = function() {
    //TO DO:
    //pop up randomly like stars but more likely
    // randomly pick value 0 - 2
    //this.gemClass = Math.floor(Math.random() * 3); change this to make higher classes rarer or incoporate into generateGems function
    this.sprite = gemSprites[0];
    //this.points/value = gemPoints[gemClass]
    this.x = randomArray(columns); //200; //randomRow;
    this.y = randomArray(rows); //randomCol;
    // ----update to check for collision (or put in player update?)
}

Gem.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

function generateGems() {
    //TO DO: make genAttempts global to vary it based on difficulty? or just vary success rate?
    var genAttempts = 5;
    for (var i=0; i < genAttempts; i++) {

    }
    allGems.push(new Gem);
}

generateGems();

var Star = function() {
    //TO DO:
    //randomly assign if (and when? - every tick X % chance star is created)
    //this.sprite = 'images/Star.png';
    //this.x = randomRow();
    //this.y = randomCol();
    //prototype render
    //if collision with player, player invincible for certain time period (possibly implement this in player update)
}

var Rock = function() {
    //TO DO:
    //rocks appear at the beginning of a new level (don't appear randomly like stars and gems)
    //random chance that they appear (goes up with difficulty/level)
    //this.x = randomRow();
    //this.y = randomCol();
    //blocks player movement (but not enemy movement)
    //this.x = this.randomX() -OR- randomX(); and use randomX for Stars, rocks, and gems
    //this.y same as this.x but separate Y function
}

var enemySprites = {};
enemySprites.bug = [
    'images/char-boy.png',
    'images/char-cat-girl.png',
    'images/char-horn-girl.png',
    'images/char-pink-girl.png',
    'images/char-princess-girl.png'
]
enemySprites.human = 'images/enemy-bug.png'
enemySprites.choose = function() {
    if (gameMode.mode === 'human') {
        return enemySprites.human;
    } else {
        return randomArray(enemySprites.bug);
    }
}

//TO DO: fine tune startMin/Max, speed params
function makeEnemies() {
    var startMin;
    var startMax;
    if (gameMode.mode === 'human') {
        startMin = -100
        startMax = 500
    } else {
        startMin = 300
        startMax = 600
    }

    var Enemy = function() {
        this.sprite = this.chooseSprite();
        this.speed = this.randomSpeed(10,5);    //TO DO: var baseSpeed & modifySpeed ?
        if (gameMode.mode === "human") {
                this.x = this.startPos(startMin, startMax);
                this.y = this.randomLane(rows);

        } else {
            this.x = this.randomLane(columns);
            this.y = this.startPos(startMin, startMax);
        }
    }

    Enemy.prototype.chooseSprite = function() {
        if (gameMode.mode === 'human') {
            return enemySprites.human;
        } else {
            return randomArray(enemySprites.bug);
        }
    }
    //same
    Enemy.prototype.randomSpeed = function (base, modifier) {
        var base = base;
        var modifier = Math.floor(Math.random() * modifier + 1);
        return base * modifier;   
    }

    //same
    Enemy.prototype.startPos = function(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);   
    }

    //TO DO: do I need this? randomArray
    Enemy.prototype.randomLane = function (lanes) {
            var decision = Math.floor(Math.random() * lanes.length);
            return lanes[decision];            
    }

    //update method
    //combine?
    if (gameMode.mode === "human") { 
        Enemy.prototype.update = function (dt) {
            // You should multiply any movement by the dt parameter
            // which will ensure the game runs at the same speed for
            // all computers.

            // if enemy has traversed entire area, reset values (randomly)
            if (this.x > 505) {
                this.x = -100   //TO DO: make this random?
                this.y = this.randomLane(rows);
                this.speed = this.randomSpeed(10,10);
            } else {
                this.x += this.speed * dt;
            }
        }
    } else {
        //bug mode
        Enemy.prototype.update = function (dt) {
                //TO DO: proper speed modification
                // if enemy has traversed entire area, LOSE
                if (this.x === player.x && this.y > player.y -40 && this.y < player.y + 40) {
                    this.y = this.startPos(500,1000);
                    this.sprite = this.chooseSprite();
                    this.speed += 10;
                }
                else if (this.y <= -200) {
                    this.y = this.startPos(500,1000);
                    this.sprite = this.chooseSprite();
                    this.speed += 10;
                } else {
                    this.y -= this.speed * dt;
                }
            }
    }

    // ***all below is the same***

    // Draw the enemy on the screen, required method for game
    Enemy.prototype.render = function() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }

    var numOfEnemies;
    if (difficulty.current === 'easy') {
        numOfEnemies = 6;
    } else if (difficulty.current === 'medium') {
        numOfEnemies = 9;
    } else if (difficulty.current === 'hard') {
        numOfEnemies = 12;
    }

    for (var i = 0; i < numOfEnemies; i++) {
        var newEnemy = new Enemy;
        allEnemies.push(newEnemy);
    }
}

var upperBounds;
var lowerBounds;

function playerSprite() {
    if (gameMode.mode === 'human') {
        //TO DO: add charaction sprite selection(use object points to sprites)
        return 'images/char-boy.png';
    } else {
        return 'images/enemy-bug.png';
    }
}

function startY() {
    if (gameMode.mode === 'human') {
        return 300;
    } else {
        return 140;
    }
}

function makePlayer() {

    var Player = function() {
        this.sprite = playerSprite();
        this.x = 200;
        this.y = startY();
    }

    //update functions
    //diff
    if (gameMode.mode === "human") {
        Player.prototype.update = function(dt) {
            //collision detection
            for (var e = 0; e < allEnemies.length; e++) {
                if (this.y === allEnemies[e].y && this.x < allEnemies[e].x + 80 && this.x > allEnemies[e].x -80) {
                    this.x = 200;
                    this.y = 300;
                }
            }
            if (this.y === -100) {
                //set off next level here
                this.x = 200;
                this.y = 300;
            }
        }
    } else {
        //TO DO: put something here or edit game engine
        //put score check to set up dyanmic level items here? --> yes b/c no objects = nowhere else to perform update(except engine)?
        //TO DO: add direction attribute and change img according to direction
        Player.prototype.update = function(dt) {}
    }

    //same
    Player.prototype.render = function() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }

    //same
    if (gameMode.mode === "human") {
        upperBounds = -100;
        lowerBounds = 380;
    } else {
        upperBounds = 60;
        lowerBounds = 220;
    }
    Player.prototype.handleInput = function (input) {
        //x 100
        //y 80
        // ** TODO: if reach water, next level!
        if (input === 'enter') {
            if (paused) {
                paused = false;
            } else {
                paused = true;
            }
        } 
        if (!paused) {
            if (input === 'up' && this.y !== upperBounds) {
                this.y -= 80;
            } else if (input === 'down' && this.y !== lowerBounds) {
                this.y += 80;
            } else if (input === 'left' && this.x !== 0) {
                this.x -= 100;
            } else if (input === 'right' && this.x !== 400) {
                this.x += 100;
            }
        }
    }

    player = new Player;
}
//one function to make all game objects, or just one function for, enemy, player, star, etc. ?
function makeGameObjects() {
    makeEnemies();
    makePlayer();
}

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    // *** added 'enter' key ***
    var allowedKeys = {
        13: 'enter',
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    var key = allowedKeys[e.keyCode];

    if (!gameMode.mode) {
        modeInput(key);
    } else if (!instructions.shown) {
        instructInput(key);
    } else {
        player.handleInput(allowedKeys[e.keyCode]);    
    }
    
});

function modeInput(input) {
    //up & down keys toggle focus
    if (input === 'down' && inputPos === 0) {
            inputPos += 1;
    } else if (input === 'up' && inputPos === 1) {
            inputPos = 0;
    } else if (input === 'enter') {
        //use json here for possible game modes instead of more if statements?
        //ie gameMode.mode = modeSelect.possibleModes[inputPos];
        if (inputPos === 0) {
            gameMode.mode = 'human';
        } else if (inputPos === 1) {
            gameMode.mode = 'bug';
        } else {
            console.log("ERROR modeSelect.handleInput");
        }
    }
};

function instructInput(input){
    if (input === 'right' && (inputPos === 0 || inputPos === 1)) {
        inputPos += 1;
    } else if (input === 'left' && (inputPos === 1 || inputPos === 2)) {
        inputPos -= 1;
    } else if (input === 'enter') {
        difficulty.current = difficulty.modes[inputPos]
        makeGameObjects();
        //paused = false;
        instructions.shown = true;
    }
}