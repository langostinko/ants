// 2D-Tree
function Matrix(N, M) {
    this._init = function(v, lx, rx, ly, ry) {
        if (lx + 1 == rx && ly + 1 == ry) {
            return
        }
        this._vertex[v] = [lx, ly]
        if (rx - lx >= ry - ly) {
            var m = Math.floor((rx + lx) / 2);
            this._init(v * 2, lx, m, ly, ry)
            this._init(v * 2 + 1, m, rx, ly, ry)
        } else {
            var m = Math.floor((ry + ly) / 2);
            this._init(v * 2, lx, rx, ly, m)
            this._init(v * 2 + 1, lx, rx, m, ry)
        }
    }

    this._N = N;
    this._M = M;
    this._matrix = [];
    for (var i = 0; i < this._N; i += 1) {
        this._matrix[i] = new Array(this._M);
        for (var j = 0; j < this._M; j += 1) {
            this._matrix[i][j] = 0
        }
    }

    this._vertex = new Array(N * M);
    for (var i = 0; i < N * M; i += 1) {
        this._vertex[i] = 0
    }
    this._init(1, 0, N, 0, M)

    this.get = function(i, j) {
        return this._matrix[i][j]
    }
    this.update = function(i, j, x) {
        this._update(1, 0, N, 0, M, i, j, x)
    }
    this.maxOnArea = function(lx, rx, ly, ry) {
        return this._maxOnArea(1, 0, N, 0, M, lx, rx, ly, ry)
    }

    // multiply every element by coef
    this.multiply = function(coef) {
        // no need to change this._vertex
        for (var i = 0; i < this._N; i += 1) {
            for (var j = 0; j < this._M; j += 1) {
                this._matrix[i][j] *= coef
            }
        }
    }

    this._update = function(v, lx, rx, ly, ry, i, j, x) {
        if (lx + 1 == rx && ly + 1 == ry) {
            if (lx == i && ly == j) {
                this._matrix[i][j] = x;
            }
            return [lx,ly];
        }
        if (lx > i || rx <= i || ly > j || ry <= j) {
            return this._vertex[v];
        }
        var l = 0
        var r = 0
        if (rx - lx >= ry - ly) {
            var m = Math.floor((rx + lx) / 2);
            l = this._update(v * 2, lx, m, ly, ry, i, j, x)
            r = this._update(v * 2 + 1, m, rx, ly, ry, i, j, x)
        } else {
            var m = Math.floor((ry + ly) / 2);
            l = this._update(v * 2, lx, rx, ly, m, i, j, x)
            r = this._update(v * 2 + 1, lx, rx, m, ry, i, j, x)
        }
        if (this._matrix[l[0]][l[1]] >= this._matrix[r[0]][r[1]]) {
            this._vertex[v] = l
        } else {
            this._vertex[v] = r
        }
        return this._vertex[v]
    }
    this._maxOnArea = function(v, lx, rx, ly, ry, ilx, irx, ily, iry) {
        if (lx >= irx || rx <= ilx || ly >= iry || ry <= ily) {
            return false;
        }
        if (lx + 1 == rx && ly + 1 == ry) {
            return [lx, ly]
        }
        if (lx == ilx && rx == irx && ly == ily && ry == iry) {
            return this._vertex[v]
        }
        var l = 0
        var r = 0
        if (rx - lx >= ry - ly) {
            var m = Math.floor((rx + lx) / 2);
            l = this._maxOnArea(v * 2, lx, m, ly, ry, ilx, Math.min(irx, m), ily, iry)
            r = this._maxOnArea(v * 2 + 1, m, rx, ly, ry, Math.max(ilx, m), irx, ily, iry)
        } else {
            var m = Math.floor((ry + ly) / 2);
            l = this._maxOnArea(v * 2, lx, rx, ly, m, ilx, irx, ily, Math.min(iry, m))
            r = this._maxOnArea(v * 2 + 1, lx, rx, m, ry, ilx, irx, Math.max(ily, m), iry)
        }
        if (!l) {
            return r
        }
        if (!r) {
            return l
        }
        if (this._matrix[l[0]][l[1]] >= this._matrix[r[0]][r[1]]) {
            return l
        } else {
            return r
        }
    }}

