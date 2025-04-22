// UI.js
export class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
        this.intersections = 0;
        this.pathLength = 0;
        this.loopArea = 0;
    }

    create() {
        const style = { font: '16px Arial', fill: '#ffffff' };

        this.intersectionsText = this.add.text(10, 10, '交差数：0', style);
        this.pathLengthText    = this.add.text(10, 30, '軌跡の長さ：0', style);
        this.loopAreaText      = this.add.text(10, 50, '囲みの面積：0', style);
    }

    setIntersections(val) {
        this.intersections = val;
        this.intersectionsText.setText(`交差数：${val}`);
    }

    setPathLength(val) {
        this.pathLength = val;
        this.pathLengthText.setText(`軌跡の長さ：${val.toFixed(1)}`);
    }

    setLoopArea(val) {
        this.loopArea = val;
        this.loopAreaText.setText(`囲みの面積：${val.toFixed(1)}`);
    }
}