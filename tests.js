describe("Nest", function() {

  it("generates ants", function() {
      myGameArea.init()
      nest = new Nest(0, 0)
      nest.foods = 5
      nest.update()
      assert.equal(myGameArea.myAnts.length, 1);
  });

  it("smells like home", function() {
      myGameArea.init()
      nest = new Nest(40, 30)
      nest.update()
      assert.equal(myGameArea.nestSmellMatrix[nest.x / myGameArea.CELL_SIZE][nest.y / myGameArea.CELL_SIZE], 2);
  });

});

describe("Food", function() {

  it("is at food matrix", function() {
      myGameArea.init()
      food = new Food(40, 30)
      food.update()
      assert.equal(myGameArea.foodMatrix[food.x / myGameArea.CELL_SIZE][food.y / myGameArea.CELL_SIZE], 1);
  });

  it("shrinks when eated", function() {
      myGameArea.init()
      food = new Food(40, 30)
      food.count = 3
      food.eated()
      assert.equal(food.count, 2);
  });

  it("ends on last bite", function() {
      myGameArea.init()
      food = new Food(40, 30)
      food.count = 1
      food.eated()
      assert.equal(food.count, 0);
      assert.equal(myGameArea.foodMatrix[food.x / myGameArea.CELL_SIZE][food.y / myGameArea.CELL_SIZE], 0);
  });

});

describe("Ant", function() {

  it("leaves nest smell when has no food", function() {
      myGameArea.init()
      ant = new Ant(40, 30)
      ant.update()
      assert.equal(myGameArea.nestSmellMatrix[ant.x / myGameArea.CELL_SIZE][ant.y / myGameArea.CELL_SIZE], 1);
  });

  it("leaves food smell when has food", function() {
      myGameArea.init()
      ant = new Ant(40, 30)
      ant.withFood = true
      ant.update()
      assert.equal(myGameArea.foodSmellMatrix[ant.x / myGameArea.CELL_SIZE][ant.y / myGameArea.CELL_SIZE], 1);
  });

  it("sets target to random sometimes", function() {
      myGameArea.init()
      ant = new Ant(40, 30)
      ant.randomStep = 1
      ant._trySetTargetRandom(15)
      assert.notEqual(ant.targetX, 0);
      assert.notEqual(ant.targetY, 0);
  });

  it("not tests target to random too frequent", function() {
      myGameArea.init()
      ant = new Ant(40, 30)
      ant.randomStep = 1
      ant._trySetTargetRandom(1)
      assert.equal(ant.targetX, 0);
      assert.equal(ant.targetY, 0);
  });

  it("sets target to food if it's near", function() {
      myGameArea.init()
      ant = new Ant(40, 30)
      myGameArea.foodMatrix[8][5] = 1
      ant._trySetTargetFood()
      assert.equal(ant.targetX, 8);
      assert.equal(ant.targetY, 5);
  });

  it("sets target to food if it's far", function() {
      myGameArea.init()
      ant = new Ant(40, 30)
      myGameArea.foodMatrix[14][12] = 1
      ant._trySetTargetFood()
      assert.equal(ant.targetX, 0);
      assert.equal(ant.targetY, 0);
  });

  it("sets target to max food smell", function() {
      myGameArea.init()
      ant = new Ant(40, 30)
      myGameArea.foodSmellMatrix[8][5] = 1
      ant._trySetTargetMaxFoodSmell()
      assert.equal(ant.targetX, 8);
      assert.equal(ant.targetY, 5);
  });

  it("not sets target to max food when no food smell nearby", function() {
      myGameArea.init()
      ant = new Ant(50, 50)
      ant._trySetTargetMaxFoodSmell()
      assert.equal(ant.targetX, 0);
      assert.equal(ant.targetY, 0);
  });

  it("sets target away from nest", function() {
      myGameArea.init()
      ant = new Ant(50, 50)
      myGameArea.nestSmellMatrix[10][8] = 1
      ant._trySetTargetAwayFromNest()
      assert.equal(ant.targetX, 10);
      assert.equal(ant.targetY, 15);
  });

  it("not sets target away from nest when no nest smell nearby", function() {
      myGameArea.init()
      ant = new Ant(50, 50)
      ant._trySetTargetAwayFromNest()
      assert.equal(ant.targetX, 0);
      assert.equal(ant.targetY, 0);
  });

  it("sets target to max nest smell", function() {
      myGameArea.init()
      ant = new Ant(40, 30)
      myGameArea.nestSmellMatrix[8][5] = 1
      ant._trySetTargetMaxNestSmell()
      assert.equal(ant.targetX, 8);
      assert.equal(ant.targetY, 5);
  });

  it("not sets target to max nest smell when no nest smell nearby", function() {
      myGameArea.init()
      ant = new Ant(40, 30)
      ant._trySetTargetMaxNestSmell()
      assert.equal(ant.targetX, 0);
      assert.equal(ant.targetY, 0);
  });

});
