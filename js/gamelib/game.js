// Temporary globals
var ___game_sprite_promises = [];
var __game;

define(['q'], function(Q) {
  var Game = function(fps) {
    this.fps = fps; // allows for locking framerate since ~60fps isn't always what you want. Or ever...
    this.static_scenes = [];
    this.animated_scenes = [];

    this.buffer = document.createElement('canvas');
    this.buffer_ctx = this.buffer.getContext('2d');
    this.buffer.width = 640;
    this.buffer.height = 480;
    this.buffer.id = 'canvas_id';

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

        var screen = document.getElementById('canvas_id');

        var merged_scenes = __game.static_scenes.concat(__game.animated_scenes);

        for(var i=0; i < __game.static_scenes.length; i++) {
          merged_scenes[i].update();
        }

        __game.buffer_ctx.clearRect(0,0,__game.buffer.width,__game.buffer.height);

        for(var i=0; i < __game.static_scenes.length; i++) {
          merged_scenes[i].draw();
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
