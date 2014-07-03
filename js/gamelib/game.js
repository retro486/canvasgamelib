define(['q'], function(Q) {
  var ___game_sprite_promises = [];
  var __game;

  var Game = function(canvas_id, fps, grid_dims, undefined_scene) {
    this.canvas_id = canvas_id;
    this.fps = fps; // allows for locking framerate since ~60fps isn't always what you want. Or ever...
    this.static_scenes = [];
    this.animated_scenes = [];
    this.grid = [];
    this.undefined_scene = undefined_scene;

    var canvas = document.getElementById(canvas_id);
    this.buffer = document.createElement('canvas');
    this.buffer_ctx = this.buffer.getContext('2d');
    this.buffer.width = canvas.width;
    this.buffer.height = canvas.height;
    this.buffer.id = canvas_id;

    var x = 0, y = 0;
    for(var i = 0; i < (grid_dims[0] * grid_dims[1]); i++) {
      var blank = this.undefined_scene.copy();
      blank.setCanvas(this.buffer);
      blank.x = x;
      blank.y = y;
      this.grid[i] = blank;
      if(++x == grid_dims[0]) {
        x = 0; y++;
      }
    }

    this.addStaticScene = function(scene) {
      scene.setCanvas(this.buffer);
      this.static_scenes.push(scene);
    };

    this.addAnimatedScene = function(scene) {
      scene.setCanvas(this.buffer);
      this.animated_scenes.push(scene);
    };

    this.anim = function() {
      // trick to smooth out requestanimationframe being too damned fast
      // http://creativejs.com/resources/requestanimationframe/
      setTimeout(function() {
        window.requestAnimationFrame(__game.anim);

        var screen = document.getElementById(__game.canvas_id);

        var merged_scenes = __game.grid.concat(__game.static_scenes.concat(__game.animated_scenes));

        for(var i=0; i < merged_scenes.length; i++) {
          merged_scenes[i].update();
        }

        __game.buffer_ctx.clearRect(0,0,__game.buffer.width,__game.buffer.height);

        for(var i=0; i < merged_scenes.length; i++) {
          merged_scenes[i].draw([0,0],[__game.undefined_scene.w, __game.undefined_scene.h]);
        }

        screen.parentNode.replaceChild(__game.buffer, screen);
      }, 1000 / __game.fps);
    };

    this.start = function() {
      var game = this;
      Q.all(___game_sprite_promises).then(function() {
        console.debug('Game started.');
        window.requestAnimationFrame(game.anim);
      });
    };

    __game = this;
  };

  return Game;
});
