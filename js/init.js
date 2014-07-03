// Spritesheet by Jerom (http://opengameart.org/content/32x32-fantasy-tileset)
// Because this is a master sheeet (all sprites in one file) we have to manually extract the sprites.
// 26 rows, 8 columns, last 3 rows contain custom sized sprites/UI elements
// Large sprites 32x32, medium 16x16, small 8x8
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
var icon_scene = player_scene.addScene([16, 16], [16, 16], icon_sprites.sprites.icon6);
player_scene.sprites.push(shadow_sprites.sprites.shadow0); // scene background sprites; inner-scenes should draw on top of this

console.debug(player_scene);

var game = new Game(2); // 2 fps since not much is animated in this one
game.addStaticScene(player_scene);
game.start();
