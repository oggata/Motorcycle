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
        this.isPushed = false;
        this.addSpeedX = 0;
        this.addSpeedY = 0;
        if ('touches' in sys.capabilities || sys.platform == "browser")
                this.setTouchEnabled(true);
        else if ('mouse' in sys.capabilities)
                this.setMouseEnabled(true);
        //this.setParams();
        this.setScrollView();

        this.space = new cp.Space();
        // 壁を作る
        var walls = [
            new cp.SegmentShape(this.space.staticBody,cp.v(0,0),cp.v(0,500),0),    // right
            new cp.SegmentShape(this.space.staticBody,cp.v(0,500),cp.v(2000,500),0),    // right
            new cp.SegmentShape(this.space.staticBody,cp.v(2000,500),cp.v(2000,0),0),    // right
            new cp.SegmentShape(this.space.staticBody,cp.v(0,0),cp.v(2000,0),0),    // right
        ];
        for (var i = 0; i < walls.length; i++) {
            var shape = walls[i];
            shape.setElasticity(0.1); //弾性
            shape.setFriction(0.1);   //摩擦
            this.space.addStaticShape(shape);
        }
        this.space.gravity = cp.v(0,-98); // 下方向に重力を設定する

        //set player
        this.player = new Player(this,200,300);
        this.mapNode.addChild(this.player);

        //Enemies
        this.enemies = [];
        for(var i=0;i<15;i++){
            var depX =getRandNumberFromRange(100,1800);
            var depY =getRandNumberFromRange(50,100);
            this.enemy = new Block(this,depX,depY);
            this.enemies.push(this.enemy);
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
        this.player.update();

        //Enemies 死亡時の処理、Zソート
        for(var i=0;i<this.enemies.length;i++){
            this.enemies[i].update();
        }


        this.moveCamera();
        if(this.isPushed == true){
            this.player.dx += this.addSpeedX;
            this.player.dy += this.addSpeedY;
        }else{
            this.player.dx = 0;
            this.player.dy = 0;
        }
        this.space && this.space.step(dt);
    },


    moveCamera:function(){
        //カメラ位置はプレイヤーを追いかける
        this.playerCameraX = this.player.body.getPos().x + this.cameraX;
        this.playerCameraY = this.player.body.getPos().y + this.cameraY;
        
        this.cameraX -= this.playerCameraX - 320/2;
        this.cameraY -= this.playerCameraY - 180;

        this.mapNode.setPosition(
            this.cameraX,
            this.cameraY
        );
    },


//デバイス入力----->
    onTouchesBegan:function (touches, event) {
        //if(this.isToucheable() == false) return;
        this.touched = touches[0].getLocation();
        this.isPushed = true;

        var touchedXRate = (160 - this.touched.x) / 160;
        this.addSpeedX = 1 * touchedXRate;

        var touchedYRate = (240 - this.touched.y) / 240;
        this.addSpeedY = 1 * touchedYRate;
    },

    onTouchesMoved:function (touches, event) {
        //if(this.isToucheable() == false) return;
        this.touched = touches[0].getLocation();
    },

    onTouchesEnded:function (touches, event) {
        this.player.isCanMove = true;
        this.isPushed = false;
        this.addSpeedX = 0;
        this.addSpeedY = 0;
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

