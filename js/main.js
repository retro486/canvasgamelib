var requires = [
  'gamelib/game',
  'gamelib/scene',
  'gamelib/manual_spritesheet',
];

require(requires, function(Game, Scene, ManualSpritesheet) {
  // Spritesheet by Jerom (http://opengameart.org/content/32x32-fantasy-tileset)
  // Because this is a master sheeet (all sprites in one file) we have to manually extract the sprites.
  // 26 rows, 8 columns, last 3 rows contain custom sized sprites/UI elements
  // Large sprites 32x32, medium 16x16, small 8x8;
  var shadow_sprites = new ManualSpritesheet('images/fantasy-tileset.png');
  shadow_sprites.buildHorizontal('shadow', 1, 1, 8, 32, 32);

  var player_sprites = new ManualSpritesheet('images/fantasy-tileset.png');
  player_sprites.buildHorizontal('player', 1, 19, 8, 32, 32);

  var icon_sprites = new ManualSpritesheet('images/fantasy-tileset.png');
  icon_sprites.buildHorizontal('icon', 1, 47, 16, 16, 16); // row number must be in terms of height, ditto to col # vs width

  // Nested scenes allow icons and indicators to be mapped within other scenes
  // to make them easier to manage (i.e., if an enemy moves)
  var player_scene = new Scene([0, 0], [32, 32]);
  player_scene.addScene([0, 0], [32, 32], player_sprites.sprites.player5);

  var icon_scene = new Scene([16, 16], [16, 16]);
  //Animate icon to "bounce"
  icon_scene.update = function() {
    if(this.hidden) this.show();
    else this.hide();

    this.updateInnerScenes();
  }
  icon_scene.sprites.push(icon_sprites.sprites.icon6);
  player_scene.addExistingScene(icon_scene);

  var enemy_sprites = new ManualSpritesheet('images/fantasy-tileset.png');
  enemy_sprites.buildHorizontal('enemy', 1, 22, 8, 32, 32);

  var enemy_scene = new Scene([2,0], [32,32]);
  enemy_scene.addScene([0,0],[32,32], enemy_sprites.sprites.enemy0);
  // enemy_scene.sprites.push(enemy_sprites.sprites.enemy0);

  // Animate shadow background
  // player_scene.shadow_level = 0;
  // player_scene.update = function() {
  //   this.shadow_level++;
  //   if(this.shadow_level > 7) this.shadow_level = 0;
  //   this.sprites = [shadow_sprites.sprites['shadow'+this.shadow_level]];
  //
  //   this.updateInnerScenes();
  // }

  var undefined_scene = new Scene([0,0], [32,32]);
  undefined_scene.sprites.push(shadow_sprites.sprites.shadow0);

  var g = new Game('game_canvas', 2, [10,10], undefined_scene); // 2 fps since not much is animated in this one
  g.addStaticScene(player_scene);
  g.addStaticScene(enemy_scene);
  g.start();
});
