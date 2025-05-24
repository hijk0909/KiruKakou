// Effect.js
import { GameState } from './GameState.js';
// import { UIScene } from './UI.js';

export const EFF_TYPE_ENEMY_GET = 0;
export const EFF_TYPE_FRIEND_GET = 1;
export const EFF_TYPE_KILL = 2;
export const EFF_TYPE_HIT = 3;
export const EFF_TYPE_TEXT = 4;
export const EFF_TYPE_CROSS = 5;
export const EFF_TYPE_SPARK = 6;
export const EFF_TYPE_MANA = 7;
export const EFF_TYPE_TORNADO = 8;
export const EFF_TYPE_FLOWER = 9;

const ENERGY_DOWN_UNIT = 100;
const ENERGY_UP_UNIT = 5;

const EFF_PERIOD_KILL = 60;
const EFF_PERIOD_HIT = 80;
const EFF_PERIOD_TEXT = 120;
const EFF_PERIOD_CROSS = 40;
const EFF_PERIOD_SPARK = 120;
const EFF_PERIOD_MANA = 180;
const EFF_PERIOD_TORNADO = 180;
const EFF_PERIOD_FLOWER = 90;

const MAX_TORNADO = 10;

export class Effect {
    constructor(scene) {
        this.scene = scene;
        this.type = null;
        this.pos = new Phaser.Math.Vector2(0, 0);
        this.alive = true;
        this.counter = 0;
        this.text = null;
        this.textObject = null;
        this.emitter = null;
        this.param1 = 0;
        this.sprite = null;
        this.sprites = [];
        this.glows = [];
    }

    setType(type, pos) {
        this.type = type;
        this.pos = pos.clone(); // Phaser.Math.Vector2
        this.alive = true;
        if (this.type === EFF_TYPE_KILL) {
            this.counter = EFF_PERIOD_KILL;
        } else if (this.type === EFF_TYPE_HIT){
            this.counter = EFF_PERIOD_HIT;
        } else if (this.type === EFF_TYPE_TEXT){
            this.counter = EFF_PERIOD_TEXT;
        } else if (this.type === EFF_TYPE_CROSS){
            this.counter = EFF_PERIOD_CROSS;
        } else if (this.type == EFF_TYPE_SPARK){
            this.counter = EFF_PERIOD_SPARK;
            if ( !this.scene.starParticles ) {
                let graphics = this.scene.add.graphics();
                graphics.fillStyle(0xffe000, 1);
                graphics.beginPath();
                let ox = 20;
                let oy = 20;
                graphics.moveTo(0 + ox, -20 + oy);
                graphics.lineTo(6 + ox, -6 + oy);
                graphics.lineTo(20 + ox, -6 + oy);
                graphics.lineTo(10 + ox, 6 + oy);
                graphics.lineTo(14 + ox, 20 + oy);
                graphics.lineTo(0 + ox, 12 + oy);
                graphics.lineTo(-14 + ox, 20 + oy);
                graphics.lineTo(-10 + ox, 6 + oy);
                graphics.lineTo(-20 + ox, -6 + oy);
                graphics.lineTo(-6 + ox, -6 + oy);
                graphics.closePath();
                graphics.fillPath();
                graphics.generateTexture('star', 40, 40);
                graphics.destroy();
                this.scene.starParticles = this.scene.add.particles('star');
            }
            this.emitter = this.scene.starParticles.createEmitter({
                x: pos.x,
                y: pos.y,
                speed: { min: -200, max: 200 },
                scale: { start: 1, end: 0 },
                alpha: { start: 1, end: 0 },
                lifespan: 1000,
                blendMode: 'ADD',
                quantity: 30 // 一度に何個放出するか
            });
            this.emitter.explode(30, pos.x, pos.y); 
            this.emitter.setGravityY(200);
        } else if (this.type == EFF_TYPE_MANA){
            this.counter = EFF_PERIOD_MANA;
            if ( !this.scene.manaParticles ) {
                let graphics = this.scene.add.graphics();
                graphics.fillStyle(0x60ff00, 1);
                graphics.beginPath();
                let ox = 20;
                let oy = 20;
                graphics.moveTo(0 + ox, -20 + oy);
                graphics.lineTo(4 + ox, -4 + oy);
                graphics.lineTo(20 + ox, 0 + oy);
                graphics.lineTo(4 + ox, 4 + oy);
                graphics.lineTo(0 + ox, 20 + oy);
                graphics.lineTo(-4 + ox, 4 + oy);
                graphics.lineTo(-20 + ox, 0 + oy);
                graphics.lineTo(-4 + ox, -4 + oy);
                graphics.closePath();
                graphics.fillPath();
                graphics.generateTexture('mana', 40, 40);
                graphics.destroy();
                this.scene.manaParticles = this.scene.add.particles('mana');
            }
            this.emitter = this.scene.manaParticles.createEmitter({
                x: pos.x,
                y: pos.y,
                speed: { min: 160, max: 200 },
                scale: { start: 1, end: 0.5 },
                alpha: { start: 1, end: 0 },
                lifespan: 1000,
                blendMode: 'ADD',
                quantity: 60 // 一度に何個放出するか
            });
            this.emitter.explode(60, pos.x, pos.y); 
        } else if (this.type == EFF_TYPE_TORNADO){
            this.counter = EFF_PERIOD_TORNADO;
            if (!this.scene.anims.exists('tornado_anims')) {
                this.scene.anims.create({key:'tornado_anims',
                    frames: this.scene.anims.generateFrameNumbers('tornado', { start: 0, end: 3 }),
                    frameRate: 8, repeat: -1
                });
            }
            for (let i=0;i<MAX_TORNADO;i++){
                this.sprites[i] = this.scene.add.sprite(pos.x, pos.y, 'tornado')
                this.sprites[i].play('tornado_anims');
                this.glows[i] = this.scene.add.sprite(pos.x, pos.y, 'tornado')
                this.glows[i].setBlendMode(Phaser.BlendModes.ADD);
                this.glows[i].setTint(0xffffff);
                this.glows[i].play('tornado_anims');
            }
        } else if (this.type == EFF_TYPE_FLOWER){
            this.counter = EFF_PERIOD_FLOWER;
            let fl = Math.floor(Math.random() * 5);
            this.sprite = this.scene.add.sprite(pos.x, pos.y, `flower_${fl}`).setDepth(0);
        }
    }

