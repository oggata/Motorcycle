//
//  Player.js
//  Territory
//
//  Created by Fumitoshi Ogata on 5/30/14.
//  Copyright (c) 2014 http://oggata.github.io All rights reserved.
//

var Player = cc.Node.extend({

    ctor:function (game) {
        this._super();
        this.game              = game;
        this.storage           = this.game.storage;

        this.isCanMove = false;
        this.angle = 0;
        this.dx = 0;
        this.dy = 0;

        //歩行方向
        this.beforeX         = this.getPosition().x;
        this.beforeY         = this.getPosition().y;
        this.directionCnt    = 0;
        //status
        this.walkSpeed       = 6;

        //image
        this.charactorCode     = this.storage.charactorCode;
        this.image             = this.storage.image;
        this.imgWidth          = this.storage.imgWidth; 
        this.imgHeight         = this.storage.imgHeight;

        //init
        this.direction         = "rightUp";

        this.initializeWalkAnimation();
    },
    
    init:function () {
    },

    update:function() {
        this.setPosition(
            this.getPosition().x + this.dx,
            this.getPosition().y + this.dy
        );


        this.dx = this.walkSpeed  * Math.cos(this.angle * (Math.PI / 180));
        this.dy = this.walkSpeed  * Math.sin(this.angle * (Math.PI / 180));

        //方向制御
        this.directionCnt++;
        if(this.directionCnt >= 5){
            this.directionCnt = 0;
            this.setDirection(this.beforeX,this.beforeY);
            this.beforeX = this.getPosition().x;
            this.beforeY = this.getPosition().y;
        }
    },

    getDirection:function(){
        return this.direction;
    },

    initializeWalkAnimation:function(){
        //足下の陰
        this.shadow = cc.Sprite.create(s_shadow);
        this.shadow.setPosition(0,-20);
        this.shadow.setOpacity(255*0.4);
        this.addChild(this.shadow);

        var frameSeq = [];
        for (var i = 0; i < 3; i++) {
            //96/3,194/4
            var frame = cc.SpriteFrame.create(this.image,cc.rect(this.imgWidth*i,this.imgHeight*0,this.imgWidth,this.imgHeight));
            frameSeq.push(frame);
        }
        this.wa = cc.Animation.create(frameSeq,0.2);
        this.ra = cc.RepeatForever.create(cc.Animate.create(this.wa));
        this.sprite = cc.Sprite.create(this.image,cc.rect(0,0,this.imgWidth,this.imgHeight));
        this.sprite.runAction(this.ra);
        this.addChild(this.sprite);

        //デバッグ
        if(CONFIG.DEBUG_FLAG==1){
            this.sigh = cc.LayerColor.create(cc.c4b(255,0,0,255),3,3);
            this.sigh.setPosition(0,0);
            this.addChild(this.sigh);
        }
    },

    walkFront:function(){
        //左下
        if(this.direction != "front"){
            this.direction = "front";
            this.sprite.stopAllActions();
            var frameSeq = [];
            for (var i = 0; i < 3; i++) {
                var frame = cc.SpriteFrame.create(this.image,cc.rect(this.imgWidth*i + this.imgWidth*0,this.imgHeight*0,this.imgWidth,this.imgHeight));
                frameSeq.push(frame);
            }
            this.wa = cc.Animation.create(frameSeq,0.2);
            this.ra = cc.RepeatForever.create(cc.Animate.create(this.wa));
            this.sprite.runAction(this.ra);
        }
    },

    walkLeft:function(){
        //右下
        if(this.direction != "left"){
            this.direction = "left";
            this.sprite.stopAllActions();
            var frameSeq = [];
            for (var i = 0; i < 3; i++) {
                var frame = cc.SpriteFrame.create(this.image,cc.rect(this.imgWidth*i + this.imgWidth*0,this.imgHeight*1,this.imgWidth,this.imgHeight));
                frameSeq.push(frame);
            }
            this.wa = cc.Animation.create(frameSeq,0.2);
            this.ra = cc.RepeatForever.create(cc.Animate.create(this.wa));
            this.sprite.runAction(this.ra);
        }
    },

    walkRight:function(){
        //左上
        if(this.direction != "right"){
            this.direction = "right";
            this.sprite.stopAllActions();
            var frameSeq = [];
            for (var i = 0; i < 3; i++) {
                var frame = cc.SpriteFrame.create(this.image,cc.rect(this.imgWidth*i + this.imgWidth*0,this.imgHeight*2,this.imgWidth,this.imgHeight));
                frameSeq.push(frame);
            }
            this.wa = cc.Animation.create(frameSeq,0.2);
            this.ra = cc.RepeatForever.create(cc.Animate.create(this.wa));
            this.sprite.runAction(this.ra);
        }
    },

    walkBack:function(){
        //右上
        if(this.direction != "back"){
            this.direction = "back";
            this.sprite.stopAllActions();
            var frameSeq = [];
            for (var i = 0; i < 3; i++) {
                var frame = cc.SpriteFrame.create(this.image,cc.rect(this.imgWidth*i + this.imgWidth*0,this.imgHeight*3,this.imgWidth,this.imgHeight));
                frameSeq.push(frame);
            }
            this.wa = cc.Animation.create(frameSeq,0.2);
            this.ra = cc.RepeatForever.create(cc.Animate.create(this.wa));
            this.sprite.runAction(this.ra);
        }
    },

    walkLeftDown:function(){
        //左下
        if(this.direction != "leftDown"){
            this.direction = "leftDown";
            this.sprite.stopAllActions();
            var frameSeq = [];
            for (var i = 0; i < 3; i++) {
                var frame = cc.SpriteFrame.create(this.image,cc.rect(this.imgWidth*i + this.imgWidth*3,this.imgHeight*0,this.imgWidth,this.imgHeight));
                frameSeq.push(frame);
            }
            this.wa = cc.Animation.create(frameSeq,0.2);
            this.ra = cc.RepeatForever.create(cc.Animate.create(this.wa));
            this.sprite.runAction(this.ra);
        }
    },

    walkRightDown:function(){
        //右下
        if(this.direction != "rightDown"){
            this.direction = "rightDown";
            this.sprite.stopAllActions();
            var frameSeq = [];
            for (var i = 0; i < 3; i++) {
                var frame = cc.SpriteFrame.create(this.image,cc.rect(this.imgWidth*i + this.imgWidth*3,this.imgHeight*1,this.imgWidth,this.imgHeight));
                frameSeq.push(frame);
            }
            this.wa = cc.Animation.create(frameSeq,0.2);
            this.ra = cc.RepeatForever.create(cc.Animate.create(this.wa));
            this.sprite.runAction(this.ra);
        }
    },

    walkLeftUp:function(){
        //左上
        if(this.direction != "leftUp"){
            this.direction = "leftUp";
            this.sprite.stopAllActions();
            var frameSeq = [];
            for (var i = 0; i < 3; i++) {
                var frame = cc.SpriteFrame.create(this.image,cc.rect(this.imgWidth*i + this.imgWidth*3,this.imgHeight*2,this.imgWidth,this.imgHeight));
                frameSeq.push(frame);
            }
            this.wa = cc.Animation.create(frameSeq,0.2);
            this.ra = cc.RepeatForever.create(cc.Animate.create(this.wa));
            this.sprite.runAction(this.ra);
        }
    },

    walkRightUp:function(){
        //右上
        if(this.direction != "rightUp"){
            this.direction = "rightUp";
            this.sprite.stopAllActions();
            var frameSeq = [];
            for (var i = 0; i < 3; i++) {
                var frame = cc.SpriteFrame.create(this.image,cc.rect(this.imgWidth*i + this.imgWidth*3,this.imgHeight*3,this.imgWidth,this.imgHeight));
                frameSeq.push(frame);
            }
            this.wa = cc.Animation.create(frameSeq,0.2);
            this.ra = cc.RepeatForever.create(cc.Animate.create(this.wa));
            this.sprite.runAction(this.ra);
        }
    },

    moveToTargetMarker:function(targetSprite) {
        if(this.isStop) return;

        if(this.getPosition().x < targetSprite.getPosition().x){
            if(Math.abs(this.getPosition().x - targetSprite.getPosition().x) > this.walkSpeed){
                this.setPosition(
                    this.getPosition().x + this.walkSpeed,
                    this.getPosition().y
                );
            }else{
                this.setPosition(
                    targetSprite.getPosition().x,
                    this.getPosition().y
                );
            }
        }
        if(this.getPosition().x > targetSprite.getPosition().x){
            if(Math.abs(this.getPosition().x - targetSprite.getPosition().x) > this.walkSpeed){
                this.setPosition(
                    this.getPosition().x - this.walkSpeed,
                    this.getPosition().y
                );
            }else{
                this.setPosition(
                    targetSprite.getPosition().x,
                    this.getPosition().y
                );
            }
        }
        if(this.getPosition().y < targetSprite.getPosition().y){
            if(Math.abs(this.getPosition().y - targetSprite.getPosition().y) > this.walkSpeed){
                this.setPosition(
                    this.getPosition().x,
                    this.getPosition().y + this.walkSpeed
                );
            }else{
                this.setPosition(
                    this.getPosition().x,
                    targetSprite.getPosition().y
                );
            }
        }
        if(this.getPosition().y > targetSprite.getPosition().y){
            if(Math.abs(this.getPosition().y - targetSprite.getPosition().y) > this.walkSpeed){
                this.setPosition(
                    this.getPosition().x,
                    this.getPosition().y - this.walkSpeed
                );
            }else{
                this.setPosition(
                    this.getPosition().x,
                    targetSprite.getPosition().y
                );
            }
        }
    },

    setDirection:function(DX,DY){
        //横の距離が大きいとき
        var diffX = Math.floor(this.getPosition().x - DX);
        var diffY = Math.floor(this.getPosition().y - DY);
        
        var margin = 10;

        if(Math.abs(diffX) <= margin && diffY > 0){
            this.walkBack();
        }
        if(Math.abs(diffX) <= margin && diffY < 0){
            this.walkFront();
        }
        if(diffX > 0 && Math.abs(diffY) <= margin){
            this.walkRight();
        }
        if(diffX < 0 && Math.abs(diffY) <= margin){
            this.walkLeft();
        }

        if(diffX > margin && diffY > margin){
            this.walkRightUp();
        }
        if(diffX > margin && diffY < margin * -1){
            this.walkRightDown();
        }
        if(diffX < margin * -1 && diffY > margin){
            this.walkLeftUp();
        }
        if(diffX < margin * -1 && diffY < margin * -1){
            this.walkLeftDown();
        }
    },

});