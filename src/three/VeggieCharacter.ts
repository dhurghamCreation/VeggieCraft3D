import * as THREE from 'three';
import { VeggieType, ExpressionType, AccessoryType, ShapeMorphParams, MaterialStyle } from '../types';

/**
 * Procedural 3D Heart Shape generator for expressive loving features
 */
function createHeartShape(scale: number = 1.0): THREE.Shape {
  const shape = new THREE.Shape();
  const s = scale;
  shape.moveTo(0, s * 0.04);
  shape.bezierCurveTo(0, s * 0.10, -s * 0.08, s * 0.14, -s * 0.14, s * 0.14);
  shape.bezierCurveTo(-s * 0.22, s * 0.14, -s * 0.22, s * 0.03, -s * 0.22, 0);
  shape.bezierCurveTo(-s * 0.22, -s * 0.08, -s * 0.10, -s * 0.16, 0, -s * 0.22);
  shape.bezierCurveTo(s * 0.10, -s * 0.16, s * 0.22, -s * 0.08, s * 0.22, 0);
  shape.bezierCurveTo(s * 0.22, s * 0.03, s * 0.22, s * 0.14, s * 0.14, s * 0.14);
  shape.bezierCurveTo(s * 0.08, s * 0.14, 0, s * 0.10, 0, s * 0.04);
  return shape;
}

export class VeggieCharacter {
  public group: THREE.Group;
  public bodyMesh: THREE.Mesh;
  private bodyGeometry: THREE.CylinderGeometry;
  private basePositions: Float32Array;

  // Parts
  private faceGroup: THREE.Group;
  private leftEye: THREE.Group;
  private rightEye: THREE.Group;
  private leftSclera: THREE.Mesh;
  private rightSclera: THREE.Mesh;
  private leftPupil: THREE.Mesh;
  private rightPupil: THREE.Mesh;
  private leftHeartPupil: THREE.Group;
  private rightHeartPupil: THREE.Group;
  private leftClosedEye: THREE.Mesh;
  private rightClosedEye: THREE.Mesh;
  private leftCheek: THREE.Mesh;
  private rightCheek: THREE.Mesh;
  private leftCheekHeart: THREE.Mesh;
  private rightCheekHeart: THREE.Mesh;
  private loveHeartsGroup: THREE.Group;
  private floatingHearts: THREE.Mesh[] = [];
  private mouthMesh: THREE.Mesh | null = null;
  private mouthGroup: THREE.Group;
  private eyebrowsGroup: THREE.Group;
  private leftEyebrow: THREE.Mesh;
  private rightEyebrow: THREE.Mesh;

  // Veggie specific topper & features
  private topperGroup: THREE.Group;
  private cornHuskGroup: THREE.Group | null = null;
  private avocadoPit: THREE.Mesh | null = null;
  private broccoliFlorets: THREE.Group | null = null;
  private eggplantStem: THREE.Mesh | null = null;

  // Accessories
  private accessoryGroup: THREE.Group;
  private faceAccessoryGroup: THREE.Group;
  private headphonesGroup: THREE.Group | null = null;
  private leftEarCup: THREE.Group | null = null;
  private rightEarCup: THREE.Group | null = null;
  private headbandMesh: THREE.Mesh | null = null;
  private headbandPadMesh: THREE.Mesh | null = null;
  private headphoneBodyMat: THREE.MeshStandardMaterial;
  private headphoneCushionMat: THREE.MeshStandardMaterial;
  private headphoneMetalMat: THREE.MeshStandardMaterial;
  private headphoneAccentMat: THREE.MeshStandardMaterial;
  private flowerGroup: THREE.Group | null = null;

  // Material
  private bodyMaterial: THREE.MeshStandardMaterial;

  // State
  private currentType: VeggieType = 'carrot';
  private currentExpression: ExpressionType = 'happy';
  private currentAccessory: AccessoryType = 'none';
  public activeAccessories: Set<AccessoryType> = new Set();
  private shapeParams: ShapeMorphParams;

  // Physics Spring Wobble
  public pullOffset = new THREE.Vector3();
  public pullVelocity = new THREE.Vector3();
  public jiggleFactor = 0;
  public isGrabbed = false;
  public tickleMeter = 0;
  private blinkTimer = 0;
  private nextBlinkInterval = 3;
  private blinkProgress = 0;

  // Look-at coordinates
  public lookAtTarget = new THREE.Vector3(0, 0, 8);

