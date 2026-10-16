import { Engine, Scene } from '@babylonjs/core';
import { createCombatPrototypeScene } from './scene';
import './style.css';

const canvas = document.createElement('canvas');
canvas.id = 'game-canvas';
canvas.tabIndex = 1;
document.querySelector<HTMLDivElement>('#app')?.append(canvas);

const engine = new Engine(canvas, true, {
  preserveDrawingBuffer: true,
  stencil: true,
  disableWebGL2Support: false,
});

const scene: Scene = createCombatPrototypeScene(engine, canvas);

engine.runRenderLoop(() => {
  scene.render();
});

window.addEventListener('resize', () => {
  engine.resize();
});
