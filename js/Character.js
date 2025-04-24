// Character.js
import { GameState } from './GameState.js';

export const CH_TYPE_ENEMY = 0;
export const CH_TYPE_FRIEND = 1;

export const REACT_TYPE_ADD_SCORE = 0;
export const REACT_TYPE_POWERUP = 1;
export const REACT_TYPE_PENALTY = 2;

export class Character {
    constructor(scene) {
        this.scene = scene;
        this.type = null;
        this.pos = new Phaser.Math.Vector2(0, 0);
        this.alive = true;
        this.collision = new Phaser.Geom.Rectangle(-20, -20, 40, 40);  // 中心からの相対矩形
        this.sprite = null;
    }

    setType(type, pos) {
        this.type = type;
        this.pos = pos.clone(); // Phaser.Math.Vector2
        this.alive = true;

        if (this.type === CH_TYPE_FRIEND){
            this.sprite = this.scene.add.sprite(pos.x, pos.y, 'ch_friend');
            this.sprite.setScale(1.2);
            if (!this.scene.anims.exists('ch_friend_anims')) {
                this.scene.anims.create({key:'ch_friend_anims',
                    frames: this.scene.anims.generateFrameNumbers('ch_friend', { start: 0, end: 7 }),
                    frameRate: 8, repeat: -1
                });
            }
            this.sprite.play('ch_friend_anims');
        } else if (this.type == CH_TYPE_ENEMY){
            this.sprite = this.scene.add.sprite(pos.x, pos.y, 'ch_enemy');
            this.sprite.setScale(0.4);
            if (!this.scene.anims.exists('ch_enemy_anims')) {
                this.scene.anims.create({key:'ch_enemy_anims',
                    frames: this.scene.anims.generateFrameNumbers('ch_enemy', { start: 0, end: 3 }),
                    frameRate: 4, repeat: -1
                });
            }
            this.sprite.play('ch_enemy_anims');
        }
    }

    isAlive() {
        return this.alive;
    }

    setAlive(val) {
        this.alive = val;
        if (val === false && this.sprite){
            this.sprite.destroy();
            this.sprite = null;
        }
    }

    move() {
        if (this.type === CH_TYPE_ENEMY) {
            if (GameState.stage === 1){
                this.pos.x += 1;
            } else {
                this.pos.x += 2;
            }
            this.sprite.setPosition(this.pos.x, this.pos.y);
        } else if (this.type === CH_TYPE_FRIEND) {
            this.pos.x -= 1;
            this.sprite.setPosition(this.pos.x, this.pos.y);
        }

        const { width, height } = this.scene.game.canvas;
        if (this.pos.x < 0 || this.pos.x > width || this.pos.y < 0 || this.pos.y > height) {
            this.alive = false;
            if ( this.sprite ){
                this.sprite.destroy();
                this.sprite = null;
            }
        }
    }

    draw(graphics) {
        if (this.type === CH_TYPE_ENEMY) {
            graphics.fillStyle(0xff0000, 1);
            graphics.beginPath();
            graphics.moveTo(this.pos.x, this.pos.y + 20);
            graphics.lineTo(this.pos.x - 20, this.pos.y - 20);
            graphics.lineTo(this.pos.x + 20, this.pos.y - 20);
            graphics.closePath();
            graphics.fillPath();
        } else if (this.type === CH_TYPE_FRIEND) {
            // graphics.fillStyle(0x00ff00, 1);
            // graphics.fillCircle(this.pos.x, this.pos.y, 20);
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