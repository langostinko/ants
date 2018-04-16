describe("Nest", function() {

  it("generates ants", function() {
      myGameArea.init()
      nest = new Nest(0, 0)
      nest.foods = 5
      nest.update()
      assert.equal(myGameArea.myAnts.length, 1);
  });

});
