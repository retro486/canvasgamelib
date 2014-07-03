define(function() {
  // For spritesheets that contain all same dimensioned sprites (like character sheets)
  // linear sprite names are prefix_# where # is the row #
  // callback is called once the file has been loaded.
  var SymmetricalSpritesheet = function(filename, rows, cols, cell_width, cell_height, prefixes, style) {
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
  };

  return SymmetricalSpritesheet;
});
