import * as Phaser from 'phaser';
import * as MatterJS from 'matter-js';
import * as PhaserMatterCollisionPlugin from "phaser-matter-collision-plugin";
import { GameScene } from './scenes/game-scene';

import player from './components/player'

const gameConfig: Phaser.Types.Core.GameConfig = {
    title: 'Rewind',

    type: Phaser.AUTO,

    scale: {
        width: window.innerWidth,
        height: window.innerHeight,
    },

    physics: { default: 'matter' },
    plugins: {
        scene: [
            {
                plugin: PhaserMatterCollisionPlugin, // The plugin class
                key: "matterCollision", // Where to store in Scene.Systems, e.g. scene.sys.matterCollision
                mapping: "matterCollision" // Where to store in the Scene, e.g. scene.matterCollision
            }
        ]
    },

    parent: 'game',
    scene: GameScene,
};

export const game = new Phaser.Game(gameConfig);