var game = new Phaser.Game(400, 400, 'game', Phaser.Auto);

game.state.add('PlayState', PlayState);

game.state.start('PlayState');
