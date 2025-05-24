// Character.js
import { GameState } from './GameState.js';

export const CH_TYPE_ENEMY = 0;
export const CH_TYPE_FRIEND = 1;

export const REACT_TYPE_ADD_SCORE = 0;
export const REACT_TYPE_POWERUP = 1;
export const REACT_TYPE_PENALTY = 2;

const SHADOW_OFFSET = 40;
const ENEMY_OFFSET = -2;
const FRIEND_OFFSET = -10;

export class Character {

    constructor(scene) {
        this.scene = scene;
        this.type = null;
        this.pos = new Phaser.Math.Vector2(0, 0);
        this.alive = true;
        this.collision = new Phaser.Geom.Rectangle(-20, -20, 40, 40);  // 中心からの相対矩形
        this.sprite = null;
        this.sprite_shadow = null;
        this.graphics = null;
        this.speed = 1.0;
        this.movePattern = 0;
        this.moveParam1 = 0;
        this.moveParam2 = 0;
        this.moveState = 0;
        this.moveCounter = 0;
        this.drawCollision = false;
    }

    setType(type, pos) {
        // console.log(`type: ${type}, pos: ${pos}`);
        this.type = type;
        this.pos = pos.clone(); // Phaser.Math.Vector2
        this.alive = true;

        // 影の画像を作成
        if (!this.scene.textures.exists('img_shadow')) {
            const graphics = this.scene.make.graphics({ x: 0, y: 0, add: false });
            const shadowWidth = 35;
            const shadowHeight = 10;
            const shadowWidth2 = 60;
            const shadowHeight2 = 20;
            graphics.fillStyle(0x000000, 0.3);
            graphics.fillEllipse(shadowWidth2 / 2, shadowHeight2 / 2, shadowWidth, shadowHeight); 
            graphics.fillStyle(0x000000, 0.5);
            graphics.fillEllipse(shadowWidth2 / 2, shadowHeight2 / 2, shadowWidth2, shadowHeight2);
            graphics.generateTexture('img_shadow', shadowWidth2, shadowHeight2);
            graphics.destroy();
        }

        // スプライトの作成
        if (this.type === CH_TYPE_FRIEND){
            this.sprite_shadow = this.scene.add.sprite(pos.x, pos.y + FRIEND_OFFSET + SHADOW_OFFSET, 'img_shadow').setDepth(1);
            this.sprite = this.scene.add.sprite(pos.x, pos.y + FRIEND_OFFSET, 'ch_friend').setDepth(2);
            this.sprite.setScale(1.1);
            if (!this.scene.anims.exists('ch_friend_anims')) {
                this.scene.anims.create({key:'ch_friend_anims',
                    frames: this.scene.anims.generateFrameNumbers('ch_friend', { start: 0, end: 7 }),
                    frameRate: 8, repeat: -1
                });
            }
            this.sprite.play('ch_friend_anims');
        } else if (this.type == CH_TYPE_ENEMY){
            this.sprite_shadow = this.scene.add.sprite(pos.x, pos.y + ENEMY_OFFSET + SHADOW_OFFSET, 'img_shadow').setDepth(1);
            this.sprite = this.scene.add.sprite(pos.x, pos.y + ENEMY_OFFSET, 'ch_enemy').setDepth(2);
            this.sprite.setScale(0.30);
            if (!this.scene.anims.exists('ch_enemy_anims')) {
                this.scene.anims.create({key:'ch_enemy_anims',
                    frames: this.scene.anims.generateFrameNumbers('ch_enemy', { start: 0, end: 3 }),
                    frameRate: 4, repeat: -1
                });
            }
            this.sprite.play('ch_enemy_anims');
        }

        // 重ね描き用グラフィックス
        this.graphics = this.scene.add.graphics().setDepth(3);
    }

    setParameter(speed, pattern, param1, param2) {
        // console.log(`speed: ${speed}, pattern: ${pattern}, param1: ${param1}, param2: ${param2}`);
        this.speed = speed;
        this.movePattern = pattern;
        this.moveParam2 = param2;
        this.moveState = 0;
        this.moveTimer = 0;

        if (pattern === 1){
            const sign = Phaser.Math.FloatBetween(0, 1) >= 0.5 ? 1 : -1;
            this.moveParam1 = param1 * sign;
        } else {
            this.moveParam1 = param1;
        }
    }

    isAlive() {
        return this.alive;
    }

    setAlive(val) {
        this.alive = val;
        if (val === false && this.sprite){
            this.destroy();
        }
    }

