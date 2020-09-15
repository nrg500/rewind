import * as Phaser from 'phaser';
import Background from '../components/background';
import Mechanic from '../components/mechanic';
import Ground from '../components/ground';
import Player from '../components/player';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'Game'
};

export class GameScene extends Phaser.Scene {
    // private mechanic: Mechanic;
    private background: Background;
    private ground: Ground;
    player: any;

    constructor() {
        super(sceneConfig);

    }

    public preload() {
        this.load.image("background", "assets/backgrounds/bg_castle.png");
        // this.mechanic = new Mechanic(this);
        this.ground = new Ground(this);
        this.ground.preload();
        this.load.spritesheet("mechanic", "assets/sprites/mechanic/mechanic-all.png", { frameWidth: 202, frameHeight: 147, spacing: 0, margin: 0 });
        this.load.audio('music', ['assets/music/rewind.mp3']);
    }

    public create() {
        this.cameras.main.fadeIn();
        this.background = new Background(this);
        this.ground.create();
        this.player = new Player(this, 300, 0);
        this.cameras.main.x = 0;
        this.cameras.main.y = 0;
        this.cameras.main.setBounds(52, 70, this.game.scale.width, this.game.scale.height);
        this.matter.world.setGravity(0, 2);
        const sound = this.sound.add('music');
        sound.play({ loop: true })
        // this.matter.world.on("collisionstart", event => {
        //     event.pairs.forEach(pair => {
        //         console.log(`collison: ${pair}`)
        //         const { bodyA, bodyB } = pair;
        //     });
        // });
        // this.physics.world.setBounds(70, 70, this.game.scale.width, this.game.scale.height);
        // this.physics.add.collider(this.mechanic.getSprite(), this.ground.getLayer());
        // this.mechanic.getSprite().setCollidesWith(0);
    }

    public update() {
        // this.mechanic.update();
    }
}