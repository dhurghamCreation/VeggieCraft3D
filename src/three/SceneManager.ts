import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { VeggieCharacter } from './VeggieCharacter';
import { AnimationAction, BackdropTheme } from '../types';
import { sound } from '../utils/audio';

export interface SceneInteractionCallbacks {
  onGrabStart?: () => void;
  onGrabEnd?: (dragDistance: number) => void;
  onTickle?: () => void;
  onActionComplete?: (action: AnimationAction) => void;
}

export class SceneManager {
  public container: HTMLElement;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public character: VeggieCharacter;

  // Scene elements
  private dirLight: THREE.DirectionalLight;
  private hemiLight: THREE.HemisphereLight;
  private rimLight: THREE.DirectionalLight;
  private groundPlane: THREE.Mesh;
  private shadowPlane: THREE.Mesh;
  private particleGroup: THREE.Group;

  // Interaction & Raycasting
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private isPointerDown = false;
  private dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  private dragStartPoint = new THREE.Vector3();
  private currentDragPoint = new THREE.Vector3();
  private lastPointerPos = new THREE.Vector2();
  private pointerVelocity = 0;
  private interactionCallbacks: SceneInteractionCallbacks = {};

  // Camera Orbit Control Mode
  public isCameraOrbitMode = false;
  public isPaused = false;
  public isSlowMotion = false;
  private orbitAngles = { theta: 0, phi: 0 };
  private targetOrbitAngles = { theta: 0, phi: 0 };

  // Animation Loop State
  private timer = new THREE.Timer();
  private animFrameId: number | null = null;
  public currentAction: AnimationAction = 'idle';
  private actionTimer = 0;
  private actionDuration = 0;

  // Base positioning & idle
  private baseVeggieY = 0;

  constructor(container: HTMLElement, callbacks?: SceneInteractionCallbacks) {
    this.container = container;
    if (callbacks) this.interactionCallbacks = callbacks;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#fdfbf7');
    this.scene.fog = new THREE.FogExp2(0xfdfbf7, 0.04);

    // 2. Camera
    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 100);
    this.camera.position.set(0, 0.4, 7.2);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true, // enables photo snapshots
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    container.appendChild(this.renderer.domElement);

    // 4. Lighting Setup
    this.hemiLight = new THREE.HemisphereLight(0xfff5ea, 0xdcfce7, 0.85);
    this.scene.add(this.hemiLight);

    // Main key light (sun/studio spot)
    this.dirLight = new THREE.DirectionalLight(0xffffff, 1.3);
    this.dirLight.position.set(4, 7, 5);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.bias = -0.0005;
    this.dirLight.shadow.camera.near = 1;
    this.dirLight.shadow.camera.far = 18;
    this.dirLight.shadow.camera.left = -4;
    this.dirLight.shadow.camera.right = 4;
    this.dirLight.shadow.camera.top = 4;
    this.dirLight.shadow.camera.bottom = -4;
    this.scene.add(this.dirLight);

    // Rim light (for that soft silhouette shine)
    this.rimLight = new THREE.DirectionalLight(0xa5f3fc, 0.8);
    this.rimLight.position.set(-5, 4, -4);
    this.scene.add(this.rimLight);

    // Fill bounce light from below
    const bounceLight = new THREE.DirectionalLight(0xffedd5, 0.4);
    bounceLight.position.set(0, -5, 2);
    this.scene.add(bounceLight);

