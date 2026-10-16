import {
  Color3,
  Color4,
  Engine,
  HemisphericLight,
  MeshBuilder,
  PBRMaterial,
  KeyboardInfo,
  Scene,
  PointerInfo,
  StandardMaterial,
  Vector3,
  PointerEventTypes,
  FreeCamera,
  KeyboardEventTypes,
} from '@babylonjs/core';

const MOVE_SPEED = 7.5;
const SPRINT_MULTIPLIER = 1.65;
const JUMP_SPEED = 7.25;
const GRAVITY = -18.5;
const LOOK_SENSITIVITY = 0.0022;

export function createCombatPrototypeScene(engine: Engine, canvas: HTMLCanvasElement): Scene {
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.07, 0.12, 0.18, 1);
  scene.gravity = new Vector3(0, GRAVITY, 0);
  scene.collisionsEnabled = true;

  const camera = new FreeCamera('playerCamera', new Vector3(0, 1.75, -6), scene);
  scene.activeCamera = camera;
  camera.minZ = 0.05;
  camera.speed = MOVE_SPEED;
  camera.angularSensibility = 6000;
  camera.applyGravity = true;
  camera.checkCollisions = true;
  camera.ellipsoid = new Vector3(0.35, 0.9, 0.35);
  camera.attachControl(canvas, true);
  camera.setTarget(new Vector3(0, 1.75, 0));

  const light = new HemisphericLight('sun', new Vector3(0.1, 1, 0.3), scene);
  light.intensity = 1.5;
  light.groundColor = new Color3(0.28, 0.3, 0.36);

  const beacon = MeshBuilder.CreateSphere('beacon', { diameter: 1.2, segments: 24 }, scene);
  beacon.position = new Vector3(0, 1.85, 4);
  const beaconMaterial = new StandardMaterial('beaconMaterial', scene);
  beaconMaterial.diffuseColor = new Color3(0.18, 0.22, 0.28);
  beaconMaterial.emissiveColor = new Color3(1, 0.78, 0.28);
  beaconMaterial.specularColor = Color3.Black();
  beacon.material = beaconMaterial;

  const backdrop = MeshBuilder.CreateBox('backdrop', { size: 420 }, scene);
  backdrop.position = new Vector3(0, 110, 0);
  const backdropMaterial = new StandardMaterial('backdropMaterial', scene);
  backdropMaterial.backFaceCulling = false;
  backdropMaterial.diffuseColor = new Color3(0.1, 0.16, 0.24);
  backdropMaterial.emissiveColor = new Color3(0.1, 0.16, 0.24);
  backdropMaterial.specularColor = Color3.Black();
  backdrop.material = backdropMaterial;

  const ground = MeshBuilder.CreateGround('ground', {
    width: 220,
    height: 220,
    subdivisions: 8,
  }, scene);
  ground.receiveShadows = true;
  ground.checkCollisions = true;
  const groundMaterial = new StandardMaterial('groundMaterial', scene);
  groundMaterial.diffuseColor = new Color3(0.2, 0.24, 0.19);
  groundMaterial.specularColor = Color3.Black();
  ground.material = groundMaterial;

  const concrete = new PBRMaterial('concrete', scene);
  concrete.albedoColor = new Color3(0.55, 0.56, 0.58);
  concrete.roughness = 0.95;
  concrete.metallic = 0;

  for (let x = -3; x <= 3; x += 1) {
    for (let z = -3; z <= 3; z += 1) {
      if (Math.abs(x) + Math.abs(z) > 4) continue;
      const block = MeshBuilder.CreateBox(`block-${x}-${z}`, { width: 4, height: 2.5, depth: 4 }, scene);
      block.position = new Vector3(x * 7, 1.25, z * 7);
      block.checkCollisions = true;
      block.material = concrete;
    }
  }

  const tower = MeshBuilder.CreateCylinder('tower', {
    height: 12,
    diameterTop: 3,
    diameterBottom: 4.5,
    tessellation: 16,
  }, scene);
  tower.position = new Vector3(16, 6, 14);
  tower.checkCollisions = true;
  tower.material = concrete;

  const weapon = MeshBuilder.CreateBox('weapon', { width: 0.18, height: 0.16, depth: 0.7 }, scene);
  weapon.parent = camera;
  weapon.position = new Vector3(0.28, -0.28, 0.55);
  const weaponMaterial = new StandardMaterial('weaponMaterial', scene);
  weaponMaterial.diffuseColor = new Color3(0.13, 0.14, 0.17);
  weaponMaterial.specularColor = new Color3(0.35, 0.38, 0.42);
  weapon.material = weaponMaterial;

  const muzzle = MeshBuilder.CreateSphere('muzzle', { diameter: 0.045, segments: 8 }, scene);
  muzzle.parent = weapon;
  muzzle.position = new Vector3(0, 0, 0.39);
  const muzzleMaterial = new StandardMaterial('muzzleMaterial', scene);
  muzzleMaterial.emissiveColor = new Color3(0.95, 0.78, 0.35);
  muzzleMaterial.disableLighting = true;
  muzzle.material = muzzleMaterial;

  const hud = document.createElement('div');
  hud.className = 'hud';
  hud.innerHTML = `
    <div class="hud__top">
      <div class="hud__panel">SectorOps Prototype</div>
      <div class="hud__panel">WASD Move · Shift Sprint · Space Jump · Click Fire</div>
    </div>
    <div></div>
    <div class="hud__bottom">
      <div class="hud__panel">P2P multiplayer foundation next</div>
      <div class="hud__panel">Realistic gunplay and movement baseline</div>
    </div>
    <div class="crosshair"></div>
  `;
  document.body.append(hud);

  const movement = {
    forward: false,
    back: false,
    left: false,
    right: false,
    sprint: false,
    jumpQueued: false,
  };

  const velocity = new Vector3(0, 0, 0);
  let grounded = true;
  let pitch = 0;
  let yaw = 0;
  let firing = false;
  let bobTime = 0;

  const updatePointerLock = () => {
    canvas.requestPointerLock?.();
  };

  scene.onPointerObservable.add((pointerInfo: PointerInfo) => {
    if (pointerInfo.type === PointerEventTypes.POINTERDOWN) {
      if (pointerInfo.event.button === 0) {
        firing = true;
        updatePointerLock();
      }
    }

    if (pointerInfo.type === PointerEventTypes.POINTERUP && pointerInfo.event.button === 0) {
      firing = false;
    }

    if (pointerInfo.type === PointerEventTypes.POINTERMOVE && document.pointerLockElement === canvas) {
      const event = pointerInfo.event as PointerEvent;
      yaw -= event.movementX * LOOK_SENSITIVITY;
      pitch = Math.max(-1.2, Math.min(1.05, pitch - event.movementY * LOOK_SENSITIVITY));
    }
  });

  scene.onKeyboardObservable.add((keyboardInfo: KeyboardInfo) => {
    const down = keyboardInfo.type === KeyboardEventTypes.KEYDOWN;
    switch (keyboardInfo.event.key.toLowerCase()) {
      case 'w':
        movement.forward = down;
        break;
      case 's':
        movement.back = down;
        break;
      case 'a':
        movement.left = down;
        break;
      case 'd':
        movement.right = down;
        break;
      case 'shift':
        movement.sprint = down;
        break;
      case ' ':
        if (down && grounded) {
          movement.jumpQueued = true;
        }
        break;
    }
  });

  scene.onBeforeRenderObservable.add(() => {
    const dt = engine.getDeltaTime() / 1000;
    const forward = new Vector3(Math.sin(yaw), 0, Math.cos(yaw));
    const right = new Vector3(forward.z, 0, -forward.x);

    let moveX = 0;
    let moveZ = 0;
    if (movement.forward) moveZ += 1;
    if (movement.back) moveZ -= 1;
    if (movement.right) moveX += 1;
    if (movement.left) moveX -= 1;

    const wishDir = forward.scale(moveZ).add(right.scale(moveX));
    if (wishDir.lengthSquared() > 0) {
      wishDir.normalize();
    }

    const maxSpeed = MOVE_SPEED * (movement.sprint ? SPRINT_MULTIPLIER : 1);
    const targetHorizontal = wishDir.scale(maxSpeed);
    velocity.x = targetHorizontal.x;
    velocity.z = targetHorizontal.z;

    if (movement.jumpQueued) {
      velocity.y = JUMP_SPEED;
      grounded = false;
      movement.jumpQueued = false;
    }

    velocity.y += GRAVITY * dt;

    camera.position.addInPlace(velocity.scale(dt));

    if (camera.position.y <= 1.75) {
      camera.position.y = 1.75;
      velocity.y = 0;
      grounded = true;
    }

    camera.rotation.x = pitch;
    camera.rotation.y = yaw;
    camera.rotation.z = 0;

    bobTime += dt * (wishDir.lengthSquared() > 0 ? (movement.sprint ? 13 : 9) : 2.5);
    const bob = Math.sin(bobTime) * (wishDir.lengthSquared() > 0 ? 0.03 : 0.01);
    weapon.position.y = -0.28 + bob;
    weapon.position.x = 0.28 + Math.sin(bobTime * 0.5) * 0.015;
    weapon.rotation.z = Math.sin(bobTime * 0.7) * 0.02;

    if (firing) {
      const recoil = Math.sin(scene.getFrameId() * 0.12) * 0.008;
      camera.rotation.x = Math.max(-1.2, Math.min(1.05, pitch + recoil));
      weapon.position.z = 0.55 - 0.03;
    } else {
      weapon.position.z = 0.55;
    }
  });

  return scene;
}