var myGameArea = {
    UPDATE_INTERVAL: 50,
    CELL_SIZE: 5,
    MAP_WIDTH: 100,
    MAP_HEIGHT: 100,

    canvas : document.createElement("canvas"),
    nestSmellMatrix: [],
    foodSmellMatrix: [],
    nest: null,
    myAnts: [],
    myFoods: [],

    init : function() {
        this.canvas.width = this.MAP_WIDTH * this.CELL_SIZE;
        this.canvas.height = this.MAP_HEIGHT * this.CELL_SIZE;
        this.context = this.canvas.getContext("2d");

        this.nestSmellMatrix = new Matrix(this.MAP_WIDTH, this.MAP_HEIGHT);
        this.foodSmellMatrix = new Matrix(this.MAP_WIDTH, this.MAP_HEIGHT);
    },
    start : function() {
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.frameNo = 0;
        this.interval = setInterval(updateGameArea, this.UPDATE_INTERVAL);
    },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function startGame() {
    myGameArea.nest = new Nest(240, 240);

    for (var i = 0; i < 5; i += 1) {
        myGameArea.myAnts.push(new Ant(250, 250));
    }

    myGameArea.myFoods.push(new Food(230, 200));
    myGameArea.myFoods.push(new Food(400, 400));
    myGameArea.myFoods.push(new Food(350, 100));
    myGameArea.myFoods.push(new Food(50, 200));

    myGameArea.init();
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
        var nestX = Math.floor(this.x / myGameArea.CELL_SIZE)
        var nestY = Math.floor(this.y / myGameArea.CELL_SIZE)
        myGameArea.nestSmellMatrix.update(nestX, nestY, 2)
        while (this.foods >= 5) {
            myGameArea.myAnts.push(new Ant(250, 250))
            this.foods -= 5
        }
    }
    this.draw = function() {
        ctx = myGameArea.context;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
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
        var foodX = Math.floor(this.x / myGameArea.CELL_SIZE)
        var foodY = Math.floor(this.y / myGameArea.CELL_SIZE)
        myGameArea.foodSmellMatrix.update(foodX, foodY, 1);
    }
    this.eated = function() {
        var foodX = Math.floor(this.x / myGameArea.CELL_SIZE)
        var foodY = Math.floor(this.y / myGameArea.CELL_SIZE)
        this.count -= 1
        if (!this.count) {
            myGameArea.foodSmellMatrix.update(foodX, foodY, 0);
        }
    }
    this.draw = function() {
        ctx = myGameArea.context;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

function Ant(x, y) {
    this.STATE_ENUM = {"SEARCH_FOOD":0, "SEARCH_NEST":1}
    this.width = 1 * myGameArea.CELL_SIZE;
    this.height = 1 * myGameArea.CELL_SIZE;
    this.speed = 0.5 * myGameArea.CELL_SIZE;
    this.smellR = 5;
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
        var antX = Math.floor(this.x / myGameArea.CELL_SIZE)
        var antY = Math.floor(this.y / myGameArea.CELL_SIZE)
        if (this.withFood) {
            var curSmell = myGameArea.foodSmellMatrix.get(antX, antY);
            if (this.smellPower / curSmell > 1.01) {
                myGameArea.foodSmellMatrix.update(antX, antY, this.smellPower)
            }
        } else {
            var curSmell = myGameArea.nestSmellMatrix.get(antX, antY);
            if (this.smellPower / curSmell > 1.01) {
                myGameArea.nestSmellMatrix.update(antX, antY, this.smellPower)
            }
        }
        this.smellPower *= 0.998
    }
    this.draw = function() {
        ctx = myGameArea.context;
        if (this.withFood) {
            ctx.fillStyle = "red"
        } else {
            ctx.fillStyle = "orange"
        }
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    this.smell = function(ts) {
        var antX = Math.floor(this.x / myGameArea.CELL_SIZE)
        var antY = Math.floor(this.y / myGameArea.CELL_SIZE)
        if (this.targetX || this.targetY) {
            if (antX != this.targetX || antY != this.targetY) {
                return;
            }
        }
        this.targetX = 0;
        this.targetY = 0;

        if (this.state == this.STATE_ENUM['SEARCH_FOOD'] && this.smellPower < 0.5) {
            this.state = this.STATE_ENUM['SEARCH_NEST'];
        }

        if (this.targetX == 0 && this.targetY == 0) {
            this._trySetTargetRandom(ts);
        }

        if (this.targetX == 0 && this.targetY == 0) {
            if (this.state == this.STATE_ENUM['SEARCH_FOOD']) {
                this._trySetTargetMaxFoodSmell();
                if (this.targetX == 0 && this.targetY == 0) {
                    this._trySetTargetAwayFromNest();
                }
            } else {
                this._trySetTargetMaxNestSmell();
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
    this._trySetTargetRandom = function(ts) {
        var antX = Math.floor(this.x / myGameArea.CELL_SIZE)
        var antY = Math.floor(this.y / myGameArea.CELL_SIZE)
        if (ts - this.lastRandomStepTS > 10) {
            var r = Math.random();
            if (r > 1 - this.randomStep) {
                this.lastRandomStepTS = ts
                var xmin = Math.max(-this.smellR, -antX)
                var xmax = Math.min(this.smellR, myGameArea.MAP_WIDTH - 1 - antX)
                this.targetX = antX + Math.floor(Math.random() * (xmax - xmin) + xmin)
                var ymin = Math.max(-this.smellR, -antY)
                var ymax = Math.min(this.smellR, myGameArea.MAP_HEIGHT - 1 - antY)
                this.targetY = antY + Math.floor(Math.random() * (ymax - ymin) + ymin)
            }
        }
    }
    this._trySetTargetMaxFoodSmell = function() {
        var antX = Math.floor(this.x / myGameArea.CELL_SIZE)
        var antY = Math.floor(this.y / myGameArea.CELL_SIZE)
        var maxSmellPos = myGameArea.foodSmellMatrix.maxOnArea(
            Math.max(antX - this.smellR, 0)
            , Math.min(antX + this.smellR + 1, myGameArea.MAP_WIDTH)
            , Math.max(antY - this.smellR, 0)
            , Math.min(antY + this.smellR + 1, myGameArea.MAP_HEIGHT)
        )
        if (maxSmellPos[0] != antX || maxSmellPos[1] != antY) {
            var maxSmell = myGameArea.foodSmellMatrix.get(maxSmellPos[0], maxSmellPos[1]);
            if (maxSmell > 0) {
                this.targetX = maxSmellPos[0];
                this.targetY = maxSmellPos[1];
            }
        } else {
            var curPosSmell = myGameArea.foodSmellMatrix.get(antX, antY)
            if (curPosSmell > 0) { // remove old food path
                myGameArea.foodSmellMatrix.update(antX, antY, 0)
            }
        }
    }
    this._trySetTargetAwayFromNest = function() {
        var antX = Math.floor(this.x / myGameArea.CELL_SIZE)
        var antY = Math.floor(this.y / myGameArea.CELL_SIZE)
        var maxSmellPos = myGameArea.nestSmellMatrix.maxOnArea(
            Math.max(antX - this.smellR, 0)
            , Math.min(antX + this.smellR + 1, myGameArea.MAP_WIDTH)
            , Math.max(antY - this.smellR, 0)
            , Math.min(antY + this.smellR + 1, myGameArea.MAP_HEIGHT)
        )
        if (maxSmellPos[0] != antX || maxSmellPos[1] != antY) {
            var maxSmell = myGameArea.nestSmellMatrix.get(maxSmellPos[0], maxSmellPos[1]);
            if (maxSmell > 0) {
                this.targetX = -(maxSmellPos[0] - antX);
                this.targetY = -(maxSmellPos[1] - antY);
                var len = Math.sqrt(this.targetX * this.targetX + this.targetY * this.targetY)
                this.targetX = Math.floor(this.targetX / len * this.smellR);
                this.targetY = Math.floor(this.targetY / len * this.smellR);
                this.targetX = Math.max(0, Math.min(myGameArea.MAP_WIDTH - 1, antX + this.targetX))
                this.targetY = Math.max(0, Math.min(myGameArea.MAP_HEIGHT - 1, antY + this.targetY))
            }
        }
    }
    this._trySetTargetMaxNestSmell = function() {
        var antX = Math.floor(this.x / myGameArea.CELL_SIZE)
        var antY = Math.floor(this.y / myGameArea.CELL_SIZE)
        var maxSmellPos = myGameArea.nestSmellMatrix.maxOnArea(
            Math.max(antX - this.smellR, 0)
            , Math.min(antX + this.smellR + 1, myGameArea.MAP_WIDTH)
            , Math.max(antY - this.smellR, 0)
            , Math.min(antY + this.smellR + 1, myGameArea.MAP_HEIGHT)
        )
        if (maxSmellPos[0] != antX || maxSmellPos[1] != antY) {
            var maxSmell = myGameArea.nestSmellMatrix.get(maxSmellPos[0], maxSmellPos[1]);
            if (maxSmell > 0) {
                this.targetX = maxSmellPos[0];
                this.targetY = maxSmellPos[1];
            }
        }
    }
}

function drawSmellMatrixMap(matrix, color) {
    for (var i = 0; i < myGameArea.MAP_WIDTH; i += 1) {
        for (var j = 0; j < myGameArea.MAP_HEIGHT; j += 1) {
            ctx = myGameArea.context;
            if (matrix.get(i, j) > 0) {
                var c = Math.floor(255 - matrix.get(i, j) * 40)
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

    drawSmellMatrixMap(myGameArea.nestSmellMatrix, [1, 1, 255]);
    drawSmellMatrixMap(myGameArea.foodSmellMatrix, [1, 255, 1]);
    myGameArea.nestSmellMatrix.multiply(0.999)
    myGameArea.foodSmellMatrix.multiply(0.999)
    for (var i = 0; i < myGameArea.nestSmellMatrix.length; i += 1) {
        for (var j = 0; j < myGameArea.nestSmellMatrix[i].length; j += 1) {
            if (myGameArea.foodSmellMatrix.get(i, j) > 0 && myGameArea.foodSmellMatrix.get(i, j) < 0.001) {
                myGameArea.foodSmellMatrix.update(i, j, 0)
            }
            if (myGameArea.nestSmellMatrix.get(i, j) > 0 && myGameArea.nestSmellMatrix.get(i, j) < 0.001) {
                myGameArea.nestSmellMatrix.update(i, j, 0)
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
        myGameArea.myAnts[i].draw();
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
        myGameArea.myFoods[i].draw();
    }

    myGameArea.nest.update();
    myGameArea.nest.draw();
}

function everyinterval(n) {
    if ((myGameArea.frameNo / n) % 1 == 0) {return true;}
    return false;
}
