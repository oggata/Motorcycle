//
//  Chip.js
//  Territory
//
//  Created by Fumitoshi Ogata on 5/30/14.
//  Copyright (c) 2014 http://oggata.github.io All rights reserved.
//

var Chip = cc.Node.extend({

    ctor:function (posX,posY,game,type) {
        this._super();
        this.game              = game;
        this.type              = type;
        this.isOccupied        = false;

        this.enemyCollisionCnt = 0;
        this.enemyCollisionFlg = false;
        this.hp                = 100;
        this.maxHp             = 100;
        this.colleagueCnt      = 0;
        this.posX              = posX;
        this.posY              = posY;

        //デバッグ用の中心を表示するサインマーカー
        if(CONFIG.DEBUG_FLAG==1){
            this.sigh = cc.LayerColor.create(cc.c4b(255,0,0,255),3,3);
            this.sigh.setPosition(posX,posY);
            this.addChild(this.sigh,-9995);
        }

        //マップイメージ
        if(this.type == "normal"){
            this.chipSprite = cc.Sprite.create(s_mapchip_001);
        }else if(this.type == "levelup"){
            this.chipSprite = cc.Sprite.create(s_mapchip_002);
        }else if(this.type == "recover"){
            this.chipSprite = cc.Sprite.create(s_mapchip_003);
        }else if(this.type == "bomb"){
            this.chipSprite = cc.Sprite.create(s_mapchip_004);
        }else if(this.type == "costdown"){
            this.chipSprite = cc.Sprite.create(s_mapchip_005);
        }

        //マップ配置
        this.addChild(this.chipSprite);
        this.chipSprite.setPosition(0,0);
        this.chipSprite.setAnchorPoint(0.5,0.5);
        this.setPosition(posX,posY);
    },
});
