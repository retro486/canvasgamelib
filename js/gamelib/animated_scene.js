define(['gamelib/scene'], function(Scene) {
  // Similar to a normal scene but animates through the sprite array instead of rendering all of them at once
  // callback runs after the animation is finished; only executes if loop is false
  // Use beforeUpdate and afterUpdate to add custom actions instead of overriding update itself for this one.
  var AnimatedScene = function(pos, dims, sprites, callback) {
    var scene = new Scene(pos, dims);
    scene.sprites = sprites;
    scene.frame_count = 0;
    scene.current_i = 0;
    scene.play = true;

    scene.update = function() {
      this.beforeUpdate();

      // bother updating when hidden? I dunno... maybe... for now... no...?
      if(this.hidden) return;

      // Ensures sprite maintains its last known state
      if(this.play) {
        this.current_i++;
        if(this.current_i >= this.sprites.length) {
          this.current_i = 0;
          if(callback != undefined) callback();
        }
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
    };

    scene.pause = function() {
      this.play = false;
    };

    scene.resume = function() {
      this.play = true;
    };

    scene.afterUpdate = function() {}; // for custom actions without killing default behavior
    scene.beforeUpdate = function() {}; // another hook if needed

    return scene;
  };

  return AnimatedScene;
});