    // 5. Floor & Pedestal
    const groundGeom = new THREE.PlaneGeometry(30, 30);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0xf5efe6,
      roughness: 0.9,
      metalness: 0.05,
    });
    this.groundPlane = new THREE.Mesh(groundGeom, groundMat);
    this.groundPlane.rotation.x = -Math.PI / 2;
    this.groundPlane.position.y = -1.8;
    this.groundPlane.receiveShadow = true;
    this.scene.add(this.groundPlane);

    // Soft Circular Drop Shadow disc
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const ctx = shadowCanvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(0,0,0,0.35)');
    grad.addColorStop(0.5, 'rgba(0,0,0,0.15)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowGeom = new THREE.PlaneGeometry(3.5, 3.5);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
    });
    this.shadowPlane = new THREE.Mesh(shadowGeom, shadowMat);
    this.shadowPlane.rotation.x = -Math.PI / 2;
    this.shadowPlane.position.y = -1.79;
    this.scene.add(this.shadowPlane);

    // 6. Character
    this.character = new VeggieCharacter();
    this.scene.add(this.character.group);

    // 7. Floating particles group (hearts, sparkles)
    this.particleGroup = new THREE.Group();
    this.scene.add(this.particleGroup);

    // Bind events
    this.setupEventListeners();

    // Start loop
    this.startLoop();
  }

  public setCallbacks(callbacks: SceneInteractionCallbacks) {
    this.interactionCallbacks = callbacks;
  }

  public applyTheme(theme: BackdropTheme) {
    this.scene.background = new THREE.Color(theme.bgColor);
    if (this.scene.fog) {
      (this.scene.fog as THREE.FogExp2).color.set(theme.bgColor);
    }
    (this.groundPlane.material as THREE.MeshStandardMaterial).color.set(theme.floorColor);
    this.hemiLight.color.set(theme.ambientColor);
    this.dirLight.color.set(theme.lightColor);
  }

  /**
   * Pointer interactions: Grab & Squish / Drag / Tickle / Orbit
   */
  private setupEventListeners() {
    const el = this.renderer.domElement;

    el.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('pointercancel', this.onPointerUp);
  }

  private onPointerDown = (e: PointerEvent) => {
    this.isPointerDown = true;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.lastPointerPos.set(e.clientX, e.clientY);

    if (this.isCameraOrbitMode) {
      return;
    }

    // Raycast character mesh
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObject(this.character.bodyMesh, true);

    if (intersects.length > 0) {
      this.character.isGrabbed = true;
      this.raycaster.ray.intersectPlane(this.dragPlane, this.dragStartPoint);
      this.currentDragPoint.copy(this.dragStartPoint);

      sound.playSqueak(1.1);
      this.spawnPopParticles(intersects[0].point);
      this.interactionCallbacks.onGrabStart?.();
    }
  };

  private onPointerMove = (e: PointerEvent) => {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    // Calculate pointer velocity
    const dx = e.clientX - this.lastPointerPos.x;
    const dy = e.clientY - this.lastPointerPos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    this.pointerVelocity = dist;
    this.lastPointerPos.set(e.clientX, e.clientY);

    if (this.isPointerDown && this.isCameraOrbitMode) {
      this.targetOrbitAngles.theta += dx * 0.008;
      this.targetOrbitAngles.phi = THREE.MathUtils.clamp(
        this.targetOrbitAngles.phi + dy * 0.008,
        -0.6,
        0.8
      );
      return;
    }

    // 3D look-at target for eyes
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const planeIntersect = new THREE.Vector3();
    if (this.raycaster.ray.intersectPlane(this.dragPlane, planeIntersect)) {
      this.character.lookAtTarget.copy(planeIntersect);
    }

    // Character grabbed: pull and stretch
    if (this.isPointerDown && this.character.isGrabbed) {
      if (this.raycaster.ray.intersectPlane(this.dragPlane, this.currentDragPoint)) {
        const offset = this.currentDragPoint.clone().sub(this.dragStartPoint);
        // Clamp pull offset
        offset.clampLength(0, 1.8);
        this.character.pullOffset.copy(offset);

        // Eyes, head and body lean and look in the EXACT same direction as drag!
        this.character.lookAtTarget.copy(this.currentDragPoint);
        this.character.group.rotation.z = -offset.x * 0.16;
        this.character.group.rotation.x = offset.y * 0.12;

        this.character.rebuildMeshGeometry();
      }
    } else {
      // Hovering over character: detect tickle if moving fast
      const hits = this.raycaster.intersectObject(this.character.bodyMesh, true);
      if (hits.length > 0 && this.pointerVelocity > 18) {
        this.character.tickleMeter = Math.min(10, this.character.tickleMeter + 1.2);
        if (this.character.tickleMeter > 4) {
          sound.playGiggle();
          this.spawnHeartParticle(hits[0].point);
          this.character.triggerJiggle(0.4);
          this.interactionCallbacks.onTickle?.();
        }
      }
    }
  };

  private onPointerUp = () => {
    if (this.character.isGrabbed) {
      const pullDist = this.character.pullOffset.length();
      this.character.isGrabbed = false;

      // Smoothly return body group rotation back to neutral
      this.character.group.rotation.z = 0;
      this.character.group.rotation.x = 0;

      // Impart release spring velocity
      this.character.pullVelocity.copy(this.character.pullOffset).multiplyScalar(-18);
      this.character.triggerJiggle(pullDist * 1.5);
      sound.playBoing(Math.min(1.5, pullDist));

      this.interactionCallbacks.onGrabEnd?.(pullDist);
    }
    this.isPointerDown = false;
  };

  /**
   * Spawn floating hearts / sparkles
   */
  private spawnHeartParticle(origin: THREE.Vector3) {
    const geom = new THREE.SphereGeometry(0.08, 12, 12);
    geom.scale(1, 1.2, 0.8);
    const colors = [0xf43f5e, 0xfb7185, 0xff69b4, 0xf472b6];
    const mat = new THREE.MeshBasicMaterial({
      color: colors[Math.floor(Math.random() * colors.length)],
      transparent: true,
      opacity: 0.95,
    });
    const p = new THREE.Mesh(geom, mat);
    p.position.copy(origin).add(new THREE.Vector3((Math.random() - 0.5) * 0.4, 0.15, (Math.random() - 0.5) * 0.4));
    p.userData = {
      vy: 1.0 + Math.random() * 0.8,
      vx: (Math.random() - 0.5) * 0.35,
      vz: (Math.random() - 0.5) * 0.35,
      isFloatingHeart: true,
      phase: Math.random() * Math.PI * 2,
      life: 1.0,
    };
    this.particleGroup.add(p);
  }

  private spawnPopParticles(origin: THREE.Vector3) {
    for (let i = 0; i < 6; i++) {
      const geom = new THREE.SphereGeometry(0.05, 8, 8);
      const mat = new THREE.MeshBasicMaterial({
        color: Math.random() > 0.5 ? 0xfacc15 : 0x60a5fa,
        transparent: true,
        opacity: 0.9,
      });
      const p = new THREE.Mesh(geom, mat);
      p.position.copy(origin);
      const speed = 1.8 + Math.random() * 1.5;
      const angle = (i / 6) * Math.PI * 2 + Math.random() * 0.5;
      p.userData = {
        vx: Math.cos(angle) * speed * 0.5,
        vy: Math.sin(angle) * speed * 0.5 + 0.8,
        vz: (Math.random() - 0.5) * speed * 0.4,
        life: 0.7,
      };
      this.particleGroup.add(p);
    }
  }

  /**
   * Trigger fun special moves & animations
   */
  public triggerAction(action: AnimationAction) {
    sound.stopDiscoBeat();
    this.currentAction = action;
    this.actionTimer = 0;
    sound.stopDiscoBeat();
    sound.stopBeatbox();

    if (action === 'bounce') {
      this.actionDuration = 1.1;
      sound.playBoing(1.2);
    } else if (action === 'jiggle') {
      this.actionDuration = 1.6;
      this.character.triggerJiggle(2.8);
      sound.playGiggle();
    } else if (action === 'spin') {
      this.actionDuration = 1.2;
      sound.playBoing(0.8);
    } else if (action === 'sneeze') {
      this.actionDuration = 1.4;
      sound.playSneeze();
    } else if (action === 'dance') {
      this.actionDuration = 4.2;
      sound.playDiscoBeat();
      confetti({
        particleCount: 55,
        spread: 70,
        origin: { y: 0.65 },
      });
    } else if (action === 'moonwalk') {
      this.actionDuration = 3.2;
      sound.playDiscoBeat();
    } else if (action === 'wave') {
      this.actionDuration = 2.8;
      sound.playWiggle();
    } else if (action === 'heartbeat') {
      this.actionDuration = 2.4;
      sound.playHeartbeat();
      for (let i = 0; i < 4; i++) {
        setTimeout(() => {
          this.spawnHeartParticle(new THREE.Vector3(0, 0.4, 0.6));
        }, i * 350);
      }
    } else if (action === 'zen') {
      this.actionDuration = 3.8;
      sound.playZen();
    } else if (action === 'beatbox') {
      this.actionDuration = 3.2;
      sound.playBeatbox();
    }
  }

  /**
   * High-resolution snapshot download
   */
  public takeSnapshot(): string {
    this.renderer.render(this.scene, this.camera);
    return this.renderer.domElement.toDataURL('image/png');
  }

  /**
   * Resize handler
   */
  public resize() {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /**
   * Main Render Loop
   */
  private startLoop() {
    const animate = () => {
      this.animFrameId = requestAnimationFrame(animate);

      if (this.isPaused) {
        // Still render the current frame cleanly, but freeze animation physics
        this.renderer.render(this.scene, this.camera);
        return;
      }

      this.timer.update();
      const rawDelta = Math.min(this.timer.getDelta(), 0.1);
      const delta = this.isSlowMotion ? rawDelta * 0.35 : rawDelta;
      const time = this.timer.getElapsed();

      // Smooth camera orbit lerp
      this.orbitAngles.theta += (this.targetOrbitAngles.theta - this.orbitAngles.theta) * 0.1;
      this.orbitAngles.phi += (this.targetOrbitAngles.phi - this.orbitAngles.phi) * 0.1;

      const camDist = 7.2;
      this.camera.position.x = Math.sin(this.orbitAngles.theta) * Math.cos(this.orbitAngles.phi) * camDist;
      this.camera.position.y = 0.4 + Math.sin(this.orbitAngles.phi) * camDist;
      this.camera.position.z = Math.cos(this.orbitAngles.theta) * Math.cos(this.orbitAngles.phi) * camDist;
      this.camera.lookAt(0, 0.2, 0);

      // Character procedural animation
      this.animateCharacter(delta, time);

      // Update character internal physics & look-at
      this.character.update(delta, time);

      // Loving mood aura: periodically drift up sweet tender heart particles
      if (this.character.getExpression() === 'love' && Math.random() < 0.035) {
        this.spawnHeartParticle(new THREE.Vector3(0, this.baseVeggieY + 0.5, 0.35));
      }

      // Update particle physics
      for (let i = this.particleGroup.children.length - 1; i >= 0; i--) {
        const p = this.particleGroup.children[i] as THREE.Mesh;
        const ud = p.userData;
        p.position.x += ud.vx * delta;
        p.position.y += ud.vy * delta;
        p.position.z += ud.vz * delta;

        if (ud.isFloatingHeart) {
          // Gentle buoyant float with horizontal sway
          ud.vy += 0.3 * delta;
          p.position.x += Math.sin(time * 3.5 + (ud.phase || 0)) * 0.005;
          ud.life -= delta * 0.9;
        } else {
          ud.vy -= 2.0 * delta; // gravity
          ud.life -= delta * 1.5;
        }

        p.scale.setScalar(Math.max(0.01, ud.life));
        if (p.material && (p.material as THREE.Material).transparent) {
          (p.material as THREE.Material).opacity = Math.max(0, ud.life);
        }

        if (ud.life <= 0) {
          this.particleGroup.remove(p);
          p.geometry.dispose();
          if (Array.isArray(p.material)) p.material.forEach(m => m.dispose());
          else p.material.dispose();
        }
      }

      // Render
      this.renderer.render(this.scene, this.camera);
    };

    animate();
  }

  /**
   * Action & Idle Animation Blender
   */
  private animateCharacter(delta: number, time: number) {
    const group = this.character.group;

    if (this.currentAction === 'idle') {
      // Gentle breathing bob & subtle mouse curiosity tilt
      const breath = Math.sin(time * 2.5);
      group.position.y = this.baseVeggieY + breath * 0.06;
      group.scale.y = 1 + breath * 0.025;
      group.scale.x = 1 - breath * 0.012;
      group.scale.z = 1 - breath * 0.012;

      // Subtle body sway towards mouse when not grabbed
      if (!this.character.isGrabbed && !this.isCameraOrbitMode) {
        const targetRotY = this.mouse.x * 0.35;
        const targetRotX = this.mouse.y * 0.22;
        group.rotation.y += (targetRotY - group.rotation.y) * 0.08;
        group.rotation.x += (targetRotX - group.rotation.x) * 0.08;
      }
    } else if (this.currentAction === 'bounce') {
      this.actionTimer += delta;
      const progress = this.actionTimer / this.actionDuration;

      if (progress < 1) {
        // Jump arc: high parabola with frontflip!
        const arc = Math.sin(progress * Math.PI);
        group.position.y = this.baseVeggieY + arc * 1.8;
        group.rotation.x = progress * Math.PI * 2; // full flip

        // Squash on take-off and landing
        if (progress < 0.2 || progress > 0.8) {
          group.scale.y = 0.8;
          group.scale.x = 1.15;
          group.scale.z = 1.15;
        } else {
          group.scale.y = 1.25;
          group.scale.x = 0.9;
          group.scale.z = 0.9;
        }
      } else {
        this.finishAction();
      }
    } else if (this.currentAction === 'jiggle') {
      this.actionTimer += delta;
      const progress = this.actionTimer / this.actionDuration;

      if (progress < 1) {
        const damping = 1 - progress;
        const w = Math.sin(this.actionTimer * 36) * damping * 0.26;
        group.rotation.z = w;
        group.rotation.x = Math.cos(this.actionTimer * 30) * damping * 0.18;
        group.position.x = Math.cos(this.actionTimer * 32) * damping * 0.22;

        // Elastic squash & stretch pulses
        const squashPulse = Math.sin(this.actionTimer * 28) * damping * 0.2;
        group.scale.y = 1 + squashPulse;
        group.scale.x = 1 - squashPulse * 0.6;
        group.scale.z = 1 - squashPulse * 0.6;
      } else {
        this.finishAction();
      }
    } else if (this.currentAction === 'spin') {
      this.actionTimer += delta;
      const progress = this.actionTimer / this.actionDuration;

      if (progress < 1) {
        const easeProgress = Math.sin((progress * Math.PI) / 2);
        group.rotation.y = easeProgress * Math.PI * 4; // double spin
        group.position.y = this.baseVeggieY + Math.sin(progress * Math.PI) * 0.5;
      } else {
        this.finishAction();
      }
    } else if (this.currentAction === 'sneeze') {
      this.actionTimer += delta;
      const progress = this.actionTimer / this.actionDuration;

      if (progress < 0.5) {
        // Windup: squashes down tightly, eyes squint
        const squash = progress / 0.5;
        group.scale.y = 1.0 - squash * 0.35;
        group.scale.x = 1.0 + squash * 0.25;
        group.scale.z = 1.0 + squash * 0.25;
        group.position.y = this.baseVeggieY - squash * 0.3;
      } else if (progress < 0.7) {
        // ACHOO! Explodes forward and up
        group.scale.y = 1.4;
        group.scale.x = 0.75;
        group.scale.z = 0.75;
        group.position.y = this.baseVeggieY + 0.6;
        group.position.z = 0.4;
        group.rotation.x = 0.4;

        if (this.actionTimer - delta <= 0.5 * this.actionDuration) {
          confetti({
            particleCount: 30,
            spread: 45,
            origin: { y: 0.5 },
          });
        }
      } else if (progress < 1) {
        // Recover
        group.position.lerp(new THREE.Vector3(0, this.baseVeggieY, 0), 0.1);
        group.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
        group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, 0, 0.1);
      } else {
        this.finishAction();
      }
    } else if (this.currentAction === 'dance') {
      this.actionTimer += delta;
      const progress = this.actionTimer / this.actionDuration;

      if (progress < 1) {
        const beat = Math.abs(Math.sin(this.actionTimer * 9));
        group.position.y = this.baseVeggieY + beat * 0.48;
        group.rotation.z = Math.sin(this.actionTimer * 4.5) * 0.3;
        group.rotation.y = Math.cos(this.actionTimer * 4.5) * 0.35;
        group.scale.y = 1.0 + (beat - 0.5) * 0.2;
        group.scale.x = 1.0 - (beat - 0.5) * 0.12;

        if (Math.random() < 0.08) {
          this.spawnPopParticles(new THREE.Vector3((Math.random() - 0.5) * 1.2, 0.5, 0.4));
        }
      } else {
        this.finishAction();
      }
    } else if (this.currentAction === 'moonwalk') {
      this.actionTimer += delta;
      const progress = this.actionTimer / this.actionDuration;

      if (progress < 1) {
        // Smooth slide from right to left with foot tap bobbing
        if (progress < 0.8) {
          const slideProgress = progress / 0.8;
          group.position.x = THREE.MathUtils.lerp(1.2, -1.2, slideProgress);
          group.position.y = this.baseVeggieY + Math.abs(Math.sin(this.actionTimer * 12)) * 0.12;
          group.rotation.z = -0.22; // stylish lean
          group.rotation.y = Math.PI * 0.45; // turned sideways
        } else {
          // Snappy spin finish back to center
          const turnProgress = (progress - 0.8) / 0.2;
          group.position.x = THREE.MathUtils.lerp(-1.2, 0, turnProgress);
          group.rotation.z = THREE.MathUtils.lerp(-0.22, 0, turnProgress);
          group.rotation.y = THREE.MathUtils.lerp(Math.PI * 0.45, Math.PI * 2, turnProgress);
        }
      } else {
        this.finishAction();
      }
    } else if (this.currentAction === 'wave') {
      this.actionTimer += delta;
      const progress = this.actionTimer / this.actionDuration;

      if (progress < 1) {
        // Serpentine hula wave
        const wave = Math.sin(this.actionTimer * 5);
        group.rotation.z = wave * 0.32;
        group.rotation.x = Math.cos(this.actionTimer * 5) * 0.18;
        group.position.x = wave * 0.28;
      } else {
        this.finishAction();
      }
    } else if (this.currentAction === 'heartbeat') {
      this.actionTimer += delta;
      const progress = this.actionTimer / this.actionDuration;

      if (progress < 1) {
        const beatCycle = (this.actionTimer * 2.8) % 1.0;
        let scaleThrob = 1.0;
        if (beatCycle < 0.18) {
          scaleThrob = 1.0 + Math.sin((beatCycle / 0.18) * Math.PI) * 0.22;
        } else if (beatCycle > 0.25 && beatCycle < 0.44) {
          scaleThrob = 1.0 + Math.sin(((beatCycle - 0.25) / 0.19) * Math.PI) * 0.16;
        }
        group.scale.set(scaleThrob, scaleThrob, scaleThrob);
        group.position.y = this.baseVeggieY + (scaleThrob - 1) * 0.3;
      } else {
        this.finishAction();
      }
    } else if (this.currentAction === 'zen') {
      this.actionTimer += delta;
      const progress = this.actionTimer / this.actionDuration;

      if (progress < 1) {
        // Gentle levitation and serene figure-8 floating
        const lift = Math.sin(progress * Math.PI) * 0.85;
        group.position.y = this.baseVeggieY + lift;
        group.position.x = Math.sin(this.actionTimer * 2.2) * 0.18;
        group.position.z = Math.cos(this.actionTimer * 2.2) * 0.12;
        group.rotation.y = this.actionTimer * 0.8;

        if (Math.random() < 0.05) {
          this.spawnHeartParticle(new THREE.Vector3(0, this.baseVeggieY, 0));
        }
      } else {
        this.finishAction();
      }
    } else if (this.currentAction === 'beatbox') {
      this.actionTimer += delta;
      const progress = this.actionTimer / this.actionDuration;

      if (progress < 1) {
        const beat = Math.sin(this.actionTimer * 12);
        const isDown = beat > 0;
        group.rotation.x = isDown ? beat * 0.32 : 0;
        group.position.y = this.baseVeggieY - (isDown ? beat * 0.14 : 0);
        group.rotation.y = Math.sin(this.actionTimer * 6) * 0.25;
      } else {
        this.finishAction();
      }
    }

    // Shadow disc sync
    const jumpHeight = group.position.y - this.baseVeggieY;
    this.shadowPlane.scale.setScalar(Math.max(0.4, 1.0 - jumpHeight * 0.2));
    (this.shadowPlane.material as THREE.MeshBasicMaterial).opacity = Math.max(0.15, 0.75 - jumpHeight * 0.25);
  }

  private finishAction() {
    const completedAction = this.currentAction;
    if (completedAction === 'dance' || completedAction === 'moonwalk') {
      sound.stopDiscoBeat();
    }
    if (completedAction === 'beatbox') {
      sound.stopBeatbox();
    }
    this.currentAction = 'idle';
    this.character.group.position.set(0, this.baseVeggieY, 0);
    this.character.group.rotation.set(0, 0, 0);
    this.character.group.scale.set(1, 1, 1);
    this.interactionCallbacks.onActionComplete?.(completedAction);
  }

  public resetOrbit() {
    this.targetOrbitAngles.theta = 0;
    this.targetOrbitAngles.phi = 0;
  }

  public dispose() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    this.timer.dispose();
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointercancel', this.onPointerUp);
    this.renderer.dispose();
    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
