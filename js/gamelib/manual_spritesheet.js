define(['q'], function(Q) {
  // For spritesheets that contain multiple differently dimensioned sprites (like environment sheets)
  // Set up for this will of course be horrible and messy - ideally spritesheets will be at least a little consistent...
  var ManualSpritesheet = function(filename) {
    this.sprites = {};
    this.img = new Image();
    this.img.src = filename;

    this.markSprite = function(name, x, y, w, h) {
      this.sprites[name] = {
        x: x,
        y: y,
        w: w,
        h: h,
        sw: w,
        sh: h,
        img: this.img,
      };
    };

    this.then = function() {
      var deferred = Q.defer();
      this.img.onload = function() {
        deferred.resolve();
      }
      return deferred.promise;
    };

    // helper functions
    this.buildHorizontal = function(name, start_cell_x, start_cell_y, to_x, w, h) {
      start_cell_x--; start_cell_y--;
      for(var i=0; i < to_x; i++) {
        var x = start_cell_x * w + (w * i);
        var y = start_cell_y * h;
        this.markSprite(name + i, x, y, w, h);
      }
    };

    this.buildVertical = function(name, start_cell_x, start_cell_y, to_y, w, h) {
      start_cell_x--; start_cell_y--;
      for(var i=0; i < to_y; i++) {
        var x = start_cell_x * w;
        var y = start_cell_y * h + (h * i);
        this.markSprite(name + i, x, y, w, h);
      }
    };
  };

  return ManualSpritesheet;
});