    setParameter(val) {
        this.param1 = val;
    }

    setText(txt) {
        this.text = txt;
        this.textObject = this.scene.add.text(this.pos.x, this.pos.y, this.text, {
            fontFamily: 'Helvetica, Arial',
            fontSize: '28px',
            color: '#ffeedd',
            stroke: '#ff0000',
            strokeThickness: 2
        }).setOrigin(0.5, 0.5);
    }

    isAlive() {
        return this.alive;
    }

    setAlive(val) {
        this.alive = val;
    }

    move() {
        if (this.type === EFF_TYPE_ENEMY_GET) {
            let distance = move_to(this.pos, new Phaser.Math.Vector2(GameState.posEnergy, 10), 10);
            if (distance < 10){
                GameState.energy = Math.max( GameState.energy - ENERGY_DOWN_UNIT, 0);
                this.scene.sound.play('se_mana_down');
                this.alive = false;
            }
        } else if (this.type === EFF_TYPE_FRIEND_GET) {
            let distance = move_to(this.pos, new Phaser.Math.Vector2(GameState.posEnergy, 10), 10);
            if (distance < 10){
                GameState.energy = Math.min( GameState.energy + GameState.energyMultiple * ENERGY_UP_UNIT, GameState.maxEnergy);
                GameState.energyMultiple += 1;
                this.scene.sound.play('se_mana_up');
                // this.alive = false;
                // 自分自身を EFF_TYPE_SPARK（パーティクル）に変更
                this.setType(EFF_TYPE_SPARK, this.pos);
            }
        } else if (this.type === EFF_TYPE_KILL){
            this.counter -= 1;
            if ( this.counter <= 0){
                this.alive = false;
            }
        } else if (this.type === EFF_TYPE_HIT) {
            this.counter -= 1;
            if ( this.counter <= 0){
                this.alive = false;
            }
        } else if (this.type === EFF_TYPE_TEXT) {
            this.counter -= 1;
            if (this.counter <= 0){
                this.alive = false;
                this.textObject.destroy();
                this.textObject = null; 
            }
        } else if (this.type === EFF_TYPE_CROSS) {
            this.counter -= 1;
            if ( this .counter <= 0){
                this.alive = false;
            }
        } else if (this.type === EFF_TYPE_SPARK) {
            this.counter -= 1;
            if ( this .counter <= 0){
                this.scene.starParticles.removeEmitter(this.emitter);
                this.alive = false;
            }
        } else if (this.type === EFF_TYPE_MANA) {
            this.counter -= 1;
            if ( this.counter <= 0){
                this.scene.manaParticles.removeEmitter(this.emitter);
                this.alive = false;
            }
        } else if (this.type === EFF_TYPE_TORNADO) {
            this.counter -= 1;
            const c = (EFF_PERIOD_TORNADO - this.counter) / EFF_PERIOD_TORNADO;
            const r = 280*c;
            const at = c*11; //回転速度
            for (let i=0;i<MAX_TORNADO;i++){
                const sp = this.sprites[i];
                const gl = this.glows[i];
                const ai = i * Math.PI * 2 / MAX_TORNADO; //竜巻の位置
                sp.setPosition(this.pos.x + r*Math.sin(ai+at), this.pos.y + r*Math.cos(ai+at)/2);
                sp.setScale(1.0+c*11);
                sp.setAlpha(1-c);
                gl.setPosition(this.pos.x + r*Math.sin(ai+at), this.pos.y + r*Math.cos(ai+at)/2);
                gl.setScale(1.0+c*11);
                gl.setAlpha((0.3 * Math.cos(Math.PI * c * 13) + 0.3)*(1-c));
            }
            if ( this .counter <= 0){
                this.alive = false;
                for (let i=0;i<MAX_TORNADO;i++){
                    if (this.sprites[i]){
                        this.sprites[i].destroy();
                    }
                    if (this.glows[i]){
                        this.glows[i].destroy();
                    }
                }
                this.sprites = [];
                this.glows = [];
            }
        } else if (this.type === EFF_TYPE_FLOWER) {
            this.counter -= 1;
            const cnt = this.counter;
            this.sprite.setAngle(cnt);
            const c_a = EFF_PERIOD_FLOWER * 0.2;
            if ( cnt < c_a ){
                this.sprite.setAlpha(cnt / c_a);
            }
            if ( cnt <= 0 ){
                this.alive = false;
                this.sprite.destroy();
                this.sprite = null;
            }
        }

        const { width, height } = this.scene.game.canvas;
        if (this.pos.x < 0 || this.pos.x > width || this.pos.y < 0 || this.pos.y > height) {
            this.alive = false;
        }
    }

