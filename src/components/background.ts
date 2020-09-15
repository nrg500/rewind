export default class Background {
    constructor(scene: Phaser.Scene) {
        let image = scene.add.image(scene.cameras.main.width / 2, scene.cameras.main.height / 2, 'background');
        let scaleX = scene.cameras.main.width / image.width;
        let scaleY = scene.cameras.main.height / image.height;
        let scale = Math.max(scaleX, scaleY);
        image.setScale(scale).setScrollFactor(0);
    }
}