    showCollision() {
        this.drawCollision = true;
    }


    move() {

        const { width, height } = this.scene.game.canvas;

        if ( !GameState.stopMode && !GameState.tornadeMode){
            if (this.type === CH_TYPE_ENEMY) {
                this.move_dir(1);
                this.sprite.setPosition(this.pos.x, this.pos.y + ENEMY_OFFSET);
                this.sprite_shadow.setPosition(this.pos.x, this.pos.y + ENEMY_OFFSET + SHADOW_OFFSET);
            } else if (this.type === CH_TYPE_FRIEND) {
                this.move_dir(-1);
                this.sprite.setPosition(this.pos.x, this.pos.y + FRIEND_OFFSET);
                this.sprite_shadow.setPosition(this.pos.x, this.pos.y + FRIEND_OFFSET + SHADOW_OFFSET);
            }
        } else if (GameState.tornadeMode){
            if (this.type === CH_TYPE_ENEMY){
                if (this.pos.x > 10 ){
                    this.pos.x -= 5;
                } else {
                    this.pos.x += 1;
                }
                this.sprite.setPosition(this.pos.x, this.pos.y + ENEMY_OFFSET);
                this.sprite_shadow.setPosition(this.pos.x, this.pos.y + ENEMY_OFFSET + SHADOW_OFFSET);
            } else if (this.type === CH_TYPE_FRIEND){
                if (this.pos.x < width - 10){
                    this.pos.x += 5;
                } else {
                    this.pos.x -= 1;
                }
                this.sprite.setPosition(this.pos.x, this.pos.y + FRIEND_OFFSET);
                this.sprite_shadow.setPosition(this.pos.x, this.pos.y + FRIEND_OFFSET + SHADOW_OFFSET);
            }
        }

        if (this.pos.x < 0 || this.pos.x > width || this.pos.y < 0 || this.pos.y > height) {
            this.alive = false;
                this.destroy();
        }
    }

    move_dir(dx){
        if (this.movePattern === 0){
            // move straight
            this.pos.x = this.pos.x + this.speed * dx;
        } else if (this.movePattern === 1){
            // move diagonal
            const h = this.scene.game.canvas.height;
            const vm = GameState.verticalMargin;
            this.pos.x = this.pos.x + this.speed * dx;
            this.pos.y += this.moveParam1;
            if (this.pos.y > h -vm || this.pos.y < vm){
                this.moveParam1 *= -1; //Y軸移動方向を反転
            }
        } else if (this.movePattern === 2){
            // move crawl
            if (this.moveState === 0){
                //加速
                this.pos.x += this.moveCounter * dx;
                this.moveCounter += this.moveParam1;
                if (this.moveCounter >= this.speed){
                    this.moveCounter = this.speed;
                    this.moveState = 1;
                }

            } else if (this.moveState === 1){
                //減速
                this.pos.x += this.moveCounter * dx;
                this.moveCounter -= this.moveParam1;
                if (this.moveCounter <= 0){
                    this.moveCounter = this.moveParam2;
                    this.moveState = 2;
                }
            } else if (this.moveState === 2){
                //停止
                this.moveCounter -= 1;
                if (this.moveCounter <= 0){
                    this.moveCounter = 0.0;
                    this.moveState = 0;
                }
            }
        }
    }

    draw(graphics) {
        this.graphics.clear();
        if ( GameState.stopMode || this.drawCollision){
            if (this.type === CH_TYPE_ENEMY) {
                this.graphics.lineStyle(2, 0xff0000);
            } else if (this.type === CH_TYPE_FRIEND) {
                this.graphics.lineStyle(2, 0x00ffff);
            }
            this.graphics.strokeRect(
                this.pos.x + this.collision.x,
                this.pos.y + this.collision.y,
                this.collision.width,
                this.collision.height
            )
        }
    }

    destroy(){
        if ( this.sprite ){
            this.sprite.destroy();
            this.sprite = null;
        }
        if ( this.sprite_shadow ){
            this.sprite_shadow.destroy();
            this.sprite_shadow = null;
        }
        if ( this.graphics ){
            this.graphics.destroy();
            this.graphics = null;
        }
    }

    get_position() {
        return this.pos;
    }

    get_type(){
        return this.type;
    }

    get_collision() {
        return new Phaser.Geom.Rectangle(
            this.pos.x + this.collision.x,
            this.pos.y + this.collision.y,
            this.collision.width,
            this.collision.height
        );
    }

}