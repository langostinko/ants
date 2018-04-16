var myGameArea = {
    UPDATE_INTERVAL: 50,
    CELL_SIZE: 5,
    MAP_WIDTH: 100,
    MAP_HEIGHT: 100,

    canvas : document.createElement("canvas"),
    nestSmellMatrix: [],
    foodSmellMatrix: [],
    foodMatrix: [],
    nest: null,
    myAnts: [],
    myFoods: [],

    start : function() {
        this.canvas.width = this.MAP_WIDTH * this.CELL_SIZE;
        this.canvas.height = this.MAP_HEIGHT * this.CELL_SIZE;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.frameNo = 0;
        this.interval = setInterval(updateGameArea, this.UPDATE_INTERVAL);

        for (var i = 0; i < this.MAP_WIDTH; i += 1) {
            this.nestSmellMatrix[i] = new Array(this.MAP_HEIGHT);
            for (var j = 0; j < this.MAP_HEIGHT; j += 1) {
                this.nestSmellMatrix[i][j] = 0
            }
        }

        for (var i = 0; i < this.MAP_WIDTH; i += 1) {
            this.foodSmellMatrix[i] = new Array(this.MAP_HEIGHT);
            for (var j = 0; j < this.MAP_HEIGHT; j += 1) {
                this.foodSmellMatrix[i][j] = 0
            }
        }

        for (var i = 0; i < this.MAP_WIDTH; i += 1) {
            this.foodMatrix[i] = new Array(this.MAP_HEIGHT);
        }
    },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function startGame() {
    myGameArea.nest = new Nest(240, 240);

    myGameArea.myAnts.push(new Ant(250, 250));

    myGameArea.myFoods.push(new Food(230, 200));
    myGameArea.myFoods.push(new Food(400, 400));
    myGameArea.myFoods.push(new Food(350, 100));
    myGameArea.myFoods.push(new Food(50, 200));

    myGameArea.start();
}

function Nest(x, y) {
    this.color = "brown"
    this.width = 2 * myGameArea.CELL_SIZE;
    this.height = 2 * myGameArea.CELL_SIZE;
    this.x = x;
    this.y = y;
    this.foods = 0
    this.update = function() {
        ctx = myGameArea.context;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        var nestX = Math.floor(this.x / myGameArea.CELL_SIZE)
        var nestY = Math.floor(this.y / myGameArea.CELL_SIZE)
        myGameArea.nestSmellMatrix[nestX][nestY] = 2
        while (this.foods >= 5) {
            myGameArea.myAnts.push(new Ant(250, 250))
            this.foods -= 5
        }
    }
}

function Food(x, y) {
    this.color = "green"
    this.width = 1 * myGameArea.CELL_SIZE;
    this.height = 1 * myGameArea.CELL_SIZE;
    this.x = x;
    this.y = y;
    this.count = 20
    this.update = function() {
        ctx = myGameArea.context;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        var foodX = Math.floor(this.x / myGameArea.CELL_SIZE)
        var foodY = Math.floor(this.y / myGameArea.CELL_SIZE)
        myGameArea.foodMatrix[foodX][foodY] = 1
    }
    this.eated = function() {
        var foodX = Math.floor(this.x / myGameArea.CELL_SIZE)
        var foodY = Math.floor(this.y / myGameArea.CELL_SIZE)
        this.count -= 1
        if (!this.count) {
            myGameArea.foodMatrix[foodX][foodY] = 0
        }
    }
}

function Ant(x, y) {
    this.STATE_ENUM = {"SEARCH_FOOD":0, "SEARCH_NEST":1}
    this.width = 1 * myGameArea.CELL_SIZE;
    this.height = 1 * myGameArea.CELL_SIZE;
    this.speed = 0.5 * myGameArea.CELL_SIZE;
    this.smellR = 5;
    this.seeR = 5;
    this.randomStep = 0.3;

    this.state = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.smellPower = 1;
    this.withFood = false
    this.lastRandomStepTS = 0
    this.x = x;
    this.y = y;

    this.update = function() {
        ctx = myGameArea.context;
        if (this.withFood) {
            ctx.fillStyle = "red"
        } else {
            ctx.fillStyle = "orange"
        }
        ctx.fillRect(this.x, this.y, this.width, this.height);
        var antX = Math.floor(this.x / myGameArea.CELL_SIZE)
        var antY = Math.floor(this.y / myGameArea.CELL_SIZE)
        if (this.withFood) {
            myGameArea.foodSmellMatrix[antX][antY] = Math.max(
                myGameArea.foodSmellMatrix[antX][antY]
                , this.smellPower
            )
        } else {
            myGameArea.nestSmellMatrix[antX][antY] = Math.max(
                myGameArea.nestSmellMatrix[antX][antY]
                , this.smellPower
            )
        }
        this.smellPower *= 0.998
    }
    this.smell = function(ts) {
        var antX = Math.floor(this.x / myGameArea.CELL_SIZE)
        var antY = Math.floor(this.y / myGameArea.CELL_SIZE)
        if (this.targetX || this.targetY) {
            if (antX != this.targetX || antY != this.targetY) {
                return
            }
        }
        this.targetX = 0;
        this.targetY = 0;

        if (this.state == this.STATE_ENUM['SEARCH_FOOD'] && this.smellPower < 0.5) {
            this.state = this.STATE_ENUM['SEARCH_NEST']
        }

        if (this.state == this.STATE_ENUM['SEARCH_FOOD']) {
            for (var i = Math.max(-this.seeR, -antX); i <= Math.min(this.seeR, myGameArea.MAP_WIDTH - 1 - antX); i += 1) {
                for (var j = Math.max(-this.seeR, -antY); j <= Math.min(this.seeR, myGameArea.MAP_HEIGHT - 1 - antY); j += 1) {
                    if (myGameArea.foodMatrix[antX + i][antY + j]) {
                        this.targetX = antX + i;
                        this.targetY = antY + j;
                    }
                }
            }
        }

        if (this.targetX == 0 && this.targetY == 0 && (ts - this.lastRandomStepTS > 10)) {
            var r = Math.random();
            if (r > 1 - this.randomStep) {
                this.lastRandomStepTS = ts
                var xmin = Math.max(-this.seeR, -antX)
                var xmax = Math.min(this.seeR, myGameArea.MAP_WIDTH - 1 - antX)
                this.targetX = antX + Math.floor(Math.random() * (xmax - xmin) + xmin)
                var ymin = Math.max(-this.seeR, -antY)
                var ymax = Math.min(this.seeR, myGameArea.MAP_HEIGHT - 1 - antY)
                this.targetY = antY + Math.floor(Math.random() * (ymax - ymin) + ymin)
            }
        }

        if (this.targetX == 0 && this.targetY == 0) {
            var maxSmell = 0
            var curPosSmell = 0
            if (this.state == this.STATE_ENUM['SEARCH_NEST']) {
                curPosSmell = myGameArea.nestSmellMatrix[antX][antY]
            } else {
                curPosSmell = myGameArea.foodSmellMatrix[antX][antY]
            }
            var noSmellX = 0
            var noSmellY = 0
            for (var i = Math.max(-this.smellR, -antX); i <= Math.min(this.smellR, myGameArea.MAP_WIDTH - 1 - antX); i += 1) {
                for (var j = Math.max(-this.smellR, -antY); j <= Math.min(this.smellR, myGameArea.MAP_HEIGHT - 1 - antY); j += 1) {
                    if (i == 0 && j == 0) {
                        continue;
                    }
                    var curSmell = 0
                    if (this.state == this.STATE_ENUM['SEARCH_NEST']) {
                        curSmell = myGameArea.nestSmellMatrix[antX + i][antY + j]
                    } else {
                        if (myGameArea.foodSmellMatrix[antX + i][antY + j]) {
                            curSmell = myGameArea.foodSmellMatrix[antX + i][antY + j]
                        } else {
                            var len = Math.sqrt(i * i + j * j)
                            noSmellX -= myGameArea.nestSmellMatrix[antX + i][antY + j] * i / len
                            noSmellY -= myGameArea.nestSmellMatrix[antX + i][antY + j] * j / len
                        }
                    }
                    if (curSmell > maxSmell) {
                        maxSmell = curSmell
                        this.targetX = antX + i;
                        this.targetY = antY + j;
                    }
                }
            }
            if (maxSmell <= curPosSmell) {
                if (this.state == this.STATE_ENUM['SEARCH_FOOD']) { // remove old food path
                    myGameArea.foodSmellMatrix[antX][antY] = 0
                }
            }
            if (!maxSmell) {
                var len = Math.sqrt(noSmellX * noSmellX + noSmellY * noSmellY)
                this.targetX = Math.floor(noSmellX / len * this.smellR)
                this.targetY = Math.floor(noSmellY / len * this.smellR)
                this.targetX = Math.max(0, Math.min(myGameArea.MAP_WIDTH - 1, antX + this.targetX))
                this.targetY = Math.max(0, Math.min(myGameArea.MAP_HEIGHT - 1, antY + this.targetY))
            }
        }
    }
    this.step = function() {
        var tx = this.targetX * myGameArea.CELL_SIZE
        var ty = this.targetY * myGameArea.CELL_SIZE
        var dx = tx - this.x
        var dy = ty - this.y
        var len = Math.sqrt(dx*dx + dy*dy);
        if (len < this.speed) {
            this.x = tx
            this.y = ty
        } else if (len) {
            this.x += this.speed * dx / len;
            this.y += this.speed * dy / len;
        }
        this.hitSide();
    }
    this.hitSide = function() {
        var rockbottom = myGameArea.canvas.height - this.height;
        if (this.y > rockbottom) {
            this.y = rockbottom;
        }
        var rockright = myGameArea.canvas.width - this.width;
        if (this.x > rockright) {
            this.x = rockright;
        }
        if (this.y < 0) {
            this.y = 0;
        }
        if (this.x < 0) {
            this.x = 0;
        }
    }
    this.crashWith = function(otherobj) {
        var myleft = this.x;
        var myright = this.x + (this.width);
        var mytop = this.y;
        var mybottom = this.y + (this.height);
        var otherleft = otherobj.x;
        var otherright = otherobj.x + (otherobj.width);
        var othertop = otherobj.y;
        var otherbottom = otherobj.y + (otherobj.height);
        var crash = true;
        if ((mybottom < othertop) || (mytop > otherbottom) || (myright < otherleft) || (myleft > otherright)) {
            crash = false;
        }
        return crash;
    }
    this.takeFood = function() {
        this.state = this.STATE_ENUM["SEARCH_NEST"]
        this.withFood = true
        this.smellPower = 1
    }
    this.dropFood = function() {
        this.state = this.STATE_ENUM["SEARCH_FOOD"]
        this.withFood = false
        this.smellPower = 1
    }
}

function drawSmellMap(matrix, color) {
    for (var i = 0; i < matrix.length; i += 1) {
        for (var j = 0; j < matrix[i].length; j += 1) {
            ctx = myGameArea.context;
            if (matrix[i][j] > 0) {
                var c = Math.floor(255 - matrix[i][j] * 40)
                ctx.fillStyle = 'rgb('
                    + color[0] * c
                    + ', ' + color[1] * c
                    + ', ' + color[2] * c
                    + ')';
                ctx.fillRect(i * myGameArea.CELL_SIZE, j * myGameArea.CELL_SIZE, myGameArea.CELL_SIZE, myGameArea.CELL_SIZE);
            }
        }
    }
}

function updateGameArea() {
    myGameArea.clear();
    myGameArea.frameNo += 1;

    drawSmellMap(myGameArea.nestSmellMatrix, [1, 1, 255]);
    drawSmellMap(myGameArea.foodSmellMatrix, [1, 255, 1]);
    for (var i = 0; i < myGameArea.nestSmellMatrix.length; i += 1) {
        for (var j = 0; j < myGameArea.nestSmellMatrix[i].length; j += 1) {
            myGameArea.foodSmellMatrix[i][j] *= 0.999
            if (myGameArea.foodSmellMatrix[i][j] < 0.001) {
                myGameArea.foodSmellMatrix[i][j] = 0
            }
            myGameArea.nestSmellMatrix[i][j] *= 0.999
            if (myGameArea.nestSmellMatrix[i][j] < 0.001) {
                myGameArea.nestSmellMatrix[i][j] = 0
            }
        }
    }

    for (var i = 0; i < myGameArea.myAnts.length; i += 1) {
        if (!myGameArea.myAnts[i].withFood) {
            for (var j = 0; j < myGameArea.myFoods.length; j += 1) {
                if (myGameArea.myFoods[j].count > 0 && myGameArea.myAnts[i].crashWith(myGameArea.myFoods[j])) {
                    myGameArea.myAnts[i].takeFood()
                    myGameArea.myFoods[j].eated()
                    break
                }
            }
        }
        if (myGameArea.myAnts[i].crashWith(myGameArea.nest)) {
            if (myGameArea.myAnts[i].withFood) {
                myGameArea.nest.foods += 1
            }
            myGameArea.myAnts[i].dropFood()
        }
        myGameArea.myAnts[i].smell(myGameArea.frameNo);
        myGameArea.myAnts[i].step();
        myGameArea.myAnts[i].update();
    }

    var newFoods = []
    for (var i = 0; i < myGameArea.myFoods.length; i += 1) {
        if (myGameArea.myFoods[i].count > 0) {
            newFoods.push(myGameArea.myFoods[i]);
        }
    }
    if (myGameArea.frameNo % 1200 == 0) {
        newFoods.push(new Food(Math.random() * myGameArea.MAP_WIDTH * myGameArea.CELL_SIZE, Math.random() * myGameArea.MAP_HEIGHT * myGameArea.CELL_SIZE));
    }
    myGameArea.myFoods = newFoods;
    for (var i = 0; i < myGameArea.myFoods.length; i += 1) {
        myGameArea.myFoods[i].update();
    }

    myGameArea.nest.update();
}

function everyinterval(n) {
    if ((myGameArea.frameNo / n) % 1 == 0) {return true;}
    return false;
}
