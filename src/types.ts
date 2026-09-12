export type VeggieType =
  | 'carrot'
  | 'tomato'
  | 'avocado'
  | 'eggplant'
  | 'broccoli'
  | 'potato'
  | 'sweetcorn'
  | 'pumpkin'
  | 'chili'
  | 'mushroom'
  | 'garlic'
  | 'onion';

export type ExpressionType = 'happy' | 'surprised' | 'cheeky' | 'sleepy' | 'dizzy' | 'love';

export type AccessoryType =
  | 'none'
  | 'chef'
  | 'sunglasses'
  | 'crown'
  | 'flower'
  | 'tophat'
  | 'bowtie'
  | 'sprout'
  | 'partyhat'
  | 'wizard'
  | 'mustache'
  | 'monocle'
  | 'headphones'
  | 'beanie'
  | 'retro3d'
  | 'flowercrown';

export type MaterialStyle = 'clay' | 'jelly' | 'matte' | 'gold' | 'neon';

export interface ShapeMorphParams {
  squashStretch: number; // -1 (squashed) to 1 (stretched)
  chubbiness: number; // 0.5 to 1.8
  taper: number; // -1 to 1 (top vs bottom weight)
  twist: number; // -Math.PI to Math.PI
  lumpiness: number; // 0 to 1 (organic surface noise)
  bend: number; // -0.8 to 0.8
}

export interface VeggiePreset {
  id: VeggieType;
  name: string;
  emoji: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  leafColor: string;
  defaultShape: ShapeMorphParams;
  defaultAccessory: AccessoryType;
}

export type AnimationAction =
  | 'idle'
  | 'bounce'
  | 'jiggle'
  | 'spin'
  | 'sneeze'
  | 'dance'
  | 'moonwalk'
  | 'wave'
  | 'heartbeat'
  | 'zen'
  | 'beatbox';

export interface BackdropTheme {
  id: string;
  name: string;
  bgColor: string;
  floorColor: string;
  ambientColor: string;
  lightColor: string;
}
