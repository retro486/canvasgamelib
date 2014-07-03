define(function() {
  // Just a single  static sprite for use with scenes
  var StaticSprite = function(filename, width, height) {
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
  };

  return StaticSprite;
});
