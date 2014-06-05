//
//  CharaLayer.js
//  Territory
//
//  Created by Fumitoshi Ogata on 5/30/14.
//  Copyright (c) 2014 http://oggata.github.io All rights reserved.
//

var GameLayer = cc.Layer.extend({
    ctor:function (storage) {
        this._super();
        this.storage  = storage;
    },

    init:function () {
        this._super();

        if ('touches' in sys.capabilities || sys.platform == "browser")
                this.setTouchEnabled(true);
        else if ('mouse' in sys.capabilities)
                this.setMouseEnabled(true);

        this.handleRotation = 0;

        //3:android 4:iphone 5:ipad 100:mobile_web 101:pc_web
        var platform = cc.Application.getInstance().getTargetPlatform();
        if(platform == 100 || platform == 101){
            this.changeLoadingImage();
        }
        
        this.movePosArry = [];

        this.setParams();
        this.setScrollView();

        this.obstacles = [];

        var playerDepX = 0;
        var playerDepY = 0;


        var tilemap = cc.TMXTiledMap.create(tmx_stage_001);
        tilemap.setPosition(0,0);
        this.mapNode.addChild(tilemap);

        var mapWidth   = tilemap.getMapSize().width;
        var mapHeight  = tilemap.getMapSize().height;
        var tileWidth  = tilemap.getTileSize().width;
        var tileHeight = tilemap.getTileSize().height;

        
        var tileNum = 1;
        //TiledMapEditorのレイヤーで設定した名前を取得する
        var collidableLayer = tilemap.getLayer("collision");
        var startLayer      = tilemap.getLayer("start");

        var playerDepX = 0;
        var playerDepY = 0;
        for (x = 0; x < mapWidth; x++){
            for (y = 0; y < mapHeight; y++){
                //タイルコードを取得できる
                var tileCoord = new cc.Point(x,y);
                //タイルコードからgidを取得する。もしgidが存在していれば当たり判定するオブジェクトとして扱う
                var gid = collidableLayer.getTileGIDAt(tileCoord);
                var tileXPositon = 0;
                var tileYPosition = 0;
                if(gid) {
                    tileXPositon  = (tileWidth * (mapWidth/2) -tileWidth/2) - (y*(tileWidth/2)) + x*tileWidth/2;
                    tileYPosition = (mapHeight * (tileHeight) -tileWidth/2) - (y*tileHeight/2)  - x*tileHeight/2;

                    //タイルが存在しているので、あたり判定するための矩形を作成する
                    var square = cc.LayerColor.create(cc.c4b(128,128,0,255*0),200,100);
                    square.setPosition(tileXPositon + tileWidth/2,tileYPosition + tileHeight/2);
                    this.obstacles.push(square);
                    this.mapNode.addChild(square);

                    var red = cc.LayerColor.create(cc.c4b(255,0,0,255*0),5,5);
                    red.setPosition(tileXPositon + tileWidth/2,tileYPosition + tileHeight/2);
                    this.mapNode.addChild(red);
                }

                var stargGid = startLayer.getTileGIDAt(tileCoord);
                if(stargGid){
                    playerDepX  = (tileWidth * (mapWidth/2) -tileWidth/2) - (y*(tileWidth/2)) + x*tileWidth/2;
                    playerDepY = (mapHeight * (tileHeight) -tileWidth/2) - (y*tileHeight/2)  - x*tileHeight/2;   
                }

                tileNum++;
            }
        }


/*
        this.smoke = cc.MotionStreak.create(1,0.05,20,cc.c3b(255,0,0),s_texture);
        this.smoke.setPosition(playerDepX,playerDepY);
        this.mapNode.addChild(this.smoke);
*/
        //set player
        this.player = new Player(this);
        this.player.setPosition(playerDepX,playerDepY);
        this.mapNode.addChild(this.player);

        //initialize camera
        this.cameraX = 320/2 - this.player.getPosition().x;
        this.cameraY = 420/2 - this.player.getPosition().y;
        this.playerCameraX = 320/2;
        this.playerCameraY = 420/2;
        this.mapNode.setPosition(
            this.cameraX,
            this.cameraY
        );
//risizing TextureAtlas capacity from
        //s_header
        this.imgHandle = cc.Sprite.create(s_handle);
        this.imgHandle.setPosition(320/2,100);
        this.imgHandle.setAnchorPoint(0.5,0.5);
        this.imgHandle.setRotation(this.handleRotation);
        this.addChild(this.imgHandle);




/*
        //bgm
        playBGM();

        if ('touches' in sys.capabilities || sys.platform == "browser")
                this.setTouchEnabled(true);
        else if ('mouse' in sys.capabilities)
                this.setMouseEnabled(true);

        this.setUI();
*/
        this.scheduleUpdate();
        this.setTouchEnabled(true);
        return true;
    },

    startGame : function() {
        if(this.isMissionVisible == true){
            playSystemButton();
            this.isMissionVisible = false;
            this.sp.setVisible(false);
            this.titleLabel.setVisible(false);
            this.startButton.setVisible(false);
            this.rectBase.setVisible(false);
            this.titleLimit.setVisible(false);
        }
    },

    setScrollView : function() {
        //ウィンドウのサイズを取得する
        var winSize = cc.Director.getInstance().getWinSize();

        //スクロールさせる対象のmapNodeを作る
        this.mapNode = cc.Node.create();
        this.mapNode.setContentSize(100,100);

        //スクロール用のNodeを作って、青色を付けたNodeを追加する
        this.scrollView = cc.ScrollView.create(cc.size(winSize.width,winSize.height), this.mapNode);

        //スクロールのバウンスを行う
        this.scrollView.setBounceable(true);
        this.scrollView.setDirection(cc.SCROLLVIEW_DIRECTION_NONE);
        this.scrollView.updateInset();

        //スクロールViewの位置
        this.scrollView.setPosition(0,0);

        //mapNodeの初期位置を設定
        this.scrollView.setContentOffset(cc.p(0,0),true);
        this.scrollView.ignoreAnchorPointForPosition(true);
        this.scrollView.setDelegate(this);

        //スクロールViewを追加
        this.addChild(this.scrollView);
    },

    setParams : function() {
        this.mapWidth        = 1000;
        this.mapHeight       = 1000;
        this.getEnergyCnt    = 0;
        this.isMissionVisible = true;
        this.isStepOn        = false;
        this.scrollType      = 1;
        this.isMovedResult   = false;
        this.colleagueCnt    = 0;
        this.mapScale        = 1;
        this.strategyCode    = CONFIG.DEFAULT_STORATEGY_CODE;
        this.enemySetTime    = 0;
        this.territoryCnt    = 0;
        this.territoryMaxCnt = 0;
        this.coins           = [];
        this.bullets         = [];
        this.enemyBullets    = [];
        this.enemies         = [];
        this.colleagues      = [];
        //mission
        this.missionNumber   = this.storage.missionNumber;
        this.missionLabel    = this.storage.missionTitle;
        this.missionCnt      = 0;
        this.missionMaxCnt   = this.storage.missionMaxCnt;

        this.timeCnt         = 0;
        this.missionTimeLimit= this.storage.missionTimeLimit;
    },

    setUI : function(){
        //UI
        this.gameUI = new GameUI(this);
        this.addChild(this.gameUI,999);

        //カットイン
        this.cutIn = new CutIn();
        this.cutIn.setPosition(0,200);
        this.addChild(this.cutIn,999);
        this.cutIn.set_text("スタート!");

        this.rectBase = cc.LayerColor.create(cc.c4b(0,0,0,255 * 0.8),320,480);
        this.rectBase.setPosition(0,0);
        this.addChild(this.rectBase,CONFIG.UI_DROW_ORDER);

        //タイトル背景
        this.sp = cc.Sprite.create(s_mission_start);
        this.sp.setAnchorPoint(0,0);
        this.addChild(this.sp,CONFIG.UI_DROW_ORDER);

        //時間制限
        this.titleLimit = cc.LabelTTF.create("制限時間 : " + Math.floor(this.missionTimeLimit / 30) + "秒","Arial",20);   
        this.titleLimit.setPosition(320/2,250);
        this.addChild(this.titleLimit,CONFIG.UI_DROW_ORDER);

        //タイトル文字
        this.titleLabel = cc.LabelTTF.create(this.missionLabel,"Arial",25);   
        this.titleLabel.setPosition(320/2,280);
        this.addChild(this.titleLabel,CONFIG.UI_DROW_ORDER);

        //スタートボタン
        this.startButton = new ButtonItem("START",200,50,this.startGame,this);
        this.startButton.setPosition(160,150);
        this.addChild(this.startButton,CONFIG.UI_DROW_ORDER);
    },

    update:function(dt){
        this.player.update();
        this.moveCamera();
        

        this.imgHandle.setRotation(this.handleRotation);

        if(this.handleRotation > 10){
            this.player.angle -=2;
        }
        if(this.handleRotation < -10){
            this.player.angle +=2;
        }
/*
        this.smoke.setPosition(
            this.player.getPosition().x,
            this.player.getPosition().y - 7
        );
*/




       for(var i=0;i<this.obstacles.length;i++){
            var obstacle = this.obstacles[i];
            //たとえばplayerというオブジェクトが存在していたとしたら、壁との距離を取得して一定以下の場合は衝突とみなす
            var distance = cc.pDistance(this.player.getPosition(),obstacle.getPosition());
            if(distance < 100){
                //cc.log("hit!!:[" + i + "]");
                var dx = this.player.getPosition().x - obstacle.getPosition().x;
                var dy = this.player.getPosition().y - obstacle.getPosition().y;
                if(dx>0){
                    this.player.setPosition(
                        this.player.getPosition().x + this.player.walkSpeed,
                        this.player.getPosition().y
                    );
                }
                if(dx<0){
                    this.player.setPosition(
                        this.player.getPosition().x - this.player.walkSpeed,
                        this.player.getPosition().y
                    );
                }
                if(dy>0){
                    this.player.setPosition(this.player.getPosition().x,this.player.getPosition().y + this.player.walkSpeed);
                }
                if(dy<0){
                    this.player.setPosition(this.player.getPosition().x,this.player.getPosition().y - this.player.walkSpeed);
                }

            } 
        }




    },


    moveCamera:function(){
        //カメラ位置はプレイヤーを追いかける
        this.playerCameraX = this.player.getPosition().x + this.cameraX;
        this.playerCameraY = this.player.getPosition().y + this.cameraY;
        

this.cameraX -= this.playerCameraX - 320/2;
this.cameraY -= this.playerCameraY - 300;



/*
        //xの中心は320/2=16 +- 20
        if(this.playerCameraX >= 320/2 + 20){
            this.cameraX -= this.player.walkSpeed;
        }
        if(this.playerCameraX <= 320/2 - 20){
            this.cameraX += this.player.walkSpeed;
        }
        //yの中心は420/2=210 +- 20
        if(this.playerCameraY >= 420/2 - 20){
            this.cameraY -= this.player.walkSpeed;
        }
        if(this.playerCameraY <= 420/2 + 20){
            this.cameraY += this.player.walkSpeed;
        }
  
        this.mapNode.setScale(this.mapScale,this.mapScale);
*/
        this.mapNode.setPosition(
            this.cameraX,
            this.cameraY
        );
    },

    addColleagues:function(num){
        for (var i=0 ; i <  num ; i++){
            this.colleague = new Colleague(this);
            this.mapNode.addChild(this.colleague,100);
            var depX = getRandNumberFromRange(this.player.getPosition().x - 50,this.player.getPosition().x + 50);
            var depY = getRandNumberFromRange(this.player.getPosition().y - 50,this.player.getPosition().y + 50);
            this.colleague.setPosition(depX,depY);
            this.colleague.isChase = true;
            this.colleagues.push(this.colleague);
        }
    },



//デバイス入力----->

    onTouchesBegan:function (touches, event) {
        //if(this.isToucheable() == false) return;
        this.touched = touches[0].getLocation();
        /*
        var tPosX = (this.touched.x - this.cameraX) / this.mapScale;
        var tPosY = (this.touched.y - this.cameraY) / this.mapScale;
        this.targetSprite.setPosition(tPosX,tPosY);
        */
    },

    onTouchesMoved:function (touches, event) {
        //if(this.isToucheable() == false) return;
        this.touched = touches[0].getLocation();

        if(this.touched.x >= 180){
            //右
            if(this.beforeY < this.touched.y){
                this.handleRotation-=1;
            }
            if(this.beforeY > this.touched.y){
                this.handleRotation+=1;
            }
            this.beforeY =this.touched.y;
        }else{
            //右
            if(this.beforeY < this.touched.y){
                this.handleRotation+=1;
            }
            if(this.beforeY > this.touched.y){
                this.handleRotation-=1;
            }
            this.beforeY =this.touched.y;
        }



/*
        var tPosX = (this.touched.x - this.cameraX) / this.mapScale;
        var tPosY = (this.touched.y - this.cameraY) / this.mapScale;

        this.smoke.setPosition(tPosX,tPosY);
        var obj = [tPosX,tPosY];
        this.movePosArry.push(obj);
*/
    },

    onTouchesEnded:function (touches, event) {
        this.player.isCanMove = true;
        //this.movePosArry = [];
    },

    onTouchesCancelled:function (touches, event) {
    },

//シーンの切り替え----->

    goResultLayer:function (pSender) {
        //ステージを追加
        this.storage.stageNumber++;
        if(this.storage.maxStageNumber <= this.storage.stageNumber){
            this.storage.maxStageNumber = this.storage.stageNumber;
        }
        this.storage.calcTotal();
        this.saveData();

        if(this.storage.stageNumber >= CONFIG.MAX_STAGE_NUMBER){
            //全クリア
            var scene = cc.Scene.create();
            scene.addChild(StaffRollLayer.create(this.storage));
            cc.Director.getInstance().replaceScene(cc.TransitionFade.create(1.2, scene));
        }else{
            var scene = cc.Scene.create();
            //次のステージへいくためにstorageは必ず受けた渡す
            scene.addChild(ResultLayer.create(this.storage));
            //時計回り
            cc.Director.getInstance().replaceScene(cc.TransitionFade.create(1.5,scene));
        }
    },

    goGameOverLayer:function (pSender) {
        this.storage.calcTotal();

        this.saveData();

        var scene = cc.Scene.create();
        scene.addChild(GameOverLayer.create(this.storage));
        cc.Director.getInstance().replaceScene(cc.TransitionProgressRadialCW.create(1.2, scene));
    },

    saveData :function(){
        //3:android 4:iphone 5:ipad 100:mobile_web 101:pc_web
        var platform = cc.Application.getInstance().getTargetPlatform();
        this.storage = new Storage();  
        if(platform == 100 || platform == 101){
            var toObjString = this.storage.getJson();
            var toObj = JSON.parse(toObjString);
            window.localStorage.setItem("gameStorage",JSON.stringify(toObj));
        }
    },

    isToucheable:function (){
        return true;
    },

    changeLoadingImage:function(){
        //ローディング画像を変更
        var loaderScene = new cc.LoaderScene();
        loaderScene.init();
        loaderScene._logoTexture.src    = "res/loading.png";
        loaderScene._logoTexture.width  = 100;
        loaderScene._logoTexture.height = 100;
        cc.LoaderScene._instance = loaderScene;
    }

});

GameLayer.create = function (storage) {
    var sg = new GameLayer(storage);
    if (sg && sg.init()) {
        return sg;
    }
    return null;
};

