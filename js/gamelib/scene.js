define(function() {
  // Manages assets on a single layer; i.e., background elements, player, individual enemies, and collision between scenes
  var Scene = function(pos, dims) {
    this.w = dims[0];
    this.h = dims[1];
    this.x = pos[0];
    this.y = pos[1];
    this.hidden = false;
    this.invert_h = false;
    this.invert_v = false;
    this.sprites = [];
    this.scenes = [];

    this.setCanvas = function(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');

      for(var i=0; i < this.scenes.length; i++) {
        this.scenes[i].setCanvas(canvas);
      }
    };

    this.addScene = function(pos, dims, sprite) {
      var inner_scene = new Scene([this.x + pos[0], this.y + pos[1]], dims);
      inner_scene.sprites.push(sprite);
      this.scenes.push(inner_scene);
    };

    this.addExistingScene = function(scene) {
      scene.x += this.x;
      scene.y += this.y;
      this.scenes.push(scene);
    };

    this.update = function() {
      // actions to take just before each draw frame
      // DON'T FORGET TO INCLUDE A CALL TO this.updateInnerScenes()
      this.updateInnerScenes();
    };

    this.draw = function(start_pos, grid_dims) {
      if(this.hidden) return this;

      // Draw sprites first
      for(var i = 0; i < this.sprites.length; i++) {
        var x = start_pos[0] + (this.x * grid_dims[0]);
        var y = start_pos[1] + (this.y * grid_dims[1]);
        var sp = this.sprites[i];
        this.ctx.save();
        var vert = 1;
        var horiz = 1;
        if(this.invert_h) vert = -1;
        if(this.invert_v) horiz = -1;
        this.ctx.scale(horiz, vert);
        this.ctx.drawImage(sp.img, sp.x, sp.y, sp.w, sp.h, x, y, sp.sw, sp.sh);
        this.ctx.restore();
      }

      // Then draw inner-scenes
      for(var i = 0; i < this.scenes.length; i++) {
        this.scenes[i].draw([this.x * grid_dims[0], this.y * grid_dims[1]],[1,1]); // subscenes will use the parent scene's dims
      }
    };

    this.updateInnerScenes = function() {
      for(var i=0; i < this.scenes.length; i++)
        this.scenes[i].update();
    };

    this.hide = function() {
      this.hidden = true;
    };

    this.show = function() {
      this.hidden = false;
    };

    // Move this scene to the specified x,y. Y is optional. Keeps scene in bounds. To hide scene use hidden flag
    this.move = function(x, y=undefined) {
      if(x == undefined) x = this.x;
      else this.x += x;

      if(y == undefined) y = this.y;
      else this.y += y;

      // this.checkBounds(); // enable if you want to keep drawn elements within the bounds of the canvas
    };

    this.moveTo = function(pos) {
      this.x = pos[0]; this.y = pos[1];
    };
    
    // Ensures drawn elements stay on the canvas - not always what you want...
    this.checkBounds = function() {
      if(this.x > this.canvas.width) this.x = this.canvas.width;
      else if(this.x < 0) this.x = 0;

      if(this.y > this.canvas.height) this.y = this.canvas.height;
      else if(this.y < 0) this.y = 0;
    };

    // Copies/clones this instance to a new instance, including functions
    this.copy = function() {
      var o = {};
      var keys = Object.keys(this);
      for(var i=0; i < keys.length; i++) {
        var k = keys[i];
        o[k] = this[k];
      }
      return o;
    };
  };

  return Scene;
});
