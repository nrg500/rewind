
import MultiKey from './multi-key';
export default class Player {
    scene: any;
    sprite: any;
    sensors: { bottom: any; left: any; right: any; };
    isTouching: { left: boolean; right: boolean; ground: boolean; };
    canJump: boolean;
    jumpCooldownTimer: any;
    leftInput: any;
    rightInput: any;
    jumpInput: any;
    destroyed: any;
    groundCount: number;
    constructor(scene, x, y) {
        this.scene = scene;

        // Create the animations we need from the player spritesheet
        const anims = scene.anims;
        anims.create({
            key: 'mechanic-idle',
            frames: this.scene.anims.generateFrameNames('mechanic', { start: 0, end: 3 }),
            repeat: -1,
            frameRate: 7
        });

        anims.create({
            key: 'mechanic-run',
            frames: this.scene.anims.generateFrameNames('mechanic', { start: 8, end: 12 }),
            repeat: -1,
            frameRate: 10
        });

        anims.create({
            key: 'mechanic-jump',
            frames: this.scene.anims.generateFrameNames('mechanic', { start: 4, end: 7 })
        })

        // Create the physics-based sprite that we will move around and animate

        this.sprite = scene.matter.add.sprite(x, y, 'mechanic', 0)

        // The player's body is going to be a compound body that looks something like this:
        //
        //                  A = main body
        //
        //                   +---------+
        //                   |         |
        //                 +-+         +-+
        //       B = left  | |         | |  C = right
        //    wall sensor  |B|    A    |C|  wall sensor
        //                 | |         | |
        //                 +-+         +-+
        //                   |         |
        //                   +-+-----+-+
        //                     |  D  |
        //                     +-----+
        //
        //                D = ground sensor
        //
        // The main body is what collides with the world. The sensors are used to determine if the
        // player is blocked by a wall or standing on the ground.
        const { Body, Bodies } = Phaser.Physics.Matter.Matter;
        const { width: w, height: h } = this.sprite;
        // //body
        // var r3 = this.scene.add.rectangle(w * 0.5 + x - 105, h * 0.62 + 154, w * 0.14, h * 0.5);
        // //bottom
        // var r2 = this.scene.add.rectangle(w * 0.5 + x - 105, h * 0.88 + 154, w * 0.08, 4);
        // //left
        // var r1 = this.scene.add.rectangle(w * 0.43 - 4 + x - 105, h * 0.62 + 154, 4, h * 0.2);
        // //right
        // var r0 = this.scene.add.rectangle(w * 0.57 + 4 + x - 105, h * 0.62 + 154, 4, h * 0.2);

        // r3.setStrokeStyle(2, 0x1a65ac);
        // r2.setStrokeStyle(2, 0x1a65ac);
        // r1.setStrokeStyle(2, 0x1a65ac);
        // r0.setStrokeStyle(2, 0x1a65ac);
        const mainBody = Bodies.rectangle(w * 0.5, h * 0.62, w * 0.14, h * 0.5, { chamfer: { radius: 10 } });
        this.sensors = {
            bottom: Bodies.rectangle(w * 0.5, h * 0.88, w * 0.08, 4, { isSensor: true }),
            left: Bodies.rectangle(w * 0.43 - 4, h * 0.62, 4, h * 0.2, { isSensor: true }),
            right: Bodies.rectangle(w * 0.57 + 4, h * 0.62, 4, h * 0.2, { isSensor: true })
        };
        const compoundBody = Body.create({
            parts: [mainBody, this.sensors.bottom, this.sensors.left, this.sensors.right],
            frictionStatic: 0,
            frictionAir: 0.02,
            friction: 0.1
        });
        this.sprite
            .setExistingBody(compoundBody)
            .setScale(0.8)
            .setFixedRotation() // Sets inertia to infinity so the player can't rotate
            .setPosition(x, y);

        // Track which sensors are touching something
        this.isTouching = { left: false, right: false, ground: false };

        // Jumping is going to have a cooldown
        this.canJump = true;
        this.jumpCooldownTimer = null;

        // Before matter's update, reset our record of which surfaces the player is touching.
        scene.matter.world.on("beforeupdate", this.resetTouching, this);

        scene.matterCollision.addOnCollideStart({
            objectA: [this.sensors.bottom, this.sensors.left, this.sensors.right],
            callback: this.onSensorCollide,
            context: this
        });
        scene.matterCollision.addOnCollideActive({
            objectA: [this.sensors.bottom, this.sensors.left, this.sensors.right],
            callback: this.onSensorCollide,
            context: this
        });

        // Track the keys
        const { LEFT, RIGHT, UP, A, D, W } = Phaser.Input.Keyboard.KeyCodes;
        this.leftInput = new MultiKey(scene, [LEFT, A]);
        this.rightInput = new MultiKey(scene, [RIGHT, D]);
        this.jumpInput = new MultiKey(scene, [UP, W]);

        this.scene.events.on("update", this.update, this);
    }

