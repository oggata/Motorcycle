//
//  Player.js
//  Territory
//
//  Created by Fumitoshi Ogata on 5/30/14.
//  Copyright (c) 2014 http://oggata.github.io All rights reserved.
//

var Block = cc.Node.extend({

    ctor:function (game,depX,depY,type) {
        this._super();
        this.game              = game;
        this.storage           = this.game.storage;
        this.depX = depX;
        this.depY = depY;
        this.type = type;
        this.initialize();
    },
    
    init:function () {
    },

    update:function() {  
    },

    initialize:function(){

        if(this.type == "rand"){
            var rand = getRandNumberFromRange(1,3);
            if(rand == 1){
                this.body = new cp.Body(
                    25,
                    cp.momentForBox(200,100,100)
                );
                this.body.setPos(cp.v(this.depX,this.depY));
                this.game.space.addBody(this.body);
                this.shape = new cp.BoxShape(this.body,130,50);
                this.shape.setElasticity(0.2);
                this.shape.setFriction(0.2);
                this.game.space.addShape(this.shape);
                this.sprite = cc.PhysicsSprite.create(s_box);
                this.sprite.setBody(this.body);
                this.addChild(this.sprite);
            }else{
                this.body = new cp.Body(
                    25,
                    cp.momentForCircle(100,0,50,cp.v(0,0))
                );
                this.body.setPos(cp.v(this.depX,this.depY));
                this.game.space.addBody(this.body);
                this.shape = new cp.CircleShape(this.body,50,cp.v(0,0));
                this.shape.setElasticity(0.2);
                this.shape.setFriction(0.2);
                this.game.space.addShape(this.shape);
                this.sprite = cc.PhysicsSprite.create(s_circle);
                this.sprite.setBody(this.body);
                this.addChild(this.sprite);
            }
        }else{
            this.body = new cp.Body(
                25,
                cp.momentForBox(200,100,100)
            );
            this.body.setPos(cp.v(this.depX,this.depY));
            this.game.space.addBody(this.body);
            this.shape = new cp.BoxShape(this.body,50,50);
            this.shape.setElasticity(0.2);
            this.shape.setFriction(0.2);
            this.game.space.addShape(this.shape);
            this.sprite = cc.PhysicsSprite.create(s_box2);
            this.sprite.setBody(this.body);
            this.addChild(this.sprite);
        }

        //デバッグ
        if(CONFIG.DEBUG_FLAG==1){
            this.sigh = cc.LayerColor.create(cc.c4b(255,0,0,255),3,3);
            this.sigh.setPosition(0,0);
            this.addChild(this.sigh);
        }
    }

});