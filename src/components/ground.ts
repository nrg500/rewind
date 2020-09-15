export default class Ground {
    private scene: Phaser.Scene;
    private width: number;
    private height: number;
    private layer: Phaser.Tilemaps.DynamicTilemapLayer;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.height = 70;
        this.width = 70;
    }

    getLayer(): Phaser.Tilemaps.DynamicTilemapLayer {
        return this.layer;
    }

    preload() {
        this.scene.load.image("tiles", "assets/sprites/tiles/tiles_spritesheet.png");
        this.scene.load.tilemapTiledJSON("map", "assets/sprites/tiles/rewind.json")
    }

    create() {
        const map = this.scene.make.tilemap({ key: "map" });
        const tileset = map.addTilesetImage("tiles_spritesheet", "tiles", 70, 70, 0, 2, 0);

        this.layer = map.createDynamicLayer("BaseMap", tileset, 0, 0);
        this.layer.setCollisionFromCollisionGroup();
        this.scene.matter.world.convertTilemapLayer(this.layer);
        const debugGraphics = this.scene.add.graphics().setAlpha(0.1);
        // this.layer.renderDebug(debugGraphics, {
        //     tileColor: null, // Color of non-colliding tiles
        //     collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
        //     faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
        // });
    }
}