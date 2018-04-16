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
