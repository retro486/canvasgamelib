// Requires Q for async management
// http://documentup.com/kriskowal/q/

// Temporary global
var ___game_sprite_promises = [];
var __game;

function Game() {
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

      for(var i=0; i < __game.static_scenes.length; i++) {
        __game.static_scenes[i].update();
      }
      for(var i=0; i < __game.animated_scenes.length; i++) {
        __game.animated_scenes[i].update();
      }

      __game.buffer_ctx.clearRect(0,0,__game.buffer.width,__game.buffer.height);

      // static scenes should be drawn first
      for(var i=0; i < __game.static_scenes.length; i++) {
        __game.static_scenes[i].draw();
      }
      for(var i=0; i < __game.animated_scenes.length; i++) {
        __game.animated_scenes[i].draw();
      }

      screen.parentNode.replaceChild(__game.buffer, screen);
    }, 1000 / 5); // 5 fps
  }

  this.start = function() {
    var game = this;
    Q.all(___game_sprite_promises).then(function() {
      console.debug('Game started.');
      window.requestAnimationFrame(game.anim);
    });
  }

  __game = this;
}

// Manages assets on a single layer; i.e., background elements, player, individual enemies, and collision between scenes
function Scene(width, height) {
  this.w = width;
  this.h = height;
  this.x = 0;
  this.y = 0;
  this.hidden = false;
  this.invert_h = false;
  this.invert_v = false;
  this.sprites = [];

  this.setCanvas = function(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  this.update = function() {
    // actions to take just before each draw frame
  };

  this.draw = function() {
    if(this.hidden) return this;
    // write sprites and such to their appropriate locations on this.ctx
    for(var i = 0; i < this.sprites.length; i++) {
      var sp = this.sprites[i];
      this.ctx.save();
      var vert = 1;
      var horiz = 1;
      if(this.invert_h) vert = -1;
      if(this.invert_v) horiz = -1;
      this.ctx.scale(horiz, vert);
      this.ctx.drawImage(sp.img, sp.x, sp.y, sp.w, sp.h, this.x, this.y, sp.sw, sp.sh);
      this.ctx.restore();
    }
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
    if(this.x > this.canvas.width) this.x = this.canvas.width;
    else if(this.x < 0) this.x = 0;

    if(y == undefined) y = this.y;
    else this.y += y;
    if(this.y > this.canvas.height) this.y = this.canvas.height;
    else if(this.y < 0) this.y = 0;
  };
}

// Similar to a normal scene but animates through the sprite array instead of rendering all of them at once
// callback runs after the animation is finished; only executes if loop is false
function AnimatedScene(width, height, sprites, callback) {
  var scene = new Scene(width, height);
  scene.sprites = sprites;
  scene.frame_count = 0;
  scene.current_i = 0;

  scene.update = function() {
    // bother updating when hidden? I dunno... maybe... for now... no...?
    if(this.hidden) return;

    this.beforeUpdate();

    this.current_i++;
    if(this.current_i >= this.sprites.length) {
      this.current_i = 0;
      if(callback != undefined) callback();
    }

    this.afterUpdate();
  };

  scene.draw = function() {
    if(this.hidden) return; // be sure to respect the hidden flag

    // draw only the first sprite
    var sp = this.sprites[this.current_i];

    this.ctx.save();
    var vert = 1;
    var horiz = 1;
    var x = this.x;
    var y = this.y;
    if(this.invert_h) {
      horiz = -1;
      x = (x * -1) - sp.w;
    }
    if(this.invert_v) {
      vert = -1;
      y = (y * -1) - sp.h;
    }
    this.ctx.scale(horiz, vert);
    this.ctx.drawImage(sp.img, sp.x, sp.y, sp.w, sp.h, x, y, sp.sw, sp.sh);
    this.ctx.restore();
  }

  scene.afterUpdate = function() {}; // for custom actions without killing default behavior
  scene.beforeUpdate = function() {}; // another hook if needed

  return scene;
}

// Just a single  static sprite for use with scenes
function StaticSprite(filename, width, height) {
  this.img = new Image();
  this.img.src = filename;
  this.x = 0;
  this.y = 0;
  this.w = width;
  this.h = height;
  this.sw = width;
  this.sh = height;

  this.then = function(callback) {
    var deferred = Q.defer();
    this.img.onload = function() {
      deferred.resolve();
    }
    return deferred.promise;
  };

  ___game_sprite_promises.push(this.then());
}

// For spritesheets that contain all same dimensioned sprites (like character sheets)
// linear sprite names are prefix_# where # is the row #
// callback is called once the file has been loaded.
function SymmetricalSpritesheet(filename, rows, cols, cell_width, cell_height, prefixes, style) {
  this.sprites = {};

  this.img = new Image();
  this.img.src = filename;

  if(style == 'linear') {
    // sprites are all in a row. each row has a different unrelated sprite (i.e., classes, different monsters, etc).
    // cols == prefixes.length
    for(var col=0; col < cols; col++) {
      for(var row=0; row < rows; row++) {
        this.sprites[prefixes[col] + '_' + row] = {
          x: cell_width * col,
          y: cell_height * row,
          w: cell_width,
          h: cell_height,
          sw: cell_width,
          sh: cell_height,
          img: this.img,
        };
      }
    }
  }
  else if(style == 'square') {
    // sprites are positioned in a square, oriented as they would face in relation to an 8-way joystick and all sprites are related (i.e., directional)
  }

  this.then = function(callback) {
    var deferred = Q.defer();
    this.img.onload = function() {
      deferred.resolve();
    }
    return deferred.promise;
  };

  ___game_sprite_promises.push(this.then());
}

// For spritesheets that contain multiple differently dimensioned sprites (like environment sheets)
// Set up for this will of course be horrible and messy - ideally spritesheets will be a little consistent...
function ManualSpritesheet() {

}
