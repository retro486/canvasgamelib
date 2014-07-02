// Load spritesheets
var cauldron_sprite = new StaticSprite('images/boil.gif', 32, 32);
cauldron_sprite.sw = 64;
cauldron_sprite.sh = 64;

var goblin = new SymmetricalSpritesheet('images/goblinsword_0.png', 5, 11, 65, 64, [
  'walk1', 'walk2', 'walk3', 'walk4', 'walk5', 'walk6',
  'attack1', 'attack2', 'attack3', 'attack4'
], 'linear');

// Last line of goblin sheet has dying animation but it's only 4 frames so can't use symmetricalspritesheet
var goblin_death = new ManualSpritesheet('images/goblinsword_0.png');
for(var i=0; i < 6; i++) {
  goblin_death.markSprite('death' + i, (65*i), (64*4), 65, 64);
}

var player = new SymmetricalSpritesheet('images/dwarves.png', 12, 20, 100, 80, [
  'idle1', 'idle2', 'idle3', 'idle4',
  'walk1', 'walk2', 'walk3', 'walk4', 'walk5', 'walk6',
  'attack1', 'attack2', 'attack3', 'attack4',
  'death1', 'death2',
  'net1', 'net2', 'net3', 'net4'
], 'linear');

// Init attack sprite animation
var attack_sprites = [];
for(var i = 1; i < 5; i++) {
  attack_sprites.push(player.sprites['attack' + i + '_8']);
}
var player_attack_scene = AnimatedScene(100, 80, attack_sprites, function() {
  player_attack_scene.hide();
  player_idle_scene.show();
});
player_attack_scene.x = 110;
player_attack_scene.hide();

// Init walking sprite animation
var walk_sprites = [];
for(var i = 1; i < 6; i++) {
  walk_sprites.push(player.sprites['walk' + i + '_4']);
}
var player_walk_scene = AnimatedScene(100, 80, walk_sprites);
player_walk_scene.x = 55;

// Init idle sprite animation
var idle_sprites = [];
for(var i = 1; i < 5; i++) {
  idle_sprites.push(player.sprites['idle' + i + '_0']);
}
var player_idle_scene = AnimatedScene(100, 80, idle_sprites);

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
var goblin_walk_south_scene = AnimatedScene(65, 64, goblin_walk_south_sprites);
goblin_walk_south_scene.y = 100;

// Init goblin attacking west animation
var goblin_attack_west_sprites = [];
for(var i = 1; i < 5; i++) {
  goblin_attack_west_sprites.push(goblin.sprites['attack' + i + '_1']);
}
// Adjust by 1 frame just to mix it up a little.
var t = goblin_attack_west_sprites.shift();
goblin_attack_west_sprites.push(t);
var goblin_attack_west_scene = AnimatedScene(65, 64, goblin_attack_west_sprites);
goblin_attack_west_scene.y = 100;
goblin_attack_west_scene.x = 80;
goblin_attack_west_scene.pause_count = 0;
goblin_attack_west_scene.last_frame = false;
goblin_attack_west_scene.afterUpdate = function() {
  if(this.current_i == this.sprites.length - 1) this.last_frame = true;
  if(this.last_frame) {
    this.pause();
  }

  if(!this.play) this.pause_count++;
  if(this.pause_count == 34 && !this.play) {
    this.pause_count = 0;
    this.last_frame = false;
    this.resume();
  }
};

// Can be lazy and just flip sprites but clever people will notice weapon hands switching from left to right
var goblin_attack_east_scene = AnimatedScene(65, 64, goblin_attack_west_sprites, function() {
  goblin_attack_east_scene.hide();
  goblin_death_scene.show();
});
goblin_attack_east_scene.y = 100;
goblin_attack_east_scene.x = 110;
goblin_attack_east_scene.invert_h = true;

// Enforces proper order since Object.keys doesn't guarantee order is retained
var goblin_death_sprites = [];
for(var i = 0; i < 5; i++) {
  goblin_death_sprites.push(goblin_death.sprites['death'+i]);
}
var goblin_death_scene = AnimatedScene(65, 64, goblin_death_sprites, function() {
  goblin_death_scene.hide();
  goblin_attack_east_scene.show(); // some trigger will set this to true
});
goblin_death_scene.y = 100;
goblin_death_scene.x = 110;
goblin_death_scene.last_frame = false;
goblin_death_scene.pause_count = 0;
goblin_death_scene.hide();
goblin_death_scene.afterUpdate = function() {
  if(this.current_i == this.sprites.length - 1) this.last_frame = true;
  if(this.last_frame) {
    this.pause();
  }

  if(!this.play) this.pause_count++;
  if(this.pause_count == 30 && !this.play) {
    this.pause_count = 0;
    this.last_frame = false;
    this.resume();
  }
};

// Init static image - would be backgrounds, non-interactive items.
var cauldron_scene = new Scene(32, 32);
cauldron_scene.sprites.push(cauldron_sprite);

var game = new Game();
game.addStaticScene(cauldron_scene);
var animated_scenes = [player_walk_scene, player_idle_scene, player_attack_scene,
   goblin_walk_south_scene, goblin_attack_west_scene, goblin_attack_east_scene, goblin_death_scene];
for(var i=0; i < animated_scenes.length; i++)
  game.addAnimatedScene(animated_scenes[i]);

game.start();
