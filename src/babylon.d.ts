declare module '@babylonjs/core' {
  export class Color3 {
    constructor(r?: number, g?: number, b?: number);
    static Black(): Color3;
  }

  export class Color4 {
    constructor(r?: number, g?: number, b?: number, a?: number);
  }

  export class Vector3 {
    constructor(x?: number, y?: number, z?: number);
    x: number;
    y: number;
    z: number;
    static Zero(): Vector3;
    lengthSquared(): number;
    normalize(): Vector3;
    add(other: Vector3): Vector3;
    addInPlace(other: Vector3): Vector3;
    scale(value: number): Vector3;
  }

  export class Engine {
    constructor(canvas: HTMLCanvasElement, antialias?: boolean, options?: any);
    static IsSupported(): boolean;
    getDeltaTime(): number;
    runRenderLoop(callback: () => void): void;
    stopRenderLoop(): void;
    resize(): void;
  }

  export class Scene {
    constructor(engine: Engine);
    clearColor: Color4;
    gravity: Vector3;
    collisionsEnabled: boolean;
    activeCamera: any;
    onPointerObservable: { add(callback: (pointerInfo: PointerInfo) => void): void };
    onKeyboardObservable: { add(callback: (keyboardInfo: KeyboardInfo) => void): void };
    onBeforeRenderObservable: { add(callback: () => void): void };
    render(): void;
    getFrameId(): number;
  }

  export class HemisphericLight {
    constructor(name: string, direction: Vector3, scene: Scene);
    intensity: number;
    groundColor: Color3;
  }

  export class StandardMaterial {
    constructor(name: string, scene: Scene);
    diffuseColor: Color3;
    specularColor: Color3;
    emissiveColor?: Color3;
    backFaceCulling?: boolean;
    disableLighting?: boolean;
  }

  export class PBRMaterial {
    constructor(name: string, scene: Scene);
    albedoColor: Color3;
    roughness: number;
    metallic: number;
  }

  export class FreeCamera {
    constructor(name: string, position: Vector3, scene: Scene);
    minZ: number;
    speed: number;
    angularSensibility: number;
    applyGravity: boolean;
    checkCollisions: boolean;
    ellipsoid: Vector3;
    position: Vector3;
    rotation: Vector3;
    attachControl(canvas: HTMLCanvasElement, noPreventDefault?: boolean): void;
    setTarget(target: Vector3): void;
  }

  export const PointerEventTypes: {
    POINTERDOWN: number;
    POINTERUP: number;
    POINTERMOVE: number;
  };

  export const KeyboardEventTypes: {
    KEYDOWN: number;
    KEYUP: number;
  };

  export interface PointerInfo {
    type: number;
    event: PointerEvent;
  }

  export interface KeyboardInfo {
    type: number;
    event: KeyboardEvent;
  }

  export const MeshBuilder: {
    CreateGround(name: string, options: any, scene: Scene): any;
    CreateBox(name: string, options: any, scene: Scene): any;
    CreateCylinder(name: string, options: any, scene: Scene): any;
    CreateSphere(name: string, options: any, scene: Scene): any;
  };
}
