// Item.js
import { GameState } from './GameState.js';

export const ITEM_TYPE_P = 0;
export const ITEM_TYPE_S = 1;
export const ITEM_TYPE_T = 2;

export const ITEM_STATE_HINT = 0;
export const ITEM_STATE_HIDDEN = 1;
export const ITEM_STATE_APPEAR = 2;

export class Item {
    constructor(scene) {
        this.scene = scene;
        this.type = null;
        this.pos = new Phaser.Math.Vector2(0, 0);
        this.collision = new Phaser.Geom.Rectangle(-20, -20, 40, 40);  // 中心からの相対矩形
        this.alive = true;
        this.state = 0;
        this.hint = null;
        this.sprite = null;
        this.glow = null;
    }

    setType(type, pos) {
        this.type = type;
        this.pos = pos.clone(); // Phaser.Math.Vector2
        this.alive = true;
        this.setState(ITEM_STATE_HINT);
    }

    setState(state) {
        if (state == ITEM_STATE_HINT){
            if ( this.hint == null){
                this.hint = this.scene.add.sprite(this.pos.x, this.pos.y, 'item_0').setDepth(1);
            }
            this.scene.tweens.add({
                targets: this.hint,
                alpha: 0,
                yoyo: true,
                repeat: 8, // 点滅の回数
                duration: 200, // 点滅1回あたりの時間（ミリ秒）
                onComplete: () => {
                    // 点滅終了後に情報隊更新
                    if (this.state == ITEM_STATE_HINT){
                        this.setState(ITEM_STATE_HIDDEN);
                    }
                }
            });
            this.hint.setVisible(true);
        } else if (state == ITEM_STATE_HIDDEN){
            this.hint.setVisible(false);
        } else if (state == ITEM_STATE_APPEAR){
            if (this.type == ITEM_TYPE_P){
                this.sprite = this.scene.add.sprite(this.pos.x, this.pos.y, 'item_p').setDepth(1);
                this.glow = this.scene.add.sprite(this.pos.x, this.pos.y, 'item_p').setDepth(2);
            } else if (this.type == ITEM_TYPE_S){
                this.sprite = this.scene.add.sprite(this.pos.x, this.pos.y, 'item_s').setDepth(1);
                this.glow = this.scene.add.sprite(this.pos.x, this.pos.y, 'item_s').setDepth(2);
            } else if (this.type == ITEM_TYPE_T){
                this.sprite = this.scene.add.sprite(this.pos.x, this.pos.y, 'item_t').setDepth(1);     
                this.glow = this.scene.add.sprite(this.pos.x, this.pos.y, 'item_t').setDepth(2);
            }
            this.glow.setBlendMode(Phaser.BlendModes.ADD);
            this.glow.setTint(0xffffff);

            this.scene.tweens.killTweensOf(this.hint);
            this.hint.destroy();

            this.scene.tweens.add({
                targets: this.sprite,
                scale: 1.0,
                ease: 'Sine.easeInOut',
                duration: 300,
                yoyo: true,
                repeat: -1,
                onStart: () => {
                    this.sprite.setScale(0.9);
                }  
            });
            this.scene.tweens.add({
                targets: this.glow,
                alpha: 0.7,
                scale: 1.0,
                ease: 'Sine.easeInOut',
                duration: 300,
                yoyo: true,
                repeat: -1,
                onStart: () => {
                    this.glow.setScale(0.9);
                    this.glow.setAlpha(0);
                }
            });

            this.scene.tweens.add({
                targets: this.sprite,
                angle: 15,
                ease: 'Sine.easeInOut',
                duration: 600,
                yoyo: true,
                repeat: -1,
                onStart: () => {
                    this.sprite.setAngle(-7.5);
                }  
            });
            this.scene.tweens.add({
                targets: this.glow,
                angle: 15,
                ease: 'Sine.easeInOut',
                duration: 600,
                yoyo: true,
                repeat: -1,
                onStart: () => {
                    this.glow.setAngle(-7.5);
                }
            });
        }
        this.state = state;
    }

    destroy(){
        if ( this.hint){
            this.scene.tweens.killTweensOf(this.hint);
            this.hint.destroy();
            this.hint = null;
        }
        if ( this.sprite ){
            this.scene.tweens.killTweensOf(this.sprite);
            this.sprite.destroy();
            this.sprite = null;
        }
        if ( this.glow){
            this.scene.tweens.killTweensOf(this.glow);
            this.glow.destroy();
            this.glow = null;
        }
        this.alive = false;
    }

    getState() {
        return this.state;
    }

    isAlive() {
        return this.alive;
    }

    get_collision() {
        return new Phaser.Geom.Rectangle(
            this.pos.x + this.collision.x,
            this.pos.y + this.collision.y,
            this.collision.width,
            this.collision.height
        );
    }

    draw(graphics) {

    }

}