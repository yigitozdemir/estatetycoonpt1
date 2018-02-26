var PlayState = {
    tileWidth:197.590,
    tileHeight: 114.079,
    a: 0,
    aTimesSqrtThree: 0,

    xTiles: 10,
    yTiles: 10,

    cursors: null,
    cameraSpeed: 6,
    worldSize: 5000,
    worldStart: -800,

    menuOpened: false,
    buySmallHouseButton: null,

    selectedTile: null,

    moneyText: null,
    moneyStyle: {font: '45px Arial', fill: '#FFF'},
    money: 200,

    infoTextStyle: {font: '15px Arial', fill:'#000'},

    tileGroup: null,

    timeRequiredToChangeValue: 1000,
    timeElapsedSinceLastValueChange: 0,


    preload: function(){
        //menu
        this.load.image('menu', 'assets/Menu.png');
        this.load.image('smallhousebutton', 'assets/smallhousebutton.png');

        //empty tile
        this.load.image('empty', 'assets/tile.png');
        this.load.image('empty-hover', 'assets/emptyHover.png');
        this.load.image('empty-selected', 'assets/emptySelected.png');

        this.load.image('smallhouse', 'assets/smallhouse.png');
        this.load.image('smallhouse-hover', 'assets/smallhouseHover.png');
    },


    create: function(){
        this.world.setBounds(this.worldStart, this.worldStart, this.worldSize, this.worldSize);
        this.cursors = this.input.keyboard.createCursorKeys();

        this.tileGroup = this.add.group();

        var sqrtThree = Math.sqrt(3);
        this.a = this.tileHeight / 2;
        this.aTimesSqrtThree = this.a * sqrtThree;

        this.drawTiles();
        this.drawMenu();

        this.moneyText = this.add.text(5, 5, '$100', this.moneyStyle);
        this.moneyText.fixedToCamera = true;
    },

    drawMenu: function(){
        var sprite = this.add.sprite(0, 0, 'menu');
        sprite.width = this.tileWidth / 4;
        sprite.height = sprite.width;

        sprite.x = 5;
        sprite.y = game.height - sprite.height; + 5

        sprite.fixedToCamera = true;
        sprite.inputEnabled = true;

        sprite.events.onInputUp.add(this.menuClicked);

        this.buySmallHouseButton = this.add.sprite(0, 0, 'smallhousebutton');
        this.buySmallHouseButton.width = sprite.width;
        this.buySmallHouseButton.height = sprite.height;

        this.buySmallHouseButton.x = 5 + sprite.width + sprite.x;
        this.buySmallHouseButton.y = sprite.y;
        this.buySmallHouseButton.inputEnabled = true;
        this.buySmallHouseButton.events.onInputUp.add(this.buySmallHouse);
        this.buySmallHouseButton.visible = false;


        this.buySmallHouseButton.fixedToCamera = true;
    },

    drawTiles: function(){
        var xStartPoint = 0;
        var yStartPoint = 0;

        for(var j = 0; j < this.yTiles; j++){
            for(var i = 0; i < this.xTiles; i++){
                var x = i * 2 * this.aTimesSqrtThree + xStartPoint;
                var y = j * 2 * this.a + yStartPoint;
                var sprite = this.add.sprite(x, y, 'empty');
                sprite.inputEnabled = true;
                sprite.events.onInputOver.add(this.inputOverSprite);
                sprite.events.onInputOut.add(this.inputOutSprite);
                sprite.events.onInputUp.add(this.inputUpSprite);

                sprite.moneyValue = 0;
                sprite.moneyText = this.add.text(this.aTimesSqrtThree + x, y + this.a, sprite.moneyValue, this.infoTextStyle);

                sprite.owner = Owner.COMPUTER;
                sprite.type = TileType.EMPTY;

                this.tileGroup.add(sprite);
            }
            xStartPoint -= this.aTimesSqrtThree;
            yStartPoint -= this.a;
        }
    },

    buySmallHouse: function(){
        if(PlayState.selectedTile !== null && PlayState.money >= Costs.SMALL_HOUSE){
            PlayState.selectedTile.key = 'smallhouse';
            PlayState.selectedTile.loadTexture ('smallhouse', 0)
            PlayState.selectedTile.type = TileType.SMALL_HOUSE;

            PlayState.money -= Costs.SMALL_HOUSE;
            PlayState.selectedTile.moneyValue = StartValues.SMALL_HOUSE;

            PlayState.selectedTile.moneyText.text = StartValues.SMALL_HOUSE;

            PlayState.selectedTile = null;
        }

    },

    menuClicked: function(){
        if(PlayState.menuOpened) {
            PlayState.menuOpened = false;
            PlayState.buySmallHouseButton.visible = false;

        } else {
            PlayState.menuOpened = true;
            PlayState.buySmallHouseButton.visible = true;
        }
    },

    inputUpSprite: function(item){
        if(item.key.indexOf('selected') < 0 && PlayState.selectedTile == null){
            PlayState.selectedTile = item;
            if(item.type == TileType.EMPTY){
                item.key = 'empty-selected';
                item.loadTexture('empty-selected', 0);
            }
        }

        else {
            PlayState.selectedTile = null;
            if(item.type == TileType.EMPTY){
                item.key='empty';
                item.loadTexture('empty', 0);
            }

        }

    },

    inputOverSprite: function(item){
        if(item.key.indexOf('selected')  < 0){
            if(item.type == TileType.EMPTY){
                item.key = 'empty-hover';
                item.loadTexture('empty-hover', 0);
            }

        }
    },

    inputOutSprite: function(item){
        if(item.key.indexOf('selected') < 0){
            if(item.type == TileType.EMPTY){
                item.key='empty';
                item.loadTexture('empty', 0);
            }

        }

    },

    update: function(){
        this.moveCamera();

        this.moneyText.text = '$' + this.money;

        this.timeElapsedSinceLastValueChange += this.time.elapsedMS;

        if(this.timeElapsedSinceLastValueChange >= this.timeRequiredToChangeValue){
            this.timeElapsedSinceLastValueChange = 0;

            this.tileGroup.forEach(function(item){
                if(item.type != TileType.EMPTY){
                    if(Math.random() < 0.55){
                        item.moneyValue += 1;
                        item.moneyText.text = item.moneyValue;
                    } else {
                        item.moneyValue -= 1;
                        item.moneyText.text = item.moneyValue;
                    }

                }

            });

        }

    },

    moveCamera: function(){
        if(this.cursors.down.isDown){
            this.camera.y += this.cameraSpeed;
        }

        if(this.cursors.up.isDown){
            this.camera.y -= this.cameraSpeed;
        }
        if(this.cursors.left.isDown){
            this.camera.x -= this.cameraSpeed;
        }

        if(this.cursors.right.isDown){
            this.camera.x += this.cameraSpeed;
        }
    },
    render: function(){}

};
