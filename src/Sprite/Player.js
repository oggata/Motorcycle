//
//  Player.js
//  Territory
//
//  Created by Fumitoshi Ogata on 5/30/14.
//  Copyright (c) 2014 http://oggata.github.io All rights reserved.
//

var Player = cc.Node.extend({

    ctor:function (game,depX,depY) {
        this._super();
        this.game              = game;
        this.storage           = this.game.storage;
        this.maxDx             = 5;
        this.dx                = 0;
        this.dy                = 0;
        this.depX              = depX;
        this.depY              = depY;
        //image
        this.charactorCode     = this.storage.charactorCode;
        this.image             = this.storage.image;
        this.imgWidth          = this.storage.imgWidth; 
        this.imgHeight         = this.storage.imgHeight;
        this.initializeAnimation();
        this.isNoRun = false;
    },
    
    init:function () {
    },

    update:function() {
        if(this.dx >=  this.maxDx){this.dx = this.maxDx;}
        if(this.dx <= this.maxDx * -1){this.dx = this.maxDx * -1;}
        if(this.dy >=  this.maxDx){this.dy = this.maxDx;}
        if(this.dy <= this.maxDx * -1){this.dy = this.maxDx * -1;}

        if(this.dx > 1){
            this.body.setAngVel(this.game.addRot * 0.1 * 1);
        }else if(this.dx < -1){
            this.body.setAngVel(this.game.addRot * 0.1 * -1);
        }else{
            this.body.setAngVel(0);
        }

        this.body.setPos(
            cp.v(
                this.body.getPos().x + this.dx,
                this.body.getPos().y + this.dy
            )
        );
        if(Math.asin(this.body.getAngle().x) <= -0.28){
            this.body.setAngle(600);
            this.isNoRun = true;
        };

        this.rider.setPosition(
            this.body.getPos().x,
            this.body.getPos().y
        );

        this.degrees = (getDegrees(Math.asin(this.body.getAngle().x)) - 90 + this.game.addRot) * 1;
        this.rider.setRotation(this.degrees);
    },

    getDirection:function(){
        return this.direction;
    },

    initializeAnimation:function(){
        var frameSeq = [];
        for (var i = 0; i < 3; i++) {
            var frame = cc.SpriteFrame.create(this.image,cc.rect(this.imgWidth*i,this.imgHeight*0,this.imgWidth,this.imgHeight));
            frameSeq.push(frame);
        }
        this.wa = cc.Animation.create(frameSeq,0.2);
        this.ra = cc.RepeatForever.create(cc.Animate.create(this.wa));

        this.body = new cp.Body(
            5,
            cp.momentForBox(10,10,10)
        );
        this.body.setPos(cp.v(this.depX,this.depY));
        this.game.space.addBody(this.body);

        this.shape = new cp.BoxShape(this.body,130,50);
        this.shape.setElasticity(0.3);
        this.shape.setFriction(0.3);
        this.game.space.addShape(this.shape);
        
        //キャラクターの作成
        //this.sprite = cc.PhysicsSprite.create(this.image,cc.rect(0,0,this.imgWidth,this.imgHeight));
        this.sprite = cc.PhysicsSprite.create(s_moto);
        this.sprite.setAnchorPoint(0.5,0.3);
        //this.sprite.runAction(this.ra);
        this.sprite.setBody(this.body);
        this.addChild(this.sprite);

        //登場者の作成
        this.rider = cc.Sprite.create(s_rider);
        this.rider.setPosition(this.body.getPos().x,this.body.getPos().y);
        this.addChild(this.rider);

        this._debugNode = cc.PhysicsDebugNode.create(this.game.space);
        this._debugNode.setVisible(true);
        this.addChild(this._debugNode);

        //デバッグ
        if(CONFIG.DEBUG_FLAG==1){
            this.sigh = cc.LayerColor.create(cc.c4b(255,0,0,255),3,3);
            this.sigh.setPosition(0,0);
            this.addChild(this.sigh);
        }
    }
});