    onSensorCollide({ bodyA, bodyB, pair }) {
        // Watch for the player colliding with walls/objects on either side and the ground below, so
        // that we can use that logic inside of update to move the player.
        // Note: we are using the "pair.separation" here. That number tells us how much bodyA and bodyB
        // overlap. We want to teleport the sprite away from walls just enough so that the player won't
        // be able to press up against the wall and use friction to hang in midair. This formula leaves
        // 0.5px of overlap with the sensor so that the sensor will stay colliding on the next tick if
        // the player doesn't move.
        if (bodyB.isSensor) return; // We only care about collisions with physical objects
        if (bodyA === this.sensors.left) {
            this.isTouching.left = true;
            if (pair.separation > 0.5) this.sprite.x += pair.separation - 0.5;
        } else if (bodyA === this.sensors.right) {
            this.isTouching.right = true;
            if (pair.separation > 0.5) this.sprite.x -= pair.separation - 0.5;
        } else if (bodyA === this.sensors.bottom) {
            this.isTouching.ground = true;
        }
    }

    resetTouching() {
        this.isTouching.left = false;
        this.isTouching.right = false;
        this.isTouching.ground = false;
    }

    freeze() {
        this.sprite.setStatic(true);
    }

    update() {
        if (this.destroyed) return;

        const sprite = this.sprite;
        const velocity = sprite.body.velocity;
        const isRightKeyDown = this.rightInput.isDown();
        const isLeftKeyDown = this.leftInput.isDown();
        const isJumpKeyDown = this.jumpInput.isDown();
        const isOnGround = this.isTouching.ground;
        const isInAir = !isOnGround;

        // --- Move the player horizontally ---

        // Adjust the movement so that the player is slower in the air
        const moveForce = isOnGround ? 0.01 : 0.005;

        if (isLeftKeyDown) {
            sprite.setFlipX(true);

            // Don't let the player push things left if they in the air
            if (!(isInAir && this.isTouching.left)) {
                sprite.applyForce({ x: -moveForce, y: 0 });
            }
        } else if (isRightKeyDown) {
            sprite.setFlipX(false);

            // Don't let the player push things right if they in the air
            if (!(isInAir && this.isTouching.right)) {
                sprite.applyForce({ x: moveForce, y: 0 });
            }
        }

        // Limit horizontal speed, without this the player's velocity would just keep increasing to
        // absurd speeds. We don't want to touch the vertical velocity though, so that we don't
        // interfere with gravity.
        if (velocity.x > 7) sprite.setVelocityX(7);
        else if (velocity.x < -7) sprite.setVelocityX(-7);

        // --- Move the player vertically ---

        if (isJumpKeyDown && this.canJump && isOnGround) {
            sprite.setVelocityY(-20);

            // Add a slight delay between jumps since the bottom sensor will still collide for a few
            // frames after a jump is initiated
            this.canJump = false;
            this.jumpCooldownTimer = this.scene.time.addEvent({
                delay: 250,
                callback: () => (this.canJump = true)
            });
        }

        // Update the animation/texture based on the state of the player's state
        if (isOnGround) {
            this.groundCount++;
            // console.log('isOnGround')
            if (this.groundCount < 6) {
                sprite.setTexture("mechanic", 6);
            } else if (sprite.body.force.x !== 0) {
                sprite.anims.play("mechanic-run", true);
            } else {
                sprite.anims.play("mechanic-idle", true);
            }
        } else {
            // console.log('isNotOnGround')
            this.groundCount = 0;
            sprite.anims.stop();
            if (velocity.y > 0) {
                sprite.setTexture("mechanic", 5)
            } else {
                sprite.setTexture("mechanic", 4)
            }
            // sprite.anims.stop();
            // sprite.setTexture("mechanic", 0);
        }
    }

    destroy() { }
}
