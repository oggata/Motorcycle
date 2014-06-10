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

        this.isPushedCnt = 0;
        this.isPushed  = false;
        this.isRPushed = false;
        this.addSpeedX = 0;
        this.addSpeedY = 0;
        this.addRot    = 0;
        this.rot1      = 0;

        this.setScrollView();

        this.space = new cp.Space();
        // 壁を作る
        var walls = [
            new cp.SegmentShape(this.space.staticBody,cp.v(0,0),cp.v(0,500),20),
            new cp.SegmentShape(this.space.staticBody,cp.v(0,500),cp.v(2000,500),20),
            new cp.SegmentShape(this.space.staticBody,cp.v(2000,500),cp.v(2000,0),20),
            new cp.SegmentShape(this.space.staticBody,cp.v(0,0),cp.v(2000,0),20),
        ];
        for (var i = 0; i < walls.length; i++) {
            var shape = walls[i];
            shape.setElasticity(0.1); //弾性
            shape.setFriction(0.1);   //摩擦
            this.space.addStaticShape(shape);
        }
        this.space.gravity = cp.v(0,-200); // 下方向に重力を設定する

        //set player
        this.player = new Player(this,100,300);
        this.mapNode.addChild(this.player);

        //blocks
        this.blocks = [];

        this.posArray = [
            [400,100],
            [450,100],
            [450,200],
            [500,100],
            [500,200],
            [500,300],
            [550,100],
            [550,200],
            [550,300],
            [550,400],
        ];

        for(var i=0;i<this.posArray.length;i++){
            this.enemy = new Block(this,this.posArray[i][0],this.posArray[i][1],"pos");
            this.blocks.push(this.enemy);
            this.mapNode.addChild(this.enemy);
        }

        for(var i=0;i<15;i++){
            var depX =getRandNumberFromRange(600,1500);
            var depY =getRandNumberFromRange(50,100);
            this.enemy = new Block(this,depX,depY,"rand");
            this.blocks.push(this.enemy);
            this.mapNode.addChild(this.enemy);
        }

        //initialize camera
        this.cameraX = 320/2 - this.player.getPosition().x;
        this.cameraY = 420/2 - this.player.getPosition().y;
        this.playerCameraX = 320/2;
        this.playerCameraY = 420/2;
        this.mapNode.setPosition(
            this.cameraX,
            this.cameraY
        );
        this.scheduleUpdate();
        this.setTouchEnabled(true);

        this.button = cc.Sprite.create(s_button);
        this.addChild(this.button);
        this.button.setAnchorPoint(0,0);
        this.button.setPosition(0,0);

        var draw = cc.DrawNode.create();
        this.line = draw.drawSegment(
            cc.p(0,0),
            cc.p(2000,0),
            20,
            cc.c4f(0,1,0,1)
        );
        this.mapNode.addChild(draw);

        //カットイン
        this.cutIn = new CutIn();
        this.cutIn.setPosition(0,200);
        this.addChild(this.cutIn,999);
        this.cutIn.set_text("スタート!");

        this.retryButton = new ButtonItem("RETRY",100,50,this.retry,this);
        this.retryButton.setPosition(240,450);
        this.addChild(this.retryButton);

        //ゲージ1
        this.gauge = new Gauge(200,20,'blue');
        this.gauge.setPosition(50,400);
        this.addChild(this.gauge);

        return true;
    },

    setScrollView : function() {
        //ウィンドウのサイズを取得する
        var winSize = cc.Director.getInstance().getWinSize();

        //スクロールさせる対象のmapNodeを作る
        this.mapNode = cc.Node.create();
        this.mapNode.setContentSize(100,100);
/*
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
*/
        //スクロールViewを追加
        this.addChild(this.mapNode);
    },

    update:function(dt){

        if(this.isPushedCnt >= 1){
            this.isPushedCnt++;
            if(this.isPushedCnt>=20){
                this.isPushedCnt = 0;
            }
        }

        this.cutIn.update();
        this.player.update();
        this.gauge.update( this.player.dx / this.player.maxDx );

        if(this.player.isNoRun == true){
            this.cutIn.set_text("GAME OVER");
        }

        if(this.addRot > 0){
            this.addRot-=0.2;
        }
        if(this.addRot < 0){
            this.addRot+=0.2;
        }

        //blocks 死亡時の処理、Zソート
        this.addSpeedY = 0;
        for(var i=0;i<this.blocks.length;i++){
            this.blocks[i].update();
            var distance = cc.pDistance(
                this.player.body.getPos(),this.blocks[i].body.getPos()
            );
            //距離が100以下 + このboxのy座標が自身より上にある場合のみ
            if(this.player.body.getPos().y < this.blocks[i].body.getPos().y + 50){
                if(distance < 150){
                    this.addSpeedY = 1;
                }
            }
        }
        this.moveCamera();
        if(this.isPushed == true){
            this.player.dx += this.addSpeedX;
            if(this.isPushedCnt>=1){
                this.player.dy+=this.addSpeedY;
            }else{
                this.player.dy = 0;
            }
        }else{
            this.player.dx = 0;
            this.player.dy = 0;
        }
        if(this.isRPushed == true){
            this.addRot += this.rot1;
        }
        this.space && this.space.step(dt);
    },

    moveCamera:function(){
        //カメラ位置はプレイヤーを追いかける
        this.playerCameraX = this.player.body.getPos().x + this.cameraX;
        this.playerCameraY = this.player.body.getPos().y + this.cameraY;
        
        this.cameraX -= this.playerCameraX - 320/2;
        this.cameraY -= this.playerCameraY - 200;

        this.mapNode.setPosition(
            this.cameraX,
            this.cameraY
        );
    },


//デバイス入力----->
    onTouchesBegan:function (touches, event) {
        if(this.isToucheable() == false) return;

        
        this.touched = touches[0].getLocation();

        if(20 <= this.touched.x && this.touched.x <= 60 &&
            10 <= this.touched.y && this.touched.y <= 50){
            playSE();
            this.isPushed = true;
            this.addSpeedX = -1;

            this.isPushedCnt = 1;
        }

        if(90 <= this.touched.x && this.touched.x <= 130 &&
            10 <= this.touched.y && this.touched.y <= 50){
            playSE();
            this.isPushed = true;
            this.addSpeedX = 1;

            this.isPushedCnt = 1;
        }

        if(180 <= this.touched.x && this.touched.x <= 225 &&
            10 <= this.touched.y && this.touched.y <= 50){
            this.isRPushed = true;
            this.rot1+=1;
        }

        if(250 <= this.touched.x && this.touched.x <= 300 &&
            10 <= this.touched.y && this.touched.y <= 50){
            this.isRPushed = true;
            this.rot1-=1;
        }
    },

    onTouchesMoved:function (touches, event) {
        //if(this.isToucheable() == false) return;
        this.touched = touches[0].getLocation();
    },

    onTouchesEnded:function (touches, event) {
        this.player.isCanMove = true;
        this.isPushed  = false;
        this.isRPushed = false;
        this.addSpeedX = 0;
        this.rot1      = 0;
        //this.addSpeedY = 0;
        stopSE();
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

    retry:function() {
        this.player.body.setPos(
            cp.v(100,300)
        );
        this.player.isNoRun = false;
        this.player.body.setAngle(0);
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
        if(this.player.isNoRun == true){
            return false;
        }
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

