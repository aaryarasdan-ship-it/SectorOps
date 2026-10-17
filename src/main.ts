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

const updateStatus = (message: string) => {
  status.classList.remove('boot-status--error');
  status.textContent = message;
};

if (!Engine.IsSupported()) {
  reportError('WebGL is not supported in this browser or is disabled.');
  throw new Error('WebGL is not supported.');
}

window.addEventListener('error', (event) => {
  reportError(event.error?.message ?? event.message ?? 'Unknown runtime error');
});

window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  reportError(reason instanceof Error ? reason.message : String(reason));
});

let scene: Scene;

try {
  updateStatus('Creating renderer...');
  const engine = new Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true,
    disableWebGL2Support: false,
  });

  updateStatus('Creating scene...');
  scene = createCombatPrototypeScene(engine, canvas);

  let firstFrameRendered = false;
  const firstFrameTimeout = window.setTimeout(() => {
    if (!firstFrameRendered) {
      reportError('Renderer started but no visible frame appeared. Check browser WebGL and console errors.');
    }
  }, 3000);

  updateStatus('Starting renderer...');

  engine.runRenderLoop(() => {
    try {
      scene.render();
      if (!firstFrameRendered) {
        firstFrameRendered = true;
        window.clearTimeout(firstFrameTimeout);
        updateStatus('Loaded. Click the game to focus.');
      }
    } catch (renderError) {
      const message = renderError instanceof Error ? renderError.message : String(renderError);
      reportError(`Render failed: ${message}`);
      engine.stopRenderLoop();
      throw renderError;
    }
  });

  window.setTimeout(() => {
    if (!firstFrameRendered) {
      reportError('Render loop has not produced a visible frame yet. Check the browser console for cached bundle or WebGL errors.');
    }
  }, 1000);

  window.addEventListener('resize', () => {
    engine.resize();
  });
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  reportError(`Startup failed: ${message}`);
  throw error;
}
