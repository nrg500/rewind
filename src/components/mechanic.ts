export default class Mechanic {
    private mechanic: Phaser.Physics.Matter.Sprite;
    private scene: Phaser.Scene;
    private currentAnimation: string;
    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    getSprite(): Phaser.Physics.Matter.Sprite {
        return this.mechanic;
    }

    preload() { }

    create() {
        this.mechanic = this.scene.matter.add.sprite(240, this.scene.cameras.main.height - 300, 'mechanic', 0)
            .setScale(0.8)
            .setFixedRotation();
        // this.mechanic.setOnCollide(pair => {
        //     console.log(pair);
        // });
        this.scene.anims.create({
            key: 'mechanic-idle',
            frames: this.scene.anims.generateFrameNames('mechanic', { start: 0, end: 3 }),
            repeat: -1,
            frameRate: 7
        });

        this.scene.anims.create({
            key: 'mechanic-run',
            frames: this.scene.anims.generateFrameNames('mechanic', { start: 8, end: 12 }),
            repeat: -1,
            frameRate: 10
        });
        this.mechanic.play('mechanic-idle');
    }

    update() {
        const cursorKeys = this.scene.input.keyboard.createCursorKeys();
        if (cursorKeys.up.isDown) {
            this.mechanic.setVelocityY(-10);
        } else if (cursorKeys.down.isDown) {
            this.mechanic.setVelocityY(0);
        }

        if (cursorKeys.right.isDown) {
            this.mechanic.setVelocityX(10);
            this.mechanic.setFlipX(false);
        } else if (cursorKeys.left.isDown) {
            this.mechanic.setVelocityX(-10);
            this.mechanic.setFlipX(true);
        } else {
            this.mechanic.setVelocityX(0);
        }
        // if (this.mechanic.y > this.scene.cameras.main.height - 160) {
        //     this.mechanic.setY(this.scene.cameras.main.height - 161);
        //     this.mechanic.setVelocityY(0);
        // }
        this.updateAnimation();
    }

    updateAnimation() {
        if (this.mechanic.body.velocity.x === 0 && this.mechanic.body.velocity.y === 0 && this.currentAnimation !== 'mechanic-idle') {
            this.currentAnimation = 'mechanic-idle';
            this.mechanic.play('mechanic-idle');
        } else if ((this.mechanic.body.velocity.x !== 0 || this.mechanic.body.velocity.y !== 0) && this.currentAnimation !== 'mechanic-run') {
            this.currentAnimation = 'mechanic-run';
            this.mechanic.play('mechanic-run');
        }
    }

}