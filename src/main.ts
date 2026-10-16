import { Engine, Scene } from '@babylonjs/core';
import { createCombatPrototypeScene } from './scene';
import './style.css';

const root = document.querySelector<HTMLDivElement>('#app');

if (!root) {
  throw new Error('App root element not found.');
}

const status = document.createElement('div');
status.className = 'boot-status';
status.textContent = 'Booting SectorOps...';
root.append(status);

const canvas = document.createElement('canvas');
canvas.id = 'game-canvas';
canvas.tabIndex = 1;
root.append(canvas);

const reportError = (message: string) => {
  status.classList.add('boot-status--error');
  status.textContent = message;
};

window.addEventListener('error', (event) => {
  reportError(event.error?.message ?? event.message ?? 'Unknown runtime error');
});

window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  reportError(reason instanceof Error ? reason.message : String(reason));
});

let scene: Scene;

try {
  const engine = new Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true,
    disableWebGL2Support: false,
  });

  scene = createCombatPrototypeScene(engine, canvas);
  status.textContent = 'Loaded. Click the game to focus.';

  engine.runRenderLoop(() => {
    scene.render();
  });

  window.addEventListener('resize', () => {
    engine.resize();
  });
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  reportError(`Startup failed: ${message}`);
  throw error;
}
