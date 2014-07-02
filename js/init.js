// Load spritesheets
var goblin = new SymmetricalSpritesheet('images/goblinsword_0.png', 5, 11, 65, 64, [
  'walk1', 'walk2', 'walk3', 'walk4', 'walk5', 'walk6',
  'attack1', 'attack2', 'attack3', 'attack4'
], function() {
  // TODO send signal to some async trigger that will launch animatons...
  // this will have to come after game core init so we can reference it here
  // window.requestAnimationFrame(anim);
}, 'linear');

var player = new SymmetricalSpritesheet('images/dwarves.png', 12, 20, 100, 80, [
  'idle1', 'idle2', 'idle3', 'idle4',
  'walk1', 'walk2', 'walk3', 'walk4', 'walk5', 'walk6',
  'attack1', 'attack2', 'attack3', 'attack4',
  'death1', 'death2',
  'net1', 'net2', 'net3', 'net4'
], function() {
  // this will have to come after game core init so we can reference it here
  window.requestAnimationFrame(anim);
}, 'linear');

// LINES TO PUT IN GAME CORE
var buffer = document.createElement('canvas');
var buffer_ctx = buffer.getContext('2d');
buffer.width = 640;
buffer.height = 480;
buffer.id = 'canvas_id';

var anim = function() {
  // trick to smooth out requestanimationframe being too damned fast
  // http://creativejs.com/resources/requestanimationframe/
  setTimeout(function() {
    window.requestAnimationFrame(anim);

    var screen = document.getElementById('canvas_id');

    player_attack_scene.update();
    player_idle_scene.update();
    player_walk_scene.update();
    goblin_walk_south_scene.update();
    goblin_attack_west_scene.update();

    buffer_ctx.clearRect(0,0,buffer.width,buffer.height);

    player_attack_scene.draw();
    player_idle_scene.draw();
    player_walk_scene.draw();
    goblin_walk_south_scene.draw();
    goblin_attack_west_scene.draw();

    screen.parentNode.replaceChild(buffer, screen);
  }, 1000 / 5); // 5 fps
}
// END GAME CORE

// Init attack sprite animation
var attack_sprites = [];
for(var i = 1; i < 5; i++) {
  attack_sprites.push(player.sprites['attack' + i + '_8']);
}
var player_attack_scene = AnimatedScene(buffer, 100, 80, attack_sprites, function() {
  player_attack_scene.hide();
  player_idle_scene.show(); // some trigger will set this to true
});
player_attack_scene.x = 110;
player_attack_scene.hide();

// Init walking sprite animation
var walk_sprites = [];
for(var i = 1; i < 6; i++) {
  walk_sprites.push(player.sprites['walk' + i + '_4']);
}
var player_walk_scene = AnimatedScene(buffer, 100, 80, walk_sprites);
player_walk_scene.x = 55;

// Init idle sprite animation
var idle_sprites = [];
for(var i = 1; i < 5; i++) {
  idle_sprites.push(player.sprites['idle' + i + '_0']);
}
var player_idle_scene = AnimatedScene(buffer, 100, 80, idle_sprites);

// Add custom handling to stand idle for 4 full cycles, then attack.
player_idle_scene.cycle_count = 0;
player_idle_scene.afterUpdate = function() {
  if(this.current_i == this.sprites.length - 1) this.cycle_count++;
  if(this.cycle_count == 4) {
    this.cycle_count = 0;
    this.hide();
    player_attack_scene.show();
  }
};

// Init goblin walking down animation
var goblin_walk_south_sprites = [];
for(var i = 1; i < 7; i++) {
  goblin_walk_south_sprites.push(goblin.sprites['walk' + i + '_0']);
}
var goblin_walk_south_scene = AnimatedScene(buffer, 65, 64, goblin_walk_south_sprites);
goblin_walk_south_scene.y = 100;

// Init goblin attacking west animation
var goblin_attack_west_sprites = [];
for(var i = 1; i < 5; i++) {
  goblin_attack_west_sprites.push(goblin.sprites['attack' + i + '_1']);
}
var goblin_attack_west_scene = AnimatedScene(buffer, 65, 64, goblin_attack_west_sprites);
goblin_attack_west_scene.y = 100;
goblin_attack_west_scene.x = 80;