  constructor() {
    this.group = new THREE.Group();

    // Default shape params
    this.shapeParams = {
      squashStretch: 0,
      chubbiness: 1,
      taper: 0.5,
      twist: 0,
      lumpiness: 0.15,
      bend: 0,
    };

    // Initialize Body Geometry: Cylinder with round ends, dense enough for deformation
    const radialSegs = 40;
    const heightSegs = 50;
    this.bodyGeometry = new THREE.CylinderGeometry(0.85, 0.85, 2.6, radialSegs, heightSegs, false);
    
    // Save base position array for real-time procedural morphing
    const posAttr = this.bodyGeometry.attributes.position;
    this.basePositions = new Float32Array(posAttr.array);

    // Initial Material
    this.bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0xff7020,
      roughness: 0.35,
      metalness: 0.05,
      flatShading: false,
    });

    this.bodyMesh = new THREE.Mesh(this.bodyGeometry, this.bodyMaterial);
    this.bodyMesh.castShadow = true;
    this.bodyMesh.receiveShadow = true;
    this.group.add(this.bodyMesh);

    // Reusable materials for dynamic custom-fitting DJ Headphones
    this.headphoneBodyMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.25,
      metalness: 0.35,
    });
    this.headphoneCushionMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb, // Vibrant plush electric blue cushions
      roughness: 0.55,
      metalness: 0.05,
    });
    this.headphoneMetalMat = new THREE.MeshStandardMaterial({
      color: 0xe4e4e7,
      roughness: 0.15,
      metalness: 0.85,
    });
    this.headphoneAccentMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.2,
      metalness: 0.7,
    });

    // Build Facial Features
    this.faceGroup = new THREE.Group();
    this.faceGroup.position.set(0, 0.25, 0.7);
    this.group.add(this.faceGroup);

    // Eyes: proportioned domes set back into the body surface
    const eyeGeom = new THREE.SphereGeometry(0.18, 24, 24);
    eyeGeom.scale(1, 1, 0.55); // flattened Z profile to hug object surface

    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.1,
      metalness: 0.05,
    });

    const pupilGeom = new THREE.SphereGeometry(0.088, 20, 20);
    pupilGeom.scale(1, 1, 0.3);
    const pupilMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.1,
    });

    // Closed eye arcs for sleepy expression
    const closedCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.13, -0.02, 0),
      new THREE.Vector3(0, 0.06, 0.02),
      new THREE.Vector3(0.13, -0.02, 0)
    );
    const closedEyeGeom = new THREE.TubeGeometry(closedCurve, 12, 0.026, 8, false);
    const closedEyeMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.5 });

    // Left Eye
    this.leftEye = new THREE.Group();
    this.leftSclera = new THREE.Mesh(eyeGeom, eyeMat);
    this.leftPupil = new THREE.Mesh(pupilGeom, pupilMat);
    this.leftPupil.position.set(0, 0, 0.08);

    // Eye shine reflection dot
    const shineGeom = new THREE.SphereGeometry(0.032, 12, 12);
    const shineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const leftShine = new THREE.Mesh(shineGeom, shineMat);
    leftShine.position.set(0.032, 0.032, 0.045);
    this.leftPupil.add(leftShine);

    this.leftClosedEye = new THREE.Mesh(closedEyeGeom, closedEyeMat);
    this.leftClosedEye.position.set(0, 0, 0.04);
    this.leftClosedEye.visible = false;

    // Heart Pupil for Loving Expression (left)
    const heartEyeShape = createHeartShape(0.42);
    const heartEyeGeom = new THREE.ExtrudeGeometry(heartEyeShape, {
      depth: 0.02,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.008,
      bevelThickness: 0.008,
    });
    const heartEyeMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      roughness: 0.15,
      metalness: 0.1,
    });
    const heartShineGeom = new THREE.SphereGeometry(0.024, 10, 10);
    const heartShineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    this.leftHeartPupil = new THREE.Group();
    const leftHeartMesh = new THREE.Mesh(heartEyeGeom, heartEyeMat);
    this.leftHeartPupil.add(leftHeartMesh);
    const leftHeartShine = new THREE.Mesh(heartShineGeom, heartShineMat);
    leftHeartShine.position.set(0.035, 0.035, 0.03);
    this.leftHeartPupil.add(leftHeartShine);
    this.leftHeartPupil.position.set(0, 0, 0.08);
    this.leftHeartPupil.visible = false;

    this.leftEye.add(this.leftSclera);
    this.leftEye.add(this.leftPupil);
    this.leftEye.add(this.leftHeartPupil);
    this.leftEye.add(this.leftClosedEye);
    // Recessed slightly so eye sits flush on the vegetable body
    this.leftEye.position.set(-0.35, 0.15, 0.04);
    this.faceGroup.add(this.leftEye);

    // Right Eye
    this.rightEye = new THREE.Group();
    this.rightSclera = new THREE.Mesh(eyeGeom, eyeMat);
    this.rightPupil = new THREE.Mesh(pupilGeom, pupilMat);
    this.rightPupil.position.set(0, 0, 0.08);

    const rightShine = new THREE.Mesh(shineGeom, shineMat);
    rightShine.position.set(0.032, 0.032, 0.045);
    this.rightPupil.add(rightShine);

    this.rightClosedEye = new THREE.Mesh(closedEyeGeom.clone(), closedEyeMat);
    this.rightClosedEye.position.set(0, 0, 0.04);
    this.rightClosedEye.visible = false;

    // Heart Pupil for Loving Expression (right)
    this.rightHeartPupil = new THREE.Group();
    const rightHeartMesh = new THREE.Mesh(heartEyeGeom.clone(), heartEyeMat);
    this.rightHeartPupil.add(rightHeartMesh);
    const rightHeartShine = new THREE.Mesh(heartShineGeom, heartShineMat);
    rightHeartShine.position.set(0.035, 0.035, 0.03);
    this.rightHeartPupil.add(rightHeartShine);
    this.rightHeartPupil.position.set(0, 0, 0.08);
    this.rightHeartPupil.visible = false;

    this.rightEye.add(this.rightSclera);
    this.rightEye.add(this.rightPupil);
    this.rightEye.add(this.rightHeartPupil);
    this.rightEye.add(this.rightClosedEye);
    // Recessed slightly so eye sits flush on the vegetable body
    this.rightEye.position.set(0.35, 0.15, 0.04);
    this.faceGroup.add(this.rightEye);

    // Eyebrows
    this.eyebrowsGroup = new THREE.Group();
    const browGeom = new THREE.CylinderGeometry(0.032, 0.032, 0.22, 12);
    browGeom.rotateZ(Math.PI / 2);
    const browMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.5 });
    
    this.leftEyebrow = new THREE.Mesh(browGeom, browMat);
    this.leftEyebrow.position.set(-0.35, 0.40, 0.04);
    this.eyebrowsGroup.add(this.leftEyebrow);

    this.rightEyebrow = new THREE.Mesh(browGeom.clone(), browMat);
    this.rightEyebrow.position.set(0.35, 0.40, 0.04);
    this.eyebrowsGroup.add(this.rightEyebrow);

    this.faceGroup.add(this.eyebrowsGroup);

    // Cheeks
    const cheekGeom = new THREE.SphereGeometry(0.11, 16, 16);
    cheekGeom.scale(1, 0.6, 0.25);
    const cheekMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      roughness: 0.6,
      transparent: true,
      opacity: 0.85,
    });
    this.leftCheek = new THREE.Mesh(cheekGeom, cheekMat);
    this.leftCheek.position.set(-0.52, -0.04, 0.06);
    this.faceGroup.add(this.leftCheek);

    this.rightCheek = new THREE.Mesh(cheekGeom.clone(), cheekMat);
    this.rightCheek.position.set(0.52, -0.04, 0.06);
    this.faceGroup.add(this.rightCheek);

    // Cute Cheek Heart stamps for Loving expression
    const cheekHeartShape = createHeartShape(0.18);
    const cheekHeartGeom = new THREE.ShapeGeometry(cheekHeartShape);
    const cheekHeartMat = new THREE.MeshBasicMaterial({
      color: 0xfff1f2,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
    });

    this.leftCheekHeart = new THREE.Mesh(cheekHeartGeom, cheekHeartMat);
    this.leftCheekHeart.position.set(0, 0, 0.08);
    this.leftCheekHeart.visible = false;
    this.leftCheek.add(this.leftCheekHeart);

    this.rightCheekHeart = new THREE.Mesh(cheekHeartGeom.clone(), cheekHeartMat);
    this.rightCheekHeart.position.set(0, 0, 0.08);
    this.rightCheekHeart.visible = false;
    this.rightCheek.add(this.rightCheekHeart);

    // Floating Love Halo Hearts for Loving expression
    this.loveHeartsGroup = new THREE.Group();
    this.loveHeartsGroup.visible = false;
    this.faceGroup.add(this.loveHeartsGroup);

    const haloColors = [0xf43f5e, 0xfb7185, 0xff69b4, 0xf472b6];
    const haloConfigs = [
      { x: -0.48, y: 0.58, z: 0.16, scale: 0.26, speed: 2.8, phase: 0, rotSpeed: 1.5 },
      { x: 0.46, y: 0.65, z: 0.14, scale: 0.30, speed: 2.4, phase: 1.6, rotSpeed: -1.2 },
      { x: -0.62, y: 0.22, z: 0.12, scale: 0.20, speed: 3.1, phase: 2.8, rotSpeed: 1.8 },
      { x: 0.60, y: 0.26, z: 0.12, scale: 0.22, speed: 2.6, phase: 4.2, rotSpeed: -1.4 },
    ];

    haloConfigs.forEach((cfg, idx) => {
      const hShape = createHeartShape(cfg.scale);
      const hGeom = new THREE.ExtrudeGeometry(hShape, {
        depth: 0.024,
        bevelEnabled: true,
        bevelSegments: 2,
        steps: 1,
        bevelSize: 0.008,
        bevelThickness: 0.008,
      });
      const hMat = new THREE.MeshStandardMaterial({
        color: haloColors[idx % haloColors.length],
        roughness: 0.2,
        metalness: 0.15,
      });
      const hMesh = new THREE.Mesh(hGeom, hMat);
      hMesh.position.set(cfg.x, cfg.y, cfg.z);
      hMesh.userData = {
        baseX: cfg.x,
        baseY: cfg.y,
        baseZ: cfg.z,
        baseScale: 1.0,
        speed: cfg.speed,
        phase: cfg.phase,
        rotSpeed: cfg.rotSpeed,
      };
      this.floatingHearts.push(hMesh);
      this.loveHeartsGroup.add(hMesh);
    });

    // Mouth Group
    this.mouthGroup = new THREE.Group();
    this.mouthGroup.position.set(0, -0.16, 0.08);
    this.faceGroup.add(this.mouthGroup);
    this.updateMouthMesh('happy');

    // Face Accessories Group (Glasses, Bowtie - directly attached to face!)
    this.faceAccessoryGroup = new THREE.Group();
    this.faceGroup.add(this.faceAccessoryGroup);

    // Topper Group (Leaves / Calyx / Florets)
    this.topperGroup = new THREE.Group();
    this.group.add(this.topperGroup);

    // Head Accessories Group (Hats, Crown, Flower, Sprout)
    this.accessoryGroup = new THREE.Group();
    this.group.add(this.accessoryGroup);

    // Initial build
    this.applyVeggieType('carrot');
  }

  /**
   * Rebuild or style mouth based on expression
   */
  private updateMouthMesh(expr: ExpressionType) {
    if (this.mouthMesh) {
      this.mouthGroup.remove(this.mouthMesh);
      this.mouthMesh.traverse((child) => {
        if ((child as THREE.Mesh).geometry) {
          (child as THREE.Mesh).geometry.dispose();
        }
      });
      this.mouthMesh = null;
    }

    const mouthMat = new THREE.MeshStandardMaterial({
      color: 0x881337,
      roughness: 0.3,
    });

    if (expr === 'happy') {
      // Classic wide, bright smile curve
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-0.16, 0.05, 0),
        new THREE.Vector3(0, -0.12, 0.02),
        new THREE.Vector3(0.16, 0.05, 0)
      );
      const geom = new THREE.TubeGeometry(curve, 16, 0.04, 8, false);
      this.mouthMesh = new THREE.Mesh(geom, mouthMat);
    } else if (expr === 'love') {
      // Adorable sweet cupid's bow / kissy pout smile uniquely for the Loving mood!
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.14, 0.038, 0),
        new THREE.Vector3(-0.065, -0.042, 0.015),
        new THREE.Vector3(0, -0.012, 0.024), // sweet cupid-bow peak in center
        new THREE.Vector3(0.065, -0.042, 0.015),
        new THREE.Vector3(0.14, 0.038, 0),
      ]);
      const geom = new THREE.TubeGeometry(curve, 20, 0.036, 8, false);
      this.mouthMesh = new THREE.Mesh(geom, mouthMat);

      // Sweet blushing heart tongue peeking out with love!
      const tongueShape = createHeartShape(0.24);
      const tongueGeom = new THREE.ExtrudeGeometry(tongueShape, {
        depth: 0.02,
        bevelEnabled: true,
        bevelSegments: 2,
        steps: 1,
        bevelSize: 0.006,
        bevelThickness: 0.006,
      });
      const tongueMat = new THREE.MeshStandardMaterial({
        color: 0xfb7185,
        roughness: 0.25,
      });
      const tongue = new THREE.Mesh(tongueGeom, tongueMat);
      tongue.position.set(0, -0.045, 0.022);
      this.mouthMesh.add(tongue);
    } else if (expr === 'surprised') {
      // O-shaped mouth
      const geom = new THREE.TorusGeometry(0.1, 0.038, 12, 24);
      this.mouthMesh = new THREE.Mesh(geom, mouthMat);
    } else if (expr === 'cheeky') {
      // Smirk curve + little pink tongue!
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-0.14, -0.02, 0),
        new THREE.Vector3(0, -0.06, 0.02),
        new THREE.Vector3(0.16, 0.08, 0)
      );
      const geom = new THREE.TubeGeometry(curve, 16, 0.038, 8, false);
      this.mouthMesh = new THREE.Mesh(geom, mouthMat);

      // Cute tongue
      const tongueGeom = new THREE.SphereGeometry(0.07, 16, 16);
      tongueGeom.scale(1, 0.7, 0.8);
      const tongueMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.3 });
      const tongue = new THREE.Mesh(tongueGeom, tongueMat);
      tongue.position.set(0.04, -0.07, 0.04);
      this.mouthMesh.add(tongue);
    } else if (expr === 'sleepy') {
      // Relaxed small dash
      const curve = new THREE.LineCurve3(
        new THREE.Vector3(-0.1, -0.02, 0),
        new THREE.Vector3(0.1, -0.02, 0)
      );
      const geom = new THREE.TubeGeometry(curve, 8, 0.03, 8, false);
      this.mouthMesh = new THREE.Mesh(geom, mouthMat);
    } else if (expr === 'dizzy') {
      // Wavy squiggle
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.16, 0.03, 0),
        new THREE.Vector3(-0.06, -0.04, 0),
        new THREE.Vector3(0.06, 0.04, 0),
        new THREE.Vector3(0.16, -0.03, 0),
      ]);
      const geom = new THREE.TubeGeometry(curve, 20, 0.035, 8, false);
      this.mouthMesh = new THREE.Mesh(geom, mouthMat);
    }

    if (this.mouthMesh) {
      this.mouthGroup.add(this.mouthMesh);
    }
  }

  /**
   * Set facial expression
   */
  public setExpression(expr: ExpressionType) {
    this.currentExpression = expr;
    this.updateMouthMesh(expr);

    // Sleepy mood: completely close eyes with sweet curved closed lids
    if (expr === 'sleepy') {
      this.leftSclera.visible = false;
      this.rightSclera.visible = false;
      this.leftPupil.visible = false;
      this.rightPupil.visible = false;
      this.leftHeartPupil.visible = false;
      this.rightHeartPupil.visible = false;
      this.leftClosedEye.visible = true;
      this.rightClosedEye.visible = true;
      this.leftEye.scale.set(1, 1, 1);
      this.rightEye.scale.set(1, 1, 1);
      this.leftCheekHeart.visible = false;
      this.rightCheekHeart.visible = false;
      this.loveHeartsGroup.visible = false;
    } else if (expr === 'love') {
      // Loving mood: ruby heart-shaped pupils, blushing cheek hearts, floating halo hearts!
      this.leftSclera.visible = true;
      this.rightSclera.visible = true;
      this.leftPupil.visible = false;
      this.rightPupil.visible = false;
      this.leftHeartPupil.visible = true;
      this.rightHeartPupil.visible = true;
      this.leftClosedEye.visible = false;
      this.rightClosedEye.visible = false;
      this.leftEye.scale.set(1, 1, 1);
      this.rightEye.scale.set(1, 1, 1);
      this.leftCheekHeart.visible = true;
      this.rightCheekHeart.visible = true;
      this.loveHeartsGroup.visible = true;
    } else {
      this.leftSclera.visible = true;
      this.rightSclera.visible = true;
      this.leftPupil.visible = true;
      this.rightPupil.visible = true;
      this.leftHeartPupil.visible = false;
      this.rightHeartPupil.visible = false;
      this.leftClosedEye.visible = false;
      this.rightClosedEye.visible = false;
      this.leftEye.scale.set(1, 1, 1);
      this.rightEye.scale.set(1, 1, 1);
      this.leftCheekHeart.visible = false;
      this.rightCheekHeart.visible = false;
      this.loveHeartsGroup.visible = false;
    }

    // Eyebrow tilts
    if (expr === 'surprised') {
      this.leftEyebrow.position.y = 0.48;
      this.rightEyebrow.position.y = 0.48;
      this.leftEyebrow.rotation.z = -0.2;
      this.rightEyebrow.rotation.z = 0.2;
    } else if (expr === 'cheeky') {
      this.leftEyebrow.position.y = 0.46;
      this.rightEyebrow.position.y = 0.39;
      this.leftEyebrow.rotation.z = 0.25;
      this.rightEyebrow.rotation.z = -0.1;
    } else if (expr === 'sleepy') {
      this.leftEyebrow.position.y = 0.34;
      this.rightEyebrow.position.y = 0.34;
      this.leftEyebrow.rotation.z = 0.12;
      this.rightEyebrow.rotation.z = -0.12;
    } else if (expr === 'dizzy') {
      this.leftEyebrow.position.y = 0.44;
      this.rightEyebrow.position.y = 0.38;
      this.leftEyebrow.rotation.z = -0.3;
      this.rightEyebrow.rotation.z = 0.3;
    } else if (expr === 'love') {
      // Tender, affectionate, loving upward-inner tilt
      this.leftEyebrow.position.y = 0.42;
      this.rightEyebrow.position.y = 0.42;
      this.leftEyebrow.rotation.z = -0.16;
      this.rightEyebrow.rotation.z = 0.16;
    } else {
      this.leftEyebrow.position.y = 0.40;
      this.rightEyebrow.position.y = 0.40;
      this.leftEyebrow.rotation.z = 0;
      this.rightEyebrow.rotation.z = 0;
    }

    // Cheeks blushing intensity
    if (expr === 'love') {
      this.leftCheek.scale.set(1.35, 0.85, 0.32);
      this.rightCheek.scale.set(1.35, 0.85, 0.32);
      (this.leftCheek.material as THREE.MeshStandardMaterial).opacity = 0.95;
      (this.rightCheek.material as THREE.MeshStandardMaterial).opacity = 0.95;
    } else {
      this.leftCheek.scale.set(1.0, 0.6, 0.25);
      this.rightCheek.scale.set(1.0, 0.6, 0.25);
      (this.leftCheek.material as THREE.MeshStandardMaterial).opacity = 0.85;
      (this.rightCheek.material as THREE.MeshStandardMaterial).opacity = 0.85;
    }
  }

  public getExpression(): ExpressionType {
    return this.currentExpression;
  }

  /**
   * Apply Vegetable Type & Build specific toppers (carrot greens, tomato sepals, broccoli florets, avocado pit)
   */
  public applyVeggieType(type: VeggieType) {
    this.currentType = type;

    // Clear toppers
    while (this.topperGroup.children.length > 0) {
      const child = this.topperGroup.children[0];
      this.topperGroup.remove(child);
    }
    if (this.avocadoPit) {
      this.group.remove(this.avocadoPit);
      this.avocadoPit = null;
    }
    if (this.cornHuskGroup) {
      this.group.remove(this.cornHuskGroup);
      this.cornHuskGroup = null;
    }
    this.eggplantStem = null;

    const leafMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      roughness: 0.4,
      metalness: 0.05,
    });

    if (type === 'carrot') {
      // Sprouting carrot greens centered at head level
      for (let i = 0; i < 7; i++) {
        const angle = (i / 7) * Math.PI * 2;
        const leafCurve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(Math.cos(angle) * 0.35, 0.65, Math.sin(angle) * 0.35),
          new THREE.Vector3(Math.cos(angle) * 0.7, 1.1 + (i % 2) * 0.25, Math.sin(angle) * 0.7)
        );
        const leafGeom = new THREE.TubeGeometry(leafCurve, 16, 0.048 - (i % 3) * 0.01, 8, false);
        const leaf = new THREE.Mesh(leafGeom, leafMat);
        this.topperGroup.add(leaf);
      }
    } else if (type === 'tomato') {
      // 5-point calyx star resting directly on tomato head surface (y ~ 0)
      const stemGeom = new THREE.CylinderGeometry(0.045, 0.055, 0.32, 8);
      stemGeom.translate(0, 0.16, 0);
      const stem = new THREE.Mesh(stemGeom, leafMat);
      stem.position.set(0, 0.02, 0);
      stem.rotation.z = 0.22;
      this.topperGroup.add(stem);

      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const sepalGeom = new THREE.ConeGeometry(0.12, 0.45, 6);
        sepalGeom.rotateX(Math.PI / 2.3);
        const sepal = new THREE.Mesh(sepalGeom, leafMat);
        sepal.position.set(Math.cos(angle) * 0.18, 0.03, Math.sin(angle) * 0.18);
        sepal.rotation.y = -angle;
        this.topperGroup.add(sepal);
      }
    } else if (type === 'avocado') {
      // Brown shiny pit snugly nested inside the avocado belly cavity
      const pitGeom = new THREE.SphereGeometry(0.28, 24, 24);
      pitGeom.scale(1, 1.1, 0.45);
      const pitMat = new THREE.MeshStandardMaterial({
        color: 0x3e1703,
        roughness: 0.22,
        metalness: 0.15,
      });
      this.avocadoPit = new THREE.Mesh(pitGeom, pitMat);
      this.group.add(this.avocadoPit);
    } else if (type === 'eggplant') {
      // Authentic botanical aubergine (eggplant) calyx & stem:
      // Real aubergines feature a rich green calyx mantle with 6 distinct pointed sepals
      // that clasp DOWNWARDS over the rounded purple shoulders of the eggplant,
      // plus a curved fleshy green stem at the apex.
      const aubergineMat = new THREE.MeshStandardMaterial({
        color: 0x15803d, // Rich botanical forest green
        roughness: 0.38,
        metalness: 0.08,
      });

      const eggplantCalyxGroup = new THREE.Group();

      // Flush calyx collar disc sitting right at the head apex
      const collarGeom = new THREE.CylinderGeometry(0.56, 0.62, 0.06, 24);
      const collar = new THREE.Mesh(collarGeom, aubergineMat);
      collar.position.set(0, -0.01, 0);
      eggplantCalyxGroup.add(collar);

      // Rounded calyx dome cap
      const domeCapGeom = new THREE.SphereGeometry(0.58, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2.4);
      const domeCap = new THREE.Mesh(domeCapGeom, aubergineMat);
      domeCap.position.set(0, -0.02, 0);
      eggplantCalyxGroup.add(domeCap);

      // 6 realistic downward-clasping pointed sepals hugging the purple shoulders
      for (let i = 0; i < 6; i++) {
        const sepalAngle = (i / 6) * Math.PI * 2 + 0.15;
        const sepalGroup = new THREE.Group();

        // Organic lanceolate pointed sepal shape
        const sepalShape = new THREE.Shape();
        sepalShape.moveTo(-0.16, 0);
        sepalShape.quadraticCurveTo(-0.18, -0.16, -0.09, -0.32);
        sepalShape.lineTo(0, -0.48); // sharp botanical tip extending down the purple skin
        sepalShape.lineTo(0.09, -0.32);
        sepalShape.quadraticCurveTo(0.18, -0.16, 0.16, 0);
        sepalShape.closePath();

        const sepalExtrudeOpts = {
          depth: 0.025,
          bevelEnabled: true,
          bevelSegments: 2,
          steps: 1,
          bevelSize: 0.008,
          bevelThickness: 0.008,
        };
        const sepalGeom = new THREE.ExtrudeGeometry(sepalShape, sepalExtrudeOpts);
        sepalGeom.center();

        const sepalMesh = new THREE.Mesh(sepalGeom, aubergineMat);
        // Curve downward along the contour of the eggplant skin
        sepalMesh.position.set(0, -0.22, 0.02);
        sepalMesh.rotation.x = -0.34; // hug downward against the body

        sepalGroup.position.set(Math.cos(sepalAngle) * 0.48, -0.02, Math.sin(sepalAngle) * 0.48);
        sepalGroup.rotation.y = -sepalAngle + Math.PI / 2;
        sepalGroup.add(sepalMesh);
        eggplantCalyxGroup.add(sepalGroup);
      }

      // Thick, fleshy curved green stem (pedicel)
      const stemCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(0, 0.01, 0),
        new THREE.Vector3(0.06, 0.22, 0.02),
        new THREE.Vector3(0.16, 0.42, 0.05)
      );
      const stemGeom = new THREE.TubeGeometry(stemCurve, 16, 0.075, 10, false);
      const stem = new THREE.Mesh(stemGeom, aubergineMat);
      this.eggplantStem = stem;
      eggplantCalyxGroup.add(stem);

      this.topperGroup.add(eggplantCalyxGroup);
    } else if (type === 'broccoli') {
      // Fluffy cloud of florets canopy sitting clean atop head without touching eyes
      this.broccoliFlorets = new THREE.Group();
      const floretGeom = new THREE.DodecahedronGeometry(0.42, 1);
      const floretMat = new THREE.MeshStandardMaterial({
        color: 0x14532d,
        roughness: 0.85,
        flatShading: true,
      });
      for (let i = 0; i < 14; i++) {
        const floret = new THREE.Mesh(floretGeom, floretMat);
        const theta = (i / 14) * Math.PI * 2;
        const radius = 0.52 + Math.sin(i * 3) * 0.14;
        const y = 0.15 + Math.cos(i * 2) * 0.14;
        floret.position.set(Math.cos(theta) * radius, y, Math.sin(theta) * radius);
        floret.scale.setScalar(0.72 + (i % 3) * 0.18);
        this.broccoliFlorets.add(floret);
      }
      // Center top floret
      const centerFloret = new THREE.Mesh(floretGeom, floretMat);
      centerFloret.position.set(0, 0.46, 0);
      centerFloret.scale.setScalar(1.15);
      this.broccoliFlorets.add(centerFloret);

      this.topperGroup.add(this.broccoliFlorets);
    } else if (type === 'sweetcorn') {
      // Green leaves DOWN at base wrapping up along sides, opening in front to show cob!
      this.cornHuskGroup = new THREE.Group();
      const huskMat = new THREE.MeshStandardMaterial({
        color: 0x65a30d,
        roughness: 0.45,
        side: THREE.DoubleSide,
      });

      // 5 layered broad curved husk leaves emerging from the bottom
      const leafCount = 5;
      for (let i = 0; i < leafCount; i++) {
        const angle = (i / leafCount) * Math.PI * 2;
        // Keep front open so face is completely unobstructed!
        const isFront = Math.abs(angle - Math.PI / 2) < 0.6;
        const spreadY = isFront ? 0.9 : 1.45;
        const spreadRadius = isFront ? 1.05 : 0.92;

        const huskCurve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(Math.cos(angle) * 0.55, 0.05, Math.sin(angle) * 0.55),
          new THREE.Vector3(Math.cos(angle) * (spreadRadius * 1.08), spreadY * 0.5, Math.sin(angle) * (spreadRadius * 1.08)),
          new THREE.Vector3(Math.cos(angle) * spreadRadius, spreadY, Math.sin(angle) * spreadRadius)
        );
        const huskGeom = new THREE.TubeGeometry(huskCurve, 16, 0.12 - (i % 2) * 0.02, 8, false);
        const husk = new THREE.Mesh(huskGeom, huskMat);
        this.cornHuskGroup.add(husk);
      }
      this.group.add(this.cornHuskGroup);

      // Fine golden silk tuft at the top
      const silkMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3 });
      for (let i = 0; i < 6; i++) {
        const silkCurve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3((Math.random() - 0.5) * 0.25, 0.18, (Math.random() - 0.5) * 0.25),
          new THREE.Vector3((Math.random() - 0.5) * 0.4, 0.32, (Math.random() - 0.5) * 0.4)
        );
        const silkGeom = new THREE.TubeGeometry(silkCurve, 8, 0.015, 6, false);
        const silk = new THREE.Mesh(silkGeom, silkMat);
        this.topperGroup.add(silk);
      }
    } else if (type === 'pumpkin') {
      // Ribbed stout pumpkin stem + curly green vine tendril
      const stemMat = new THREE.MeshStandardMaterial({ color: 0x365314, roughness: 0.6 });
      const stemGeom = new THREE.CylinderGeometry(0.09, 0.13, 0.38, 8);
      stemGeom.translate(0, 0.19, 0);
      const stem = new THREE.Mesh(stemGeom, stemMat);
      stem.position.set(0, 0.02, 0);
      stem.rotation.z = 0.15;
      this.topperGroup.add(stem);

      // Curly vine spiral
      const vineCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.04, 0.08, 0),
        new THREE.Vector3(0.18, 0.18, 0.1),
        new THREE.Vector3(0.32, 0.14, -0.05),
        new THREE.Vector3(0.42, 0.28, 0.12),
        new THREE.Vector3(0.35, 0.36, -0.08),
      ]);
      const vineGeom = new THREE.TubeGeometry(vineCurve, 20, 0.03, 6, false);
      const vine = new THREE.Mesh(vineGeom, leafMat);
      this.topperGroup.add(vine);
    } else if (type === 'chili') {
      // Star calyx + sharp curving stem tip
      const chiliCalyxGeom = new THREE.ConeGeometry(0.35, 0.25, 6);
      chiliCalyxGeom.rotateX(Math.PI);
      const calyx = new THREE.Mesh(chiliCalyxGeom, leafMat);
      calyx.position.set(0, 0.08, 0);
      this.topperGroup.add(calyx);

      const stemCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(0, 0.15, 0),
        new THREE.Vector3(0.08, 0.42, 0.04),
        new THREE.Vector3(0.24, 0.58, 0.12)
      );
      const stemGeom = new THREE.TubeGeometry(stemCurve, 12, 0.04, 8, false);
      const stem = new THREE.Mesh(stemGeom, leafMat);
      this.topperGroup.add(stem);
    } else if (type === 'mushroom') {
      // Velvety domed mushroom cap with white speckled dots atop the stalk
      const capGroup = new THREE.Group();
      const capMat = new THREE.MeshStandardMaterial({
        color: 0xd97706,
        roughness: 0.35,
      });
      const capGeom = new THREE.SphereGeometry(1.05, 24, 18, 0, Math.PI * 2, 0, Math.PI / 2.1);
      const cap = new THREE.Mesh(capGeom, capMat);
      cap.position.set(0, 0.02, 0);
      capGroup.add(cap);

      // White spots on cap
      const spotMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
      const spotPositions = [
        [0, 0.95, 0],
        [0.45, 0.72, 0.35],
        [-0.5, 0.68, 0.3],
        [0.55, 0.62, -0.4],
        [-0.45, 0.75, -0.42],
        [0.72, 0.42, 0.05],
        [-0.75, 0.4, 0.02],
      ];
      spotPositions.forEach(([x, y, z]) => {
        const spotGeom = new THREE.SphereGeometry(0.12, 10, 10);
        spotGeom.scale(1, 0.3, 1);
        const spot = new THREE.Mesh(spotGeom, spotMat);
        spot.position.set(x, y, z);
        capGroup.add(spot);
      });

      this.topperGroup.add(capGroup);
    } else if (type === 'garlic') {
      // Papery sprout shoot at top
      const sproutCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(0, 0.02, 0),
        new THREE.Vector3(0.04, 0.28, 0.02),
        new THREE.Vector3(0.12, 0.48, 0.05)
      );
      const sproutGeom = new THREE.TubeGeometry(sproutCurve, 12, 0.045, 8, false);
      const sprout = new THREE.Mesh(sproutGeom, leafMat);
      this.topperGroup.add(sprout);
    } else if (type === 'onion') {
      // Fountain of scallion green shoots
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const shootCurve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(Math.cos(angle) * 0.1, 0.05, Math.sin(angle) * 0.1),
          new THREE.Vector3(Math.cos(angle) * 0.25, 0.55, Math.sin(angle) * 0.25),
          new THREE.Vector3(Math.cos(angle) * 0.45, 1.05 + (i % 2) * 0.2, Math.sin(angle) * 0.45)
        );
        const shootGeom = new THREE.TubeGeometry(shootCurve, 12, 0.045, 8, false);
        const shoot = new THREE.Mesh(shootGeom, leafMat);
        this.topperGroup.add(shoot);
      }
    }

    this.rebuildMeshGeometry();
  }

  /**
   * Set Accessory (hats, glasses, crown, etc.) - backward compatible
   */
  public setAccessory(acc: AccessoryType) {
    if (acc === 'none') {
      this.setAccessories([]);
    } else {
      this.setAccessories([acc]);
    }
  }

  /**
   * Set multiple accessories simultaneously (multi-wardrobe dress up!)
   */
  public setAccessories(accs: AccessoryType[]) {
    this.activeAccessories.clear();
    if (this.headphonesGroup) {
      this.group.remove(this.headphonesGroup);
      this.headphonesGroup = null;
      this.leftEarCup = null;
      this.rightEarCup = null;
      if (this.headbandMesh) {
        this.headbandMesh.geometry.dispose();
        this.headbandMesh = null;
      }
      if (this.headbandPadMesh) {
        this.headbandPadMesh.geometry.dispose();
        this.headbandPadMesh = null;
      }
    }
    this.flowerGroup = null;
    while (this.accessoryGroup.children.length > 0) {
      this.accessoryGroup.remove(this.accessoryGroup.children[0]);
    }
    while (this.faceAccessoryGroup.children.length > 0) {
      this.faceAccessoryGroup.remove(this.faceAccessoryGroup.children[0]);
    }

    accs.forEach((acc) => {
      if (acc && acc !== 'none') {
        this.activeAccessories.add(acc);
        this.buildSingleAccessory(acc);
      }
    });

    const hasHeadCoveringHat =
      this.activeAccessories.has('tophat') ||
      this.activeAccessories.has('chef') ||
      this.activeAccessories.has('beanie') ||
      this.activeAccessories.has('wizard') ||
      this.activeAccessories.has('partyhat') ||
      this.activeAccessories.has('crown');

    if (this.eggplantStem) {
      this.eggplantStem.visible = !hasHeadCoveringHat;
    }

    this.currentAccessory = accs.length > 0 ? accs[accs.length - 1] : 'none';
    this.rebuildMeshGeometry();
  }

  /**
   * Toggle an accessory on or off
   */
  public toggleAccessory(acc: AccessoryType) {
    if (acc === 'none') {
      this.setAccessories([]);
      return;
    }
    const current = new Set(this.activeAccessories);
    if (current.has(acc)) {
      current.delete(acc);
    } else {
      current.add(acc);
    }
    this.setAccessories(Array.from(current));
  }

  public getAccessories(): AccessoryType[] {
    return Array.from(this.activeAccessories);
  }

  /**
   * Build an individual accessory mesh and attach it to appropriate anchor group
   */
  private buildSingleAccessory(acc: AccessoryType) {
    if (acc === 'chef') {
      // Puffy Chef Hat - sits right flush on top of head with zero gap
      const hatGroup = new THREE.Group();
      const bandGeom = new THREE.CylinderGeometry(0.72, 0.72, 0.28, 24);
      const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35 });
      const band = new THREE.Mesh(bandGeom, whiteMat);
      band.position.set(0, 0.14, 0);
      hatGroup.add(band);

      // Puffy mushroom cloud top
      const puffGeom = new THREE.SphereGeometry(0.92, 24, 20);
      puffGeom.scale(1, 0.85, 1);
      const puff = new THREE.Mesh(puffGeom, whiteMat);
      puff.position.set(0, 0.58, 0);
      hatGroup.add(puff);

      hatGroup.position.set(0, 0, 0);
      this.accessoryGroup.add(hatGroup);
    } else if (acc === 'sunglasses') {
      // Sleek, oversized dark sunglasses completely covering the eyes!
      const shadesGroup = new THREE.Group();

      const frameMat = new THREE.MeshStandardMaterial({
        color: 0x09090b,
        roughness: 0.15,
        metalness: 0.35,
      });

      const lensMat = new THREE.MeshStandardMaterial({
        color: 0x111827,
        roughness: 0.04,
        metalness: 0.88,
        transparent: true,
        opacity: 0.98,
      });

      // Eyes are at x = ±0.35, y = 0.15, diameter = 0.36, pupil/shine reaches z = 0.165
      // Lens size: width 0.50, height 0.44, depth 0.06
      // Positioned at z = 0.145 -> front face is at z = 0.175, fully covering eyes with no clipping!
      const lensGeom = new THREE.BoxGeometry(0.50, 0.44, 0.06);

      const leftLens = new THREE.Mesh(lensGeom, lensMat);
      leftLens.position.set(-0.35, 0.15, 0.145);
      shadesGroup.add(leftLens);

      const rightLens = new THREE.Mesh(lensGeom.clone(), lensMat);
      rightLens.position.set(0.35, 0.15, 0.145);
      shadesGroup.add(rightLens);

      // Premium chunky outer frames
      const rimGeom = new THREE.BoxGeometry(0.54, 0.48, 0.05);
      const leftRim = new THREE.Mesh(rimGeom, frameMat);
      leftRim.position.set(-0.35, 0.15, 0.135);
      shadesGroup.add(leftRim);

      const rightRim = new THREE.Mesh(rimGeom.clone(), frameMat);
      rightRim.position.set(0.35, 0.15, 0.135);
      shadesGroup.add(rightRim);

      // Browline top bridge connecting the full width
      const browGeom = new THREE.BoxGeometry(1.16, 0.075, 0.055);
      const browBar = new THREE.Mesh(browGeom, frameMat);
      browBar.position.set(0, 0.37, 0.145);
      shadesGroup.add(browBar);

      // Center nose bridge
      const bridgeGeom = new THREE.BoxGeometry(0.24, 0.06, 0.055);
      const bridge = new THREE.Mesh(bridgeGeom, frameMat);
      bridge.position.set(0, 0.16, 0.145);
      shadesGroup.add(bridge);

      // Wrap-around temple arms along the sides
      const templeGeom = new THREE.BoxGeometry(0.045, 0.05, 0.55);
      const leftTemple = new THREE.Mesh(templeGeom, frameMat);
      leftTemple.position.set(-0.62, 0.16, -0.12);
      shadesGroup.add(leftTemple);

      const rightTemple = new THREE.Mesh(templeGeom.clone(), frameMat);
      rightTemple.position.set(0.62, 0.16, -0.12);
      shadesGroup.add(rightTemple);

      this.faceAccessoryGroup.add(shadesGroup);
    } else if (acc === 'crown') {
      // Golden Royal Crown - sits flush right on top of head with zero gap
      const crownGroup = new THREE.Group();
      const goldMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        roughness: 0.18,
        metalness: 0.85,
      });

      const crownBase = new THREE.CylinderGeometry(0.68, 0.58, 0.18, 24, 1, true);
      const baseMesh = new THREE.Mesh(crownBase, goldMat);
      baseMesh.position.set(0, 0.09, 0);
      crownGroup.add(baseMesh);

      // 5 Crown Spikes
      for (let i = 0; i < 5; i++) {
        const spikeAngle = (i / 5) * Math.PI * 2;
        const spikeGeom = new THREE.ConeGeometry(0.12, 0.32, 4);
        const spike = new THREE.Mesh(spikeGeom, goldMat);
        spike.position.set(Math.cos(spikeAngle) * 0.62, 0.32, Math.sin(spikeAngle) * 0.62);
        crownGroup.add(spike);

        // Gem tips (Ruby & Sapphire)
        const gemGeom = new THREE.SphereGeometry(0.042, 10, 10);
        const gemMat = new THREE.MeshStandardMaterial({
          color: i % 2 === 0 ? 0xef4444 : 0x06b6d4,
          roughness: 0.1,
          metalness: 0.6,
        });
        const gem = new THREE.Mesh(gemGeom, gemMat);
        gem.position.set(Math.cos(spikeAngle) * 0.62, 0.48, Math.sin(spikeAngle) * 0.62);
        crownGroup.add(gem);
      }

      crownGroup.position.set(0, 0, 0);
      this.accessoryGroup.add(crownGroup);
    } else if (acc === 'tophat') {
      // Dapper Top Hat - sits flush right on head/calyx with zero gap
      const hatGroup = new THREE.Group();
      const blackMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.4 });
      const ribbonMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3 });

      const brimGeom = new THREE.CylinderGeometry(0.92, 0.92, 0.05, 24);
      const brim = new THREE.Mesh(brimGeom, blackMat);
      brim.position.set(0, 0.025, 0);
      hatGroup.add(brim);

      const topGeom = new THREE.CylinderGeometry(0.58, 0.58, 0.65, 24);
      const top = new THREE.Mesh(topGeom, blackMat);
      top.position.set(0, 0.375, 0);
      hatGroup.add(top);

      const ribbonGeom = new THREE.CylinderGeometry(0.59, 0.59, 0.14, 24);
      const ribbon = new THREE.Mesh(ribbonGeom, ribbonMat);
      ribbon.position.set(0, 0.12, 0);
      hatGroup.add(ribbon);

      hatGroup.position.set(0, 0, 0);
      this.accessoryGroup.add(hatGroup);
    } else if (acc === 'flower') {
      // Sunny bright Daisy flower pinned directly ON THE SKIN of the character
      // Positioned above the eye line (on the upper right temple) and contoured flush to the skin surface
      const flowerGroup = new THREE.Group();
      const petalMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35 });
      const centerMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.2 });

      const centerGeom = new THREE.SphereGeometry(0.10, 16, 16);
      const center = new THREE.Mesh(centerGeom, centerMat);
      flowerGroup.add(center);

      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2;
        const petalGeom = new THREE.SphereGeometry(0.10, 12, 12);
        petalGeom.scale(1.4, 0.58, 0.18);
        const petal = new THREE.Mesh(petalGeom, petalMat);
        petal.position.set(Math.cos(ang) * 0.18, Math.sin(ang) * 0.18, 0);
        petal.rotation.z = ang;
        flowerGroup.add(petal);
      }
      this.flowerGroup = flowerGroup;
      this.faceAccessoryGroup.add(flowerGroup);
      this.updateFlowerPosition();
    } else if (acc === 'bowtie') {
      // Elegant red formal bowtie in faceAccessoryGroup (right beneath mouth)
      // Both wings point in opposite directions with identical horizontal alignment!
      const bowGroup = new THREE.Group();
      const redMat = new THREE.MeshStandardMaterial({
        color: 0xdc2626,
        roughness: 0.28,
        metalness: 0.1,
      });
      const goldMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        roughness: 0.2,
        metalness: 0.85,
      });

      // Center knot: rounded cylinder with gold wrap ring
      const knotGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.16, 16);
      knotGeom.rotateX(Math.PI / 2);
      const knot = new THREE.Mesh(knotGeom, redMat);
      bowGroup.add(knot);

      const goldBandGeom = new THREE.TorusGeometry(0.085, 0.018, 10, 24);
      goldBandGeom.rotateX(Math.PI / 2);
      const goldBand = new THREE.Mesh(goldBandGeom, goldMat);
      bowGroup.add(goldBand);

      // Left & right wings pointing to different sides along the exact same horizontal alignment!
      // Left wing: tip at center knot (x = 0), flaring outward to the left (x = -0.28)
      const leftShape = new THREE.Shape();
      leftShape.moveTo(0, 0.025);
      leftShape.lineTo(-0.28, 0.16);
      leftShape.quadraticCurveTo(-0.33, 0, -0.28, -0.16);
      leftShape.lineTo(0, -0.025);
      leftShape.closePath();

      // Right wing: tip at center knot (x = 0), flaring outward to the right (x = +0.28)
      const rightShape = new THREE.Shape();
      rightShape.moveTo(0, 0.025);
      rightShape.lineTo(0.28, 0.16);
      rightShape.quadraticCurveTo(0.33, 0, 0.28, -0.16);
      rightShape.lineTo(0, -0.025);
      rightShape.closePath();

      const extrudeOpts = {
        depth: 0.05,
        bevelEnabled: true,
        bevelSegments: 2,
        steps: 1,
        bevelSize: 0.012,
        bevelThickness: 0.012,
      };

      const leftWingGeom = new THREE.ExtrudeGeometry(leftShape, extrudeOpts);
      leftWingGeom.center();
      const leftWing = new THREE.Mesh(leftWingGeom, redMat);
      leftWing.position.set(-0.16, 0, 0);
      bowGroup.add(leftWing);

      const rightWingGeom = new THREE.ExtrudeGeometry(rightShape, extrudeOpts);
      rightWingGeom.center();
      const rightWing = new THREE.Mesh(rightWingGeom, redMat);
      rightWing.position.set(0.16, 0, 0);
      bowGroup.add(rightWing);

      // Ribbon tails hanging subtly beneath the knot
      const tailMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.35 });
      const leftTailGeom = new THREE.BoxGeometry(0.08, 0.22, 0.03);
      const leftTail = new THREE.Mesh(leftTailGeom, tailMat);
      leftTail.position.set(-0.06, -0.14, -0.01);
      leftTail.rotation.z = 0.22;
      bowGroup.add(leftTail);

      const rightTail = new THREE.Mesh(leftTailGeom.clone(), tailMat);
      rightTail.position.set(0.06, -0.14, -0.01);
      rightTail.rotation.z = -0.22;
      bowGroup.add(rightTail);

      bowGroup.position.set(0, -0.38, 0.09);
      this.faceAccessoryGroup.add(bowGroup);
    } else if (acc === 'sprout') {
      // Tiny baby sprout
      const sproutGroup = new THREE.Group();
      const sproutMat = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.4 });
      const stemCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0.04, 0.25, 0),
        new THREE.Vector3(0, 0.45, 0)
      );
      const stemGeom = new THREE.TubeGeometry(stemCurve, 12, 0.038, 8, false);
      const stem = new THREE.Mesh(stemGeom, sproutMat);
      sproutGroup.add(stem);

      const leafGeom = new THREE.SphereGeometry(0.13, 12, 12);
      leafGeom.scale(1.7, 0.3, 0.7);
      const leftLeaf = new THREE.Mesh(leafGeom, sproutMat);
      leftLeaf.position.set(-0.14, 0.45, 0);
      leftLeaf.rotation.z = 0.3;
      sproutGroup.add(leftLeaf);

      const rightLeaf = new THREE.Mesh(leafGeom.clone(), sproutMat);
      rightLeaf.position.set(0.14, 0.45, 0);
      rightLeaf.rotation.z = -0.3;
      sproutGroup.add(rightLeaf);

      sproutGroup.position.set(0, 0.04, 0);
      this.accessoryGroup.add(sproutGroup);
    } else if (acc === 'partyhat') {
      // Cheerful cone birthday party hat with colorful pompom
      const partyGroup = new THREE.Group();
      const coneGeom = new THREE.ConeGeometry(0.48, 0.85, 20);
      const coneMat = new THREE.MeshStandardMaterial({
        color: 0xec4899,
        roughness: 0.3,
      });
      const cone = new THREE.Mesh(coneGeom, coneMat);
      cone.position.set(0, 0.42, 0);
      partyGroup.add(cone);

      // Pompom at top
      const pompomGeom = new THREE.DodecahedronGeometry(0.12, 1);
      const pompomMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.7 });
      const pompom = new THREE.Mesh(pompomGeom, pompomMat);
      pompom.position.set(0, 0.88, 0);
      partyGroup.add(pompom);

      // Base ring
      const ringGeom = new THREE.TorusGeometry(0.47, 0.04, 8, 24);
      ringGeom.rotateX(Math.PI / 2);
      const ringMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.4 });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.position.set(0, 0.02, 0);
      partyGroup.add(ring);

      partyGroup.position.set(0, 0, 0);
      this.accessoryGroup.add(partyGroup);
    } else if (acc === 'wizard') {
      // Mystical deep purple wizard cone hat with golden stars - sits flush on head
      const wizGroup = new THREE.Group();
      const purpleMat = new THREE.MeshStandardMaterial({ color: 0x4c1d95, roughness: 0.4 });
      const goldMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.2, metalness: 0.6 });

      // Wide brim
      const brimGeom = new THREE.CylinderGeometry(0.95, 0.95, 0.04, 24);
      const brim = new THREE.Mesh(brimGeom, purpleMat);
      brim.position.set(0, 0.02, 0);
      wizGroup.add(brim);

      // Curved conical point
      const coneGeom = new THREE.ConeGeometry(0.55, 1.1, 20);
      const cone = new THREE.Mesh(coneGeom, purpleMat);
      cone.position.set(0.04, 0.55, -0.02);
      cone.rotation.z = -0.1;
      wizGroup.add(cone);

      // Golden crescent moon emblem
      const moonGeom = new THREE.TorusGeometry(0.12, 0.04, 8, 16, Math.PI * 1.3);
      const moon = new THREE.Mesh(moonGeom, goldMat);
      moon.position.set(0, 0.45, 0.42);
      wizGroup.add(moon);

      wizGroup.position.set(0, 0, 0);
      this.accessoryGroup.add(wizGroup);
    } else if (acc === 'mustache') {
      // Dapper handlebar mustache directly on face right above mouth
      const stacheGroup = new THREE.Group();
      const stacheMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.4 });

      // Left curl
      const leftCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(-0.16, 0.04, 0),
        new THREE.Vector3(-0.32, 0.08, 0.02)
      );
      const leftGeom = new THREE.TubeGeometry(leftCurve, 12, 0.05, 8, false);
      const leftWing = new THREE.Mesh(leftGeom, stacheMat);
      stacheGroup.add(leftWing);

      // Right curl
      const rightCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0.16, 0.04, 0),
        new THREE.Vector3(0.32, 0.08, 0.02)
      );
      const rightGeom = new THREE.TubeGeometry(rightCurve, 12, 0.05, 8, false);
      const rightWing = new THREE.Mesh(rightGeom, stacheMat);
      stacheGroup.add(rightWing);

      stacheGroup.position.set(0, -0.08, 0.1);
      this.faceAccessoryGroup.add(stacheGroup);
    } else if (acc === 'monocle') {
      // Elegant golden monocle over the right eye with dainty hanging chain
      const monoGroup = new THREE.Group();
      const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.15, metalness: 0.85 });
      const glassMat = new THREE.MeshStandardMaterial({
        color: 0xe0f2fe,
        roughness: 0.05,
        metalness: 0.3,
        transparent: true,
        opacity: 0.65,
      });

      const ringGeom = new THREE.TorusGeometry(0.24, 0.03, 12, 24);
      const ring = new THREE.Mesh(ringGeom, goldMat);
      monoGroup.add(ring);

      const glassGeom = new THREE.CylinderGeometry(0.23, 0.23, 0.015, 24);
      glassGeom.rotateX(Math.PI / 2);
      const glass = new THREE.Mesh(glassGeom, glassMat);
      monoGroup.add(glass);

      // Hanging chain
      const chainCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(0.22, 0, 0),
        new THREE.Vector3(0.28, -0.22, 0.02),
        new THREE.Vector3(0.15, -0.38, 0.04)
      );
      const chainGeom = new THREE.TubeGeometry(chainCurve, 10, 0.012, 6, false);
      const chain = new THREE.Mesh(chainGeom, goldMat);
      monoGroup.add(chain);

      monoGroup.position.set(0.35, 0.15, 0.1);
      this.faceAccessoryGroup.add(monoGroup);
    } else if (acc === 'headphones') {
      // Deluxe DJ Studio / Gaming Headphones with responsive custom fitting
      const hpGroup = new THREE.Group();

      // Left & Right Large Deluxe Ear Cups
      const createEarCup = (xSign: number) => {
        const cupGroup = new THREE.Group();

        // 1. Plush memory foam cushion (thick rounded cylinder)
        const plushGeom = new THREE.CylinderGeometry(0.25, 0.25, 0.16, 24);
        plushGeom.rotateZ(Math.PI / 2);
        const plush = new THREE.Mesh(plushGeom, this.headphoneCushionMat);
        cupGroup.add(plush);

        // Inner cushion contour ring
        const innerRingGeom = new THREE.TorusGeometry(0.16, 0.045, 12, 24);
        innerRingGeom.rotateY(Math.PI / 2);
        const innerRing = new THREE.Mesh(innerRingGeom, this.headphoneBodyMat);
        cupGroup.add(innerRing);

        // 2. Outer can casing
        const canGeom = new THREE.CylinderGeometry(0.24, 0.24, 0.10, 24);
        canGeom.rotateZ(Math.PI / 2);
        const can = new THREE.Mesh(canGeom, this.headphoneBodyMat);
        can.position.set(xSign * 0.11, 0, 0);
        cupGroup.add(can);

        // 3. Metallic outer DJ accent plate
        const plateGeom = new THREE.CylinderGeometry(0.18, 0.18, 0.025, 24);
        plateGeom.rotateZ(Math.PI / 2);
        const plate = new THREE.Mesh(plateGeom, this.headphoneMetalMat);
        plate.position.set(xSign * 0.155, 0, 0);
        cupGroup.add(plate);

        // Center glowing logo badge
        const badgeGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.03, 18);
        badgeGeom.rotateZ(Math.PI / 2);
        const badge = new THREE.Mesh(badgeGeom, this.headphoneAccentMat);
        badge.position.set(xSign * 0.165, 0, 0);
        cupGroup.add(badge);

        // 4. Chrome swivel yoke mount connecting cup to headband
        const yokeCurve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(0, -0.25, 0),
          new THREE.Vector3(xSign * 0.16, 0, 0),
          new THREE.Vector3(0, 0.25, 0)
        );
        const yokeGeom = new THREE.TubeGeometry(yokeCurve, 12, 0.02, 8, false);
        const yoke = new THREE.Mesh(yokeGeom, this.headphoneMetalMat);
        cupGroup.add(yoke);

        return cupGroup;
      };

      this.leftEarCup = createEarCup(-1);
      hpGroup.add(this.leftEarCup);

      this.rightEarCup = createEarCup(1);
      hpGroup.add(this.rightEarCup);

      // Headband & padded cushion meshes (geometries dynamically calculated in updateHeadphones())
      this.headbandMesh = new THREE.Mesh(new THREE.BufferGeometry(), this.headphoneBodyMat);
      this.headbandPadMesh = new THREE.Mesh(new THREE.BufferGeometry(), this.headphoneCushionMat);
      hpGroup.add(this.headbandMesh);
      hpGroup.add(this.headbandPadMesh);

      this.headphonesGroup = hpGroup;
      this.group.add(hpGroup);
      this.updateHeadphones();
    } else if (acc === 'beanie') {
      // Cozy knit winter beanie with folded cuff and bobble
      const beanieGroup = new THREE.Group();
      const knitMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.7 });
      const cuffMat = new THREE.MeshStandardMaterial({ color: 0x0369a1, roughness: 0.8 });

      // Folded cuff ring
      const cuffGeom = new THREE.TorusGeometry(0.72, 0.12, 12, 24);
      cuffGeom.rotateX(Math.PI / 2);
      const cuff = new THREE.Mesh(cuffGeom, cuffMat);
      cuff.position.set(0, 0.08, 0);
      beanieGroup.add(cuff);

      // Dome
      const domeGeom = new THREE.SphereGeometry(0.74, 24, 18, 0, Math.PI * 2, 0, Math.PI / 1.9);
      const dome = new THREE.Mesh(domeGeom, knitMat);
      dome.position.set(0, 0.14, 0);
      beanieGroup.add(dome);

      // Fluffy bobble pompom
      const pomGeom = new THREE.DodecahedronGeometry(0.18, 1);
      const pomMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });
      const pom = new THREE.Mesh(pomGeom, pomMat);
      pom.position.set(0, 0.82, 0);
      beanieGroup.add(pom);

      beanieGroup.position.set(0, 0, 0);
      this.accessoryGroup.add(beanieGroup);
    } else if (acc === 'retro3d') {
      // Iconic retro 3D paper glasses - situated directly over the eyes!
      const retroGroup = new THREE.Group();
      const paperMat = new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 0.35 });
      const redMat = new THREE.MeshStandardMaterial({
        color: 0xef4444,
        roughness: 0.08,
        transparent: true,
        opacity: 0.9,
      });
      const cyanMat = new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        roughness: 0.08,
        transparent: true,
        opacity: 0.9,
      });

      // Frame: spans across both eyes (width 1.24, height 0.46, depth 0.035)
      const frameGeom = new THREE.BoxGeometry(1.24, 0.46, 0.035);
      const frame = new THREE.Mesh(frameGeom, paperMat);
      frame.position.set(0, 0.15, 0.135);
      retroGroup.add(frame);

      // Left red lens: centered right over left eye (x = -0.35, y = 0.15)
      const lensGeom = new THREE.BoxGeometry(0.44, 0.38, 0.045);
      const leftLens = new THREE.Mesh(lensGeom, redMat);
      leftLens.position.set(-0.35, 0.15, 0.145);
      retroGroup.add(leftLens);

      // Right cyan lens: centered right over right eye (x = +0.35, y = 0.15)
      const rightLens = new THREE.Mesh(lensGeom.clone(), cyanMat);
      rightLens.position.set(0.35, 0.15, 0.145);
      retroGroup.add(rightLens);

      // Center nose notch cutout
      const notchGeom = new THREE.BoxGeometry(0.18, 0.14, 0.04);
      const notchMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, roughness: 0.6 });
      const notch = new THREE.Mesh(notchGeom, notchMat);
      notch.position.set(0, 0.06, 0.136);
      retroGroup.add(notch);

      // Side paper temple arms
      const armGeom = new THREE.BoxGeometry(0.03, 0.16, 0.55);
      const leftArm = new THREE.Mesh(armGeom, paperMat);
      leftArm.position.set(-0.61, 0.15, -0.14);
      retroGroup.add(leftArm);

      const rightArm = new THREE.Mesh(armGeom.clone(), paperMat);
      rightArm.position.set(0.61, 0.15, -0.14);
      retroGroup.add(rightArm);

      this.faceAccessoryGroup.add(retroGroup);
    } else if (acc === 'flowercrown') {
      // Ring of colorful blossoms encircling the head crown snugly
      const crownGroup = new THREE.Group();
      const vineMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.5 });
      const ringGeom = new THREE.TorusGeometry(0.72, 0.035, 10, 24);
      ringGeom.rotateX(Math.PI / 2);
      const ring = new THREE.Mesh(ringGeom, vineMat);
      ring.position.set(0, -0.06, 0);
      crownGroup.add(ring);

      const colors = [0xf43f5e, 0xfacc15, 0xa855f7, 0x38bdf8, 0xf97316];
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2;
        const bGroup = new THREE.Group();
        const fMat = new THREE.MeshStandardMaterial({ color: colors[i % colors.length], roughness: 0.3 });
        const petal = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), fMat);
        petal.scale.set(1, 0.5, 1);
        bGroup.add(petal);

        bGroup.position.set(Math.cos(ang) * 0.72, -0.04, Math.sin(ang) * 0.72);
        crownGroup.add(bGroup);
      }

      crownGroup.position.set(0, 0.02, 0);
      this.accessoryGroup.add(crownGroup);
    }
  }

  /**
   * Set Color & Shading Material
   */
  public setColor(primary: string) {
    this.bodyMaterial.color.set(primary);
  }

  public setMaterialStyle(style: MaterialStyle) {
    if (style === 'clay') {
      this.bodyMaterial.roughness = 0.4;
      this.bodyMaterial.metalness = 0.05;
      this.bodyMaterial.wireframe = false;
    } else if (style === 'jelly') {
      this.bodyMaterial.roughness = 0.12;
      this.bodyMaterial.metalness = 0.15;
      this.bodyMaterial.wireframe = false;
    } else if (style === 'matte') {
      this.bodyMaterial.roughness = 0.85;
      this.bodyMaterial.metalness = 0.0;
      this.bodyMaterial.wireframe = false;
    } else if (style === 'gold') {
      this.bodyMaterial.roughness = 0.25;
      this.bodyMaterial.metalness = 0.9;
      this.bodyMaterial.wireframe = false;
    } else if (style === 'neon') {
      this.bodyMaterial.roughness = 0.2;
      this.bodyMaterial.metalness = 0.1;
      this.bodyMaterial.wireframe = false;
    }
  }

  /**
   * Update Shape Morph Parameters
   */
  public setShapeParams(params: Partial<ShapeMorphParams>) {
    this.shapeParams = { ...this.shapeParams, ...params };
    this.rebuildMeshGeometry();
  }

  public getShapeParams(): ShapeMorphParams {
    return { ...this.shapeParams };
  }

  /**
   * Procedural Vertex Deformation Engine:
   * Morph geometry using squash, stretch, taper, twist, lumpiness, bend & physics spring
   */
  public rebuildMeshGeometry() {
    const posAttr = this.bodyGeometry.attributes.position;
    const vertexCount = posAttr.count;

    const { squashStretch, chubbiness, taper, twist, lumpiness, bend } = this.shapeParams;
    const totalHeight = 2.6;

    for (let i = 0; i < vertexCount; i++) {
      const idx = i * 3;
      const x0 = this.basePositions[idx];
      const y0 = this.basePositions[idx + 1];
      const z0 = this.basePositions[idx + 2];

      // Normalized height in [-0.5, 0.5]
      const hNorm = y0 / totalHeight;

      // 1. Organic Taper (adjust top vs bottom radius)
      // taper > 0 means thinner bottom / cone; taper < 0 means thinner top
      const taperScale = Math.max(0.15, 1.0 - taper * hNorm);

      // 2. Chubbiness profile: round belly curve in center
      const bellyCurve = 1.0 + Math.cos(hNorm * Math.PI) * (chubbiness - 1.0) * 0.8;
      const radiusFactor = chubbiness * taperScale * bellyCurve;

      // 3. Squash and Stretch (preserve volume)
      // When stretched in Y, narrow X and Z; when squashed in Y, broaden X and Z
      const yStretch = 1.0 + squashStretch;
      const xzStretch = 1.0 / Math.sqrt(Math.max(0.2, yStretch));

      let x = x0 * radiusFactor * xzStretch;
      let y = y0 * yStretch;
      let z = z0 * radiusFactor * xzStretch;

      // 4. Twist along Y
      if (Math.abs(twist) > 0.001) {
        const theta = twist * hNorm * Math.PI;
        const cosT = Math.cos(theta);
        const sinT = Math.sin(theta);
        const rx = x * cosT - z * sinT;
        const rz = x * sinT + z * cosT;
        x = rx;
        z = rz;
      }

      // 5. Spine Bend curve
      if (Math.abs(bend) > 0.001) {
        // Bend spine quadratically
        x += bend * Math.pow(hNorm + 0.5, 2) * 1.2;
      }

      // 6. Lumpiness / Procedural 3D Sinusoidal Organic Noise (with facial zone protection)
      if (lumpiness > 0.01) {
        // Protect facial area from harsh surface noise so eyes and mouth maintain clean shape
        const isNearFace = z0 > 0 && Math.abs(x0) < 0.65 && y0 > -0.35 && y0 < 0.75;
        const noiseMult = isNearFace ? 0.2 : 1.0;
        const noise =
          Math.sin(x * 3.5 + y * 2.0) * Math.cos(z * 3.5) * 0.5 +
          Math.sin(y * 6.0 + z * 4.0) * 0.3;
        const noiseAmount = lumpiness * 0.18 * noiseMult;
        x += x * noise * noiseAmount;
        z += z * noise * noiseAmount;
      }

      // 7. Dynamic Spring Squish / Pull drag deformation
      if (this.pullOffset.lengthSq() > 0.001 || this.jiggleFactor > 0.001) {
        // Pull top more than bottom
        const grabInfluence = Math.max(0, hNorm + 0.5);
        x += this.pullOffset.x * grabInfluence * 0.6;
        y += this.pullOffset.y * grabInfluence * 0.8;
        z += this.pullOffset.z * grabInfluence * 0.6;

        // Radial wobble ripple
        if (this.jiggleFactor > 0.001) {
          const wobble = Math.sin(hNorm * 12.0 + Date.now() * 0.02) * this.jiggleFactor * 0.08;
          x += x * wobble;
          z += z * wobble;
        }
      }

      posAttr.array[idx] = x;
      posAttr.array[idx + 1] = y;
      posAttr.array[idx + 2] = z;
    }

    posAttr.needsUpdate = true;
    this.bodyGeometry.computeVertexNormals();

    // Adjust face position and orientation to stay anchored on the front surface of the deformed mesh
    const hFace = 0.22 / totalHeight;
    const taperFace = Math.max(0.15, 1.0 - taper * hFace);
    const bellyFace = 1.0 + Math.cos(hFace * Math.PI) * (chubbiness - 1.0) * 0.8;
    const yStretchFace = 1.0 + squashStretch;
    const xzStretchFace = 1.0 / Math.sqrt(Math.max(0.2, yStretchFace));
    const radiusFace = 0.85 * chubbiness * taperFace * bellyFace * xzStretchFace;

    const grabInfluenceFace = Math.max(0, hFace + 0.5);
    const spineXFace = bend * Math.pow(hFace + 0.5, 2) * 1.2 + this.pullOffset.x * grabInfluenceFace * 0.6;
    const spineYFace = 0.22 * yStretchFace + this.pullOffset.y * grabInfluenceFace * 0.8;
    const spineZFace = this.pullOffset.z * grabInfluenceFace * 0.6;

    const twistAngleFace = twist * hFace * Math.PI;
    const normalXFace = Math.sin(twistAngleFace);
    const normalZFace = Math.cos(twistAngleFace);

    // Anchor faceGroup right onto the skin surface (radiusFace * 0.995 ensures mouth & cheeks never sink inside)
    this.faceGroup.position.set(
      spineXFace + normalXFace * (radiusFace * 0.995),
      spineYFace,
      spineZFace + normalZFace * (radiusFace * 0.995)
    );
    this.faceGroup.rotation.y = twistAngleFace;
    this.faceGroup.rotation.z = -bend * (hFace + 0.5) * 0.9 - this.pullOffset.x * 0.15;
    this.faceGroup.rotation.x = this.pullOffset.y * 0.12;

    // Top surface calculations for Topper (greens/sepals) & Head Accessories (crown, chef hat, top hat)
    const hTop = 0.5; // normalized top height (y = 1.3 / 2.6)
    const taperTop = Math.max(0.15, 1.0 - taper * hTop);
    const topRadius = 0.85 * chubbiness * taperTop * xzStretchFace;

    const spineXTop = bend * 1.2 + this.pullOffset.x * 0.6;
    // Set spineYTop precisely at the top surface vertex apex of the body cylinder (1.295 * yStretchFace)
    // so hats, crown, and wardrobe elements sit completely flush atop the head and never float or sink into the body!
    const spineYTop = 1.295 * yStretchFace + this.pullOffset.y * 0.7;
    const spineZTop = this.pullOffset.z * 0.6;
    const twistAngleTop = twist * hTop * Math.PI;

    // Gentle, stable angle so accessories stay seated without sliding or tilting awkwardly
    const topTiltZ = -bend * 0.22 - this.pullOffset.x * 0.08;
    const topTiltX = this.pullOffset.y * 0.04;

    this.topperGroup.position.set(spineXTop, spineYTop, spineZTop);
    this.topperGroup.rotation.set(topTiltX, twistAngleTop, topTiltZ);

    this.accessoryGroup.position.set(spineXTop, spineYTop, spineZTop);
    this.accessoryGroup.rotation.set(topTiltX, twistAngleTop, topTiltZ);

    // Intelligently scale head accessories horizontally and vertically to fit the top width of any vegetable!
    const headScale = Math.max(0.42, Math.min(1.8, topRadius / 0.85));
    this.accessoryGroup.scale.set(headScale, headScale, headScale);
    this.topperGroup.scale.set(headScale, 1, headScale);

    // Adaptive headphones dynamically fit character width at the ears & crown height
    this.updateHeadphones();

    // Snug skin-conformed Daisy position tracking (positioned a little bit up and to the right)
    this.updateFlowerPosition();

    // Sweet corn bottom husk leaves anchoring
    if (this.cornHuskGroup) {
      const hBottom = -0.48;
      const taperBottom = Math.max(0.15, 1.0 - taper * hBottom);
      const radiusBottom = 0.85 * chubbiness * taperBottom * xzStretchFace;
      const spineXBottom = bend * Math.pow(hBottom + 0.5, 2) * 1.2 + this.pullOffset.x * 0.12;
      const spineYBottom = -1.28 * yStretchFace + this.pullOffset.y * 0.15;
      const spineZBottom = this.pullOffset.z * 0.12;

      this.cornHuskGroup.position.set(spineXBottom, spineYBottom, spineZBottom);
      const bottomScale = Math.max(0.45, radiusBottom / 0.85);
      this.cornHuskGroup.scale.set(bottomScale, yStretchFace, bottomScale);
    }

    // Avocado pit snugly embedded inside belly flesh with natural spine tilt
    if (this.avocadoPit) {
      const hPit = -0.36 / totalHeight;
      const taperPit = Math.max(0.15, 1.0 - taper * hPit);
      const bellyPit = 1.0 + Math.cos(hPit * Math.PI) * (chubbiness - 1.0) * 0.8;
      const radiusPit = 0.85 * chubbiness * taperPit * bellyPit * xzStretchFace;
      const twistPit = twist * hPit * Math.PI;
      const grabInfluencePit = Math.max(0, hPit + 0.5);
      const spineXPit = bend * Math.pow(hPit + 0.5, 2) * 1.2 + this.pullOffset.x * grabInfluencePit * 0.6;
      const spineYPit = -0.36 * yStretchFace + this.pullOffset.y * grabInfluencePit * 0.8;
      const spineZPit = this.pullOffset.z * grabInfluencePit * 0.6;

      // Embedded safely inside belly flesh (radiusPit * 0.40) so it does not protrude out
      this.avocadoPit.position.set(
        spineXPit + Math.sin(twistPit) * (radiusPit * 0.40),
        spineYPit,
        spineZPit + Math.cos(twistPit) * (radiusPit * 0.40)
      );
      this.avocadoPit.rotation.set(
        this.pullOffset.y * 0.12,
        twistPit,
        -bend * (hPit + 0.5) * 0.8 - this.pullOffset.x * 0.15
      );
    }
  }

  /**
   * Snugly anchor the Daisy flower directly on the skin of the character,
   * positioned a little bit up and to the right on the upper temple / forehead,
   * contoured flush against the curved surface.
   */
  private updateFlowerPosition() {
    if (!this.flowerGroup) return;
    const { taper, chubbiness, squashStretch } = this.shapeParams;
    const yStretch = 1.0 + squashStretch;
    const xzStretch = 1.0 / Math.sqrt(Math.max(0.2, yStretch));

    // "A little bit up" (y = 0.58 vs previous 0.44, sitting comfortably above right brow at y = 0.40)
    // "And to the right" (x = 0.52 vs previous 0.40, outer right temple)
    const targetY = 0.58;
    const targetX = 0.52;

    const hFace = 0.22 / 2.6;
    const hFlower = (0.22 * yStretch + targetY) / 2.6;

    const taperFactor = Math.max(0.15, 1.0 - taper * hFlower);
    const bellyFactor = 1.0 + Math.cos(hFlower * Math.PI) * (chubbiness - 1.0) * 0.8;
    const rFlower = 0.85 * chubbiness * taperFactor * bellyFactor * xzStretch;

    const taperFace = Math.max(0.15, 1.0 - taper * hFace);
    const bellyFace = 1.0 + Math.cos(hFace * Math.PI) * (chubbiness - 1.0) * 0.8;
    const rFace = 0.85 * chubbiness * taperFace * bellyFace * xzStretch;

    // Adapt X to width of narrow or wide characters so flower never hangs in midair
    const safeX = Math.min(targetX, rFlower * 0.86);

    // Curved surface depth: as X moves outward from center, cylindrical surface drops back
    const curveDrop = Math.sqrt(Math.max(0.01, rFlower * rFlower - safeX * safeX)) - rFace;
    const zSkin = curveDrop + 0.045; // slightly raised on the skin surface

    this.flowerGroup.position.set(safeX, targetY, zSkin);
    // Angle tangent to the sloping surface of the head above the right eye
    const normalAngleY = Math.asin(Math.max(-0.95, Math.min(0.95, safeX / rFlower)));
    this.flowerGroup.rotation.set(-0.24 - taper * 0.14, normalAngleY * 0.92, -0.22);
  }

  /**
   * Dynamically fit the headphones to the exact character width, ear height, and crown height.
   * Ensures the plush earcups hug the sides of the head perfectly regardless of whether the vegetable
   * is skinny (like a carrot/chili) or extra wide (like an onion/pumpkin/tomato), and regardless of
   * taper, bend, or stretch!
   */
  private updateHeadphones() {
    if (!this.headphonesGroup || !this.leftEarCup || !this.rightEarCup) return;

    const { squashStretch, chubbiness, taper, twist, bend, lumpiness } = this.shapeParams;
    const yStretch = 1.0 + squashStretch;
    const xzStretch = 1.0 / Math.sqrt(Math.max(0.2, yStretch));

    // Ear height: vertically aligned with the temple/eyes
    const hEar = 0.20 / 2.6; // normalized height in [-0.5, 0.5]
    const taperEar = Math.max(0.15, 1.0 - taper * hEar);
    const bellyEar = 1.0 + Math.cos(hEar * Math.PI) * (chubbiness - 1.0) * 0.8;
    // Actual half-width of the character at ear height
    const earRadius = 0.85 * chubbiness * taperEar * bellyEar * xzStretch * (1 + lumpiness * 0.03);

    // Spine center at ear height
    const grabEar = Math.max(0, hEar + 0.5);
    const spineXEar = bend * Math.pow(hEar + 0.5, 2) * 1.2 + this.pullOffset.x * grabEar * 0.6;
    const spineYEar = 0.20 * yStretch + this.pullOffset.y * grabEar * 0.8;
    const spineZEar = this.pullOffset.z * grabEar * 0.6;
    const twistAngleEar = twist * hEar * Math.PI;

    // Lateral direction vector (perpendicular to face direction)
    const dirX = Math.cos(twistAngleEar);
    const dirZ = -Math.sin(twistAngleEar);

    // Proportional ear cup scaling: scaled slightly for tiny or giant veggies while keeping circular shape
    const cupScale = Math.max(0.70, Math.min(1.30, 0.52 + 0.48 * (earRadius / 0.85)));
    this.leftEarCup.scale.set(cupScale, cupScale, cupScale);
    this.rightEarCup.scale.set(cupScale, cupScale, cupScale);

    // Cushion depth: inner foam touches character skin exactly at earRadius
    const cupDistance = earRadius + 0.082 * cupScale;

    // Left and right ear cup positions
    const leftPos = new THREE.Vector3(
      spineXEar - dirX * cupDistance,
      spineYEar,
      spineZEar - dirZ * cupDistance
    );
    const rightPos = new THREE.Vector3(
      spineXEar + dirX * cupDistance,
      spineYEar,
      spineZEar + dirZ * cupDistance
    );

    this.leftEarCup.position.copy(leftPos);
    this.rightEarCup.position.copy(rightPos);

    // Angle earcups to follow body spine & curvature
    const tiltZ = -bend * (hEar + 0.5) * 0.9 - this.pullOffset.x * 0.15;
    this.leftEarCup.rotation.set(0, twistAngleEar, tiltZ);
    this.rightEarCup.rotation.set(0, twistAngleEar, tiltZ);

    // Head crown apex position (top of head)
    const spineXTop = bend * 1.2 + this.pullOffset.x * 0.6;
    const spineYTop = 1.295 * yStretch + this.pullOffset.y * 0.7;
    const spineZTop = this.pullOffset.z * 0.6;

    // Points where the headband attaches to the top of the swivel yoke on each ear cup
    const yokeUpOffset = new THREE.Vector3(0, 0.25 * cupScale, 0);
    yokeUpOffset.applyAxisAngle(new THREE.Vector3(0, 0, 1), tiltZ);
    yokeUpOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), twistAngleEar);

    const leftTop = leftPos.clone().add(yokeUpOffset);
    const rightTop = rightPos.clone().add(yokeUpOffset);

    // Crown apex height: snug fit directly on the crown of the head so the cushion rests right on the skin
    const crownApexY = spineYTop + 0.058 * cupScale;
    const crownApex = new THREE.Vector3(spineXTop, crownApexY, spineZTop);

    // Helper to calculate body boundary radius at any given Y height
    const getBodyRadiusAtY = (yVal: number) => {
      const hVal = (yVal / Math.max(0.2, yStretch)) / 2.6; // normalized [-0.5, 0.5]
      const clampedH = Math.max(-0.5, Math.min(0.5, hVal));
      const tFactor = Math.max(0.15, 1.0 - taper * clampedH);
      const bFactor = 1.0 + Math.cos(clampedH * Math.PI) * (chubbiness - 1.0) * 0.8;
      return 0.85 * chubbiness * tFactor * bFactor * xzStretch * (1 + lumpiness * 0.03);
    };

    // Helper to calculate spine position & twist at any given Y height
    const getSpineInfoAtY = (yVal: number) => {
      const hVal = (yVal / Math.max(0.2, yStretch)) / 2.6;
      const clampedH = Math.max(-0.5, Math.min(0.5, hVal));
      const grab = Math.max(0, clampedH + 0.5);
      const sx = bend * Math.pow(clampedH + 0.5, 2) * 1.2 + this.pullOffset.x * grab * 0.6;
      const sz = this.pullOffset.z * grab * 0.6;
      const tw = twist * clampedH * Math.PI;
      return { x: sx, z: sz, twist: tw };
    };

    const deltaH = spineYTop - leftTop.y;
    const topRadius = getBodyRadiusAtY(spineYTop);
    const topSpine = getSpineInfoAtY(spineYTop);
    const dirXTop = Math.cos(topSpine.twist);
    const dirZTop = -Math.sin(topSpine.twist);

    // Stage 1: Lower arm hugging temple / cheek right along the skin perimeter
    const yLeft1 = leftTop.y + deltaH * 0.25;
    const spineL1 = getSpineInfoAtY(yLeft1);
    const rL1 = getBodyRadiusAtY(yLeft1);
    const dirXL1 = Math.cos(spineL1.twist);
    const dirZL1 = -Math.sin(spineL1.twist);
    const latDistL1 = rL1 + 0.046 * cupScale;
    const pL1 = new THREE.Vector3(spineL1.x - dirXL1 * latDistL1, yLeft1, spineL1.z - dirZL1 * latDistL1);

    // Stage 2: Mid arm following the natural organic taper & chubbiness of the head
    const yLeft2 = leftTop.y + deltaH * 0.60;
    const spineL2 = getSpineInfoAtY(yLeft2);
    const rL2 = getBodyRadiusAtY(yLeft2);
    const dirXL2 = Math.cos(spineL2.twist);
    const dirZL2 = -Math.sin(spineL2.twist);
    const latDistL2 = rL2 + 0.046 * cupScale;
    const pL2 = new THREE.Vector3(spineL2.x - dirXL2 * latDistL2, yLeft2, spineL2.z - dirZL2 * latDistL2);

    // Stage 3: Outer crown corner rounding snugly over the top rim of the character
    const yLeft3 = spineYTop + 0.022 * cupScale;
    const latDistL3 = topRadius * 0.88 + 0.040 * cupScale;
    const pL3 = new THREE.Vector3(topSpine.x - dirXTop * latDistL3, yLeft3, topSpine.z - dirZTop * latDistL3);

    // Stage 4: Inner crown arch transitioning smoothly into the apex
    const yLeft4 = spineYTop + 0.050 * cupScale;
    const latDistL4 = topRadius * 0.46;
    const pL4 = new THREE.Vector3(topSpine.x - dirXTop * latDistL4, yLeft4, topSpine.z - dirZTop * latDistL4);

    // Symmetric points for the right side
    const yRight1 = rightTop.y + deltaH * 0.25;
    const spineR1 = getSpineInfoAtY(yRight1);
    const rR1 = getBodyRadiusAtY(yRight1);
    const dirXR1 = Math.cos(spineR1.twist);
    const dirZR1 = -Math.sin(spineR1.twist);
    const latDistR1 = rR1 + 0.046 * cupScale;
    const pR1 = new THREE.Vector3(spineR1.x + dirXR1 * latDistR1, yRight1, spineR1.z + dirZR1 * latDistR1);

    const yRight2 = rightTop.y + deltaH * 0.60;
    const spineR2 = getSpineInfoAtY(yRight2);
    const rR2 = getBodyRadiusAtY(yRight2);
    const dirXR2 = Math.cos(spineR2.twist);
    const dirZR2 = -Math.sin(spineR2.twist);
    const latDistR2 = rR2 + 0.046 * cupScale;
    const pR2 = new THREE.Vector3(spineR2.x + dirXR2 * latDistR2, yRight2, spineR2.z + dirZR2 * latDistR2);

    const yRight3 = spineYTop + 0.022 * cupScale;
    const latDistR3 = topRadius * 0.88 + 0.040 * cupScale;
    const pR3 = new THREE.Vector3(topSpine.x + dirXTop * latDistR3, yRight3, topSpine.z + dirZTop * latDistR3);

    const yRight4 = spineYTop + 0.050 * cupScale;
    const latDistR4 = topRadius * 0.46;
    const pR4 = new THREE.Vector3(topSpine.x + dirXTop * latDistR4, yRight4, topSpine.z + dirZTop * latDistR4);

    // Smooth form-fitting centripetal Catmull-Rom spline closely hugging head perimeter
    const bandCurve = new THREE.CatmullRomCurve3(
      [leftTop, pL1, pL2, pL3, pL4, crownApex, pR4, pR3, pR2, pR1, rightTop],
      false,
      'centripetal'
    );

    // Rebuild headband geometry with sleek proportionate profile
    if (this.headbandMesh) {
      this.headbandMesh.geometry.dispose();
      this.headbandMesh.geometry = new THREE.TubeGeometry(
        bandCurve,
        48,
        0.038 * cupScale,
        12,
        false
      );
    }

    // Rebuild headband padding geometry resting snugly on the crown of the head
    if (this.headbandPadMesh) {
      this.headbandPadMesh.geometry.dispose();
      const padPoints: THREE.Vector3[] = [];
      const numPadSegs = 18;
      for (let i = 0; i <= numPadSegs; i++) {
        const t = 0.28 + (i / numPadSegs) * 0.44; // upper 44% across the crown of the head
        const pt = bandCurve.getPoint(t);
        pt.y -= 0.016 * cupScale; // cushion sits snugly on the underside of the band
        padPoints.push(pt);
      }
      const padCurve = new THREE.CatmullRomCurve3(padPoints, false, 'centripetal');
      this.headbandPadMesh.geometry = new THREE.TubeGeometry(
        padCurve,
        20,
        0.042 * cupScale,
        10,
        false
      );
    }
  }

  /**
   * Per-frame physics, eye-tracking, breathing & wobble update
   */
  public update(delta: number, time: number) {
    // 1. Spring physics for pull / release
    if (!this.isGrabbed) {
      const springK = 28.0;
      const damping = 7.5;

      const forceX = -springK * this.pullOffset.x - damping * this.pullVelocity.x;
      const forceY = -springK * this.pullOffset.y - damping * this.pullVelocity.y;
      const forceZ = -springK * this.pullOffset.z - damping * this.pullVelocity.z;

      this.pullVelocity.x += forceX * delta;
      this.pullVelocity.y += forceY * delta;
      this.pullVelocity.z += forceZ * delta;

      this.pullOffset.x += this.pullVelocity.x * delta;
      this.pullOffset.y += this.pullVelocity.y * delta;
      this.pullOffset.z += this.pullVelocity.z * delta;

      // Jiggle decay
      this.jiggleFactor = Math.max(0, this.jiggleFactor - delta * 3.5);

      // Rebuild geometry while spring is still active
      if (this.pullOffset.lengthSq() > 0.0001 || this.jiggleFactor > 0.001) {
        this.rebuildMeshGeometry();
      }
    }

    // 2. Eye Look-At Tracking & Expression Synchronisation
    if (this.currentExpression === 'sleepy') {
      // Sleepy mood: keep eyes peacefully closed
      this.leftClosedEye.visible = true;
      this.rightClosedEye.visible = true;
      this.leftSclera.visible = false;
      this.rightSclera.visible = false;
      this.leftPupil.visible = false;
      this.rightPupil.visible = false;
      this.leftHeartPupil.visible = false;
      this.rightHeartPupil.visible = false;

      // Gentle rhythmic breathing
      this.faceGroup.position.y += Math.sin(time * 2.0) * 0.0012;
    } else {
      this.leftClosedEye.visible = false;
      this.rightClosedEye.visible = false;
      this.leftSclera.visible = true;
      this.rightSclera.visible = true;

      const isLove = this.currentExpression === 'love';
      this.leftPupil.visible = !isLove;
      this.rightPupil.visible = !isLove;
      this.leftHeartPupil.visible = isLove;
      this.rightHeartPupil.visible = isLove;

      // Project lookAtTarget into the local coordinate space of faceGroup
      // This ensures eyes point in the exact same direction as the head & body!
      const targetLocal = this.lookAtTarget.clone();
      this.faceGroup.worldToLocal(targetLocal);

      const dist = targetLocal.length();
      const nx = dist > 0.01 ? targetLocal.x / dist : 0;
      const ny = dist > 0.01 ? targetLocal.y / dist : 0;

      const maxPupilOffset = 0.045;
      const px = THREE.MathUtils.clamp(nx * 0.06, -maxPupilOffset, maxPupilOffset);
      const py = THREE.MathUtils.clamp(ny * 0.06, -maxPupilOffset, maxPupilOffset);

      if (isLove) {
        // Heart pupils track gaze with loving heartbeat pulse
        const heartPulse = 1.0 + Math.sin(time * 5.0) * 0.10;
        this.leftHeartPupil.position.x = px;
        this.leftHeartPupil.position.y = py;
        this.leftHeartPupil.scale.set(heartPulse, heartPulse, heartPulse);

        this.rightHeartPupil.position.x = px;
        this.rightHeartPupil.position.y = py;
        this.rightHeartPupil.scale.set(heartPulse, heartPulse, heartPulse);

        // Cheeks warm blushing pulse
        const blushPulse = 1.0 + Math.sin(time * 2.5) * 0.07;
        this.leftCheek.scale.set(1.35 * blushPulse, 0.85 * blushPulse, 0.32);
        this.rightCheek.scale.set(1.35 * blushPulse, 0.85 * blushPulse, 0.32);

        // Loving affectionate head sway tilt
        this.faceGroup.rotation.z += Math.sin(time * 1.8) * 0.003;

        // Animate floating halo hearts around the head
        this.floatingHearts.forEach((h) => {
          const ud = h.userData;
          h.position.y = ud.baseY + Math.sin(time * ud.speed + ud.phase) * 0.08;
          h.position.x = ud.baseX + Math.cos(time * 1.2 + ud.phase) * 0.04;
          h.rotation.y += delta * ud.rotSpeed;
          h.rotation.z = Math.sin(time * 2.2 + ud.phase) * 0.15;
          const s = ud.baseScale * (1.0 + Math.sin(time * 4.0 + ud.phase) * 0.14);
          h.scale.set(s, s, s);
        });
      } else {
        this.leftPupil.position.x = px;
        this.leftPupil.position.y = py;
        this.rightPupil.position.x = px;
        this.rightPupil.position.y = py;
      }

      // Eye globes gently coordinate with gaze direction
      this.leftEye.rotation.y = px * 0.6;
      this.leftEye.rotation.x = -py * 0.6;
      this.rightEye.rotation.y = px * 0.6;
      this.rightEye.rotation.x = -py * 0.6;

      // Natural Blinking logic only when awake
      this.blinkTimer += delta;
      if (this.blinkTimer >= this.nextBlinkInterval) {
        this.blinkProgress += delta * 12;
        const eyeScaleY = Math.max(0.08, Math.cos(this.blinkProgress * Math.PI));
        this.leftEye.scale.y = eyeScaleY;
        this.rightEye.scale.y = eyeScaleY;

        if (this.blinkProgress >= 1) {
          this.leftEye.scale.y = 1;
          this.rightEye.scale.y = 1;
          this.blinkTimer = 0;
          this.blinkProgress = 0;
          this.nextBlinkInterval = 2.5 + Math.random() * 3.5;
        }
      }
    }

    // 3. Tickle meter decay
    if (this.tickleMeter > 0) {
      this.tickleMeter = Math.max(0, this.tickleMeter - delta * 1.5);
    }

    // 4. Avocado pit gentle spin
    if (this.avocadoPit) {
      this.avocadoPit.rotation.y += delta * 0.5;
    }
  }

  /**
   * Trigger high-energy jiggle impulse (e.g. after poke or sound)
   */
  public triggerJiggle(intensity = 1.0) {
    this.jiggleFactor = Math.min(2.5, this.jiggleFactor + intensity);
    this.pullVelocity.y += (Math.random() - 0.5) * 4 * intensity;
    this.pullVelocity.x += (Math.random() - 0.5) * 4 * intensity;
    this.rebuildMeshGeometry();
  }
}