    draw(graphics) {
        if (this.type === EFF_TYPE_ENEMY_GET) {
            graphics.fillStyle(0xff0000, 1);
            graphics.beginPath();
            graphics.moveTo(this.pos.x, this.pos.y - 10);
            graphics.lineTo(this.pos.x - 10, this.pos.y + 10);
            graphics.lineTo(this.pos.x + 10, this.pos.y + 10);
            graphics.closePath();
            graphics.fillPath();
        } else if (this.type === EFF_TYPE_FRIEND_GET) {
            graphics.fillStyle(0x00ff00, 1);
            graphics.fillCircle(this.pos.x, this.pos.y, 10);
        } else if (this.type === EFF_TYPE_KILL) {
            graphics.lineStyle(6, 0xff0000, 0.9);
            graphics.beginPath();
            graphics.moveTo(this.pos.x - 10, this.pos.y - 10);
            graphics.lineTo(this.pos.x + 10, this.pos.y + 10);
            graphics.moveTo(this.pos.x + 10, this.pos.y - 10);
            graphics.lineTo(this.pos.x - 10, this.pos.y + 10);
            graphics.strokePath();
        } else if (this.type === EFF_TYPE_HIT) {
            const a = this.counter / EFF_PERIOD_HIT;
            const r = (EFF_PERIOD_HIT - this.counter + 1) * this.param1;
            graphics.lineStyle(4, 0xffff00, a);
            draw_star(graphics, this.pos, r);
        } else if (this.type === EFF_TYPE_TEXT) {
            const t = EFF_PERIOD_TEXT - this.counter;
            this.textObject.setPosition(this.pos.x, getBouncingY(t, this.pos.y, 30, 80));
            const dur = 20;
            if ( this.counter < dur ){
                const r = dur - this.counter;
                this.textObject.setScale(1 + r/dur);
                this.textObject.setAlpha(this.counter/dur);
            }
        } else if (this.type === EFF_TYPE_CROSS) {
            graphics.lineStyle(1, 0xffffff, 0.9);
            graphics.beginPath();
            graphics.moveTo(this.pos.x     , this.pos.y - 10);
            graphics.lineTo(this.pos.x     , this.pos.y + 10);
            graphics.moveTo(this.pos.x + 10, this.pos.y     );
            graphics.lineTo(this.pos.x - 10, this.pos.y     );
            graphics.strokePath();
        }
    }
}

function draw_star(graphics, pos, r){
    
    graphics.beginPath();

    const points = [];
    for (let i = 0; i < 10; i++) {
        const angle = (i * 36 - 90) * Math.PI / 180; // 角度（ラジアン）
        const radius = i % 2 === 0 ? r : r/2; // 偶数番目が外側、奇数番目が内側
        const x = pos.x + radius * Math.cos(angle);
        const y = pos.y + radius * Math.sin(angle);
        points.push({ x, y });
    }

    graphics.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        graphics.lineTo(points[i].x, points[i].y);
    }
    graphics.lineTo(points[0].x, points[0].y); // 始点に戻る

    graphics.strokePath();
}

function move_to(pos, target, v){

    let dx = target.x - pos.x;
    let dy = target.y - pos.y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 0.0001) return 0;

    let ratio = v / distance;
    pos.x += dx * ratio;
    pos.y += dy * ratio;

    distance = Math.sqrt((target.x - pos.x) * (target.x - pos.x) + (target.y - pos.y) * (target.y - pos.y));

    return distance
}

function getBouncingY(t, Y0, DY, T) {
    if (t >= T) return Y0;

    let timePassed = 0;
    let duration = T / 2;
    let height = DY;
    let cycle = 0;

    // 各バウンドのフェーズを探す
    while (t > timePassed + duration) {
        timePassed += duration;
        duration /= 2;
        height /= 2;
        cycle++;
    }

    // 現在のバウンド内での進行度（0～1）
    let localT = (t - timePassed) / duration;

    // 放物線を描く： y = -4h * (x - 0.5)^2 + h
    let offset = -4 * height * Math.pow(localT - 0.5, 2) + height;

    return Y0 - offset;
}