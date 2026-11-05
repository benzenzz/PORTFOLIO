import {
  AdditiveBlending,
  Blending,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Camera,
  Color,
  ColorManagement,
  DoubleSide,
  IcosahedronGeometry,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  InstancedMesh,
  LinearSRGBColorSpace,
  MeshBasicMaterial,
  MathUtils,
  Mesh,
  NormalBlending,
  Object3D,
  OrthographicCamera,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  Vector4,
  WebGLRenderer,
  WebGLRenderTarget,
} from "three";

// Shader tự viết màu theo sRGB, nên tắt chuyển đổi màu của three.
ColorManagement.enabled = false;

export type Quality = "high" | "low";
export type Look = "night" | "paper";

const COUNTS = {
  high: { grass: 105000, cubes: 18000, stars: 2600, embers: 90, smoke: 320, dpr: 1.75, terrain: 240 },
  low: { grass: 32000, cubes: 7000, stars: 1000, embers: 40, smoke: 160, dpr: 1, terrain: 120 },
};

const COLOR = {
  deep: new Color("#12040f"),
  skyDark: new Color("#27093a"),
  sky: new Color("#4a1d63"),
  skyLift: new Color("#6a3a85"),
  moon: new Color("#d9c2f2"),
  rock: new Color("#0a0208"),
  ground: new Color("#4a2f6e"),
  grassTip: new Color("#a88fd0"),
  violet: new Color("#160830"),
  lilac: new Color("#3d1472"),
  violetGlow: new Color("#5c22c9"),
  lilacGlow: new Color("#b98cff"),
  mist: new Color("#f3ecf7"),
  gold: new Color("#eaaa00"),
  ink: new Color("#16060f"),
  plum: new Color("#3a0f34"),
  paper: new Color("#e5e4e2"),
};

// Đất đặt lệch về phía xa để phủ hết tầm nhìn của camera.
const CENTER_Z = -40;

const LETTERS = ["D", "E", "M", "I"];
const LETTER_HEIGHT = 1.85;
const LETTER_ANCHOR = new Vector3(0, 2.55, -6);
const CAMERA_TARGET = new Vector3(0, 1.9, -6);

/** Góc máy cho từng chữ: góc quay quanh chữ, khoảng cách, độ cao, độ nghiêng. */
// Camera bay đúng một vòng quanh chữ: mỗi chữ cách nhau 120 độ.
const ORBIT = [
  { radius: 6, height: 1.15 },
  { radius: 6.4, height: 1.7 },
  { radius: 6.6, height: 1.45 },
  { radius: 6.8, height: 1.6 },
];
const ORBIT_STEP = (Math.PI * 2) / 3;

const GATE_Z = -34;
const GATE_LOOK = new Vector3(0, 7, GATE_Z);
const GATE_END = new Vector3(0, 5.7, GATE_Z + 0.1);
const GATE_THROUGH = new Vector3(0, 5.7, GATE_Z - 30);

// Hành trình theo thanh cuộn: 0 đến 3 là bốn chữ, sau đó là các chặng của cổng.
const BUILD = [3.15, 4.15];
const READY = [4.15, 4.35];
const DOORS = [4.35, 5];
const CORE = [5.7, 6.2];
export const JOURNEY_END = CORE[1];

export function autoQuality(): Quality {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const weak = nav.hardwareConcurrency <= 4 || (nav.deviceMemory ?? 8) <= 4;
  return weak || matchMedia("(pointer: coarse)").matches ? "low" : "high";
}

function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Lấy điểm trong hình chữ, kèm độ sâu tính từ mép chữ và mạch lửa len giữa thân chữ. */
function sampleLetter(letter: string, count: number, rand: () => number, seed: number) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  // shortcut: dùng serif hệ thống, đổi sang Instrument Serif khi phase 2 nạp font.
  ctx.font = `bold ${size * 0.92}px Georgia, "Times New Roman", serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(letter, size / 2, size / 2);
  const { data } = ctx.getImageData(0, 0, size, size);

  // Biến đổi khoảng cách hai lượt: mỗi điểm biết nó cách mép chữ bao xa.
  const distance = new Float32Array(size * size);
  const inside: number[] = [];
  for (let i = 0; i < size * size; i++) {
    if (data[i * 4 + 3] > 128) {
      inside.push(i);
      const left = i % size ? distance[i - 1] : 0;
      const up = i >= size ? distance[i - size] : 0;
      distance[i] = Math.min(left, up) + 1;
    }
  }
  if (!inside.length) throw new Error(`Không vẽ được chữ ${letter}`);
  let deepest = 1;
  for (let k = inside.length - 1; k >= 0; k--) {
    const i = inside[k];
    const right = i % size < size - 1 ? distance[i + 1] : 0;
    const down = i < size * (size - 1) ? distance[i + size] : 0;
    distance[i] = Math.min(distance[i], Math.min(right, down) + 1);
    deepest = Math.max(deepest, distance[i]);
  }

  const points = new Float32Array(count * 3);
  const depth = new Float32Array(count);
  const heat = new Float32Array(count);
  const scale = LETTER_HEIGHT / (size * 0.72);
  for (let i = 0; i < count; i++) {
    const pixel = inside[Math.floor(rand() * inside.length)];
    const px = pixel % size;
    const py = Math.floor(pixel / size);
    // Vài cube bay lệch ra ngoài cho chữ có cảm giác vỡ mảnh.
    const stray = rand() < 0.07 ? 0.5 : 0;
    points[i * 3] = (px - size / 2) * scale + (rand() - 0.5) * stray;
    points[i * 3 + 1] = (size / 2 - py) * scale + (rand() - 0.5) * stray;
    points[i * 3 + 2] = (rand() - 0.5) * 0.55 + (rand() - 0.5) * stray;

    const inner = distance[pixel] / deepest;
    depth[i] = inner;
    // Đỉnh của nhiễu tạo thành các mạch mảnh, chỉ lộ ở phần sâu trong thân chữ.
    const ridge = 1 - Math.abs(valueNoise(px * 0.03 + seed * 7, py * 0.03) * 2 - 1);
    const vein = MathUtils.smoothstep(ridge + valueNoise(px * 0.09, py * 0.09 + seed) * 0.12, 0.8, 1.02);
    heat[i] = vein * MathUtils.smoothstep(inner, 0.12, 0.62);
  }
  return { points, depth, heat };
}

const NOISE_GLSL = /* glsl */ `
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p*=2.03;a*=.5;}return v;}
`;

/** Dải màu lửa: 0 là cam cháy, giữa là vàng thương hiệu, 1 là kem nóng. */
const FIRE_GLSL = /* glsl */ `
vec3 fire(float t){
  vec3 c=mix(vec3(.55,.09,.02),vec3(.93,.33,.03),smoothstep(0.,.33,t));
  c=mix(c,vec3(.92,.67,0.),smoothstep(.3,.58,t));
  c=mix(c,vec3(1.,.86,.48),smoothstep(.55,.82,t));
  return mix(c,vec3(1.,.97,.87),smoothstep(.82,1.,t));
}
`;

function valueNoise(x: number, z: number) {
  const ix = Math.floor(x);
  const iz = Math.floor(z);
  const hash = (i: number, k: number) => {
    const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
    return v - Math.floor(v);
  };
  const fx = MathUtils.smoothstep(x - ix, 0, 1);
  const fz = MathUtils.smoothstep(z - iz, 0, 1);
  return MathUtils.lerp(
    MathUtils.lerp(hash(ix, iz), hash(ix + 1, iz), fx),
    MathUtils.lerp(hash(ix, iz + 1), hash(ix + 1, iz + 1), fx),
    fz,
  );
}

const mound = (x: number, z: number, cx: number, cz: number, rx: number, rz: number, height: number) =>
  height * Math.exp(-(((x - cx) / rx) ** 2) - ((z - cz) / rz) ** 2);

/** Đất lăn tăn quanh camera, càng xa càng lên thành đồi lớn với một đồi trung tâm. */
function terrainHeight(x: number, z: number) {
  const distance = Math.hypot(x, z + 1);
  const swell = MathUtils.smoothstep(distance, 7, 42);
  const rolling =
    0.16 +
    valueNoise(x * 0.07, z * 0.07) * 0.34 +
    valueNoise(x * 0.021 + 3, z * 0.021) * 1.5 * swell +
    valueNoise(x * 0.17, z * 0.17) * 0.12;
  return (
    rolling +
    mound(x, z, 4, -112, 40, 30, 19) +
    mound(x, z, -46, -52, 22, 15, 3.4) +
    mound(x, z, 50, -48, 24, 16, 2.8) +
    mound(x, z, -92, -120, 44, 30, 9) +
    mound(x, z, 104, -128, 46, 30, 8) +
    mound(x, z, -12, -9, 7, 5.5, 1.25) +
    mound(x, z, 13, -10, 7.5, 6, 1.05) +
    mound(x, z, -34, 70, 38, 22, 11) +
    mound(x, z, 38, 76, 42, 24, 9) +
    mound(x, z, -8, 108, 50, 20, 16)
  );
}

function createSky() {
  const material = new ShaderMaterial({
    depthTest: false,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uDark: { value: COLOR.skyDark },
      uBase: { value: COLOR.sky },
      uLift: { value: COLOR.skyLift },
      uMoon: { value: COLOR.moon },
      uMeteors: { value: [new Vector4(), new Vector4()] },
      uMeteorT: { value: [-1, -1] },
    },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main(){
        vec4 view=inverse(projectionMatrix)*vec4(position.xy,1.,1.);
        vDir=transpose(mat3(viewMatrix))*(view.xyz/view.w);
        gl_Position=vec4(position.xy,.9999,1.);
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uDark,uBase,uLift,uMoon;
      uniform vec4 uMeteors[2];
      uniform float uMeteorT[2];
      varying vec3 vDir;
      ${NOISE_GLSL}
      float meteor(vec2 p,vec4 seg,float t){
        if(t<0.||t>1.)return 0.;
        vec2 head=mix(seg.xy,seg.zw,t),tail=mix(seg.xy,seg.zw,max(t-.3,0.));
        vec2 ab=head-tail;
        float h=clamp(dot(p-tail,ab)/max(dot(ab,ab),1e-5),0.,1.);
        float d=length(p-tail-ab*h);
        return smoothstep(.0035,0.,d)*h*h*sin(t*3.1416);
      }
      void main(){
        vec3 d=normalize(vDir);
        float e=d.y,az=atan(d.x,-d.z);
        float haze=fbm(vec2(az*1.2,e*3.)+uTime*.002);
        vec3 c=mix(uDark,uBase,.36+haze*.1+exp(-max(e,0.)*7.)*.22);

        float moon=acos(clamp(dot(d,normalize(vec3(.85,.3,-.42))),-1.,1.));
        c+=uMoon*smoothstep(.05,.046,moon)*.7;

        vec2 p=vec2(az,e);
        c+=vec3(.9,.86,1.)*(meteor(p,uMeteors[0],uMeteorT[0])+meteor(p,uMeteors[1],uMeteorT[1]));

        // Hai lớp đồi tròn rất xa, tạo chiều sâu phía sau cảnh.
        float far=.02+fbm(vec2(az*1.7,1.))*.1;
        c=mix(mix(uDark,uLift,.42),c,smoothstep(far-.003,far+.003,e));
        float near=.008+fbm(vec2(az*2.6,7.))*.055;
        c=mix(mix(uDark,uLift,.55),c,smoothstep(near-.003,near+.003,e));
        gl_FragColor=vec4(c,1.);
      }`,
  });
  const mesh = new Mesh(new PlaneGeometry(2, 2), material);
  mesh.frustumCulled = false;
  mesh.renderOrder = -10;
  return { mesh, material };
}

function createGround(q: Quality) {
  const segments = COUNTS[q].terrain;

  const geometry = new PlaneGeometry(340, 340, segments, segments);
  geometry.rotateX(-Math.PI / 2);
  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i++) {
    position.setY(i, terrainHeight(position.getX(i), position.getZ(i) + CENTER_Z));
  }
  geometry.computeVertexNormals();
  const material = new ShaderMaterial({
    uniforms: { uNear: { value: COLOR.ground }, uFar: { value: COLOR.sky } },
    vertexShader: /* glsl */ `
      varying float vDist,vLight;
      void main(){
        vec4 view=modelViewMatrix*vec4(position,1.);
        vDist=-view.z;
        vLight=.6+.56*max(dot(normal,normalize(vec3(.62,.62,.46))),0.);
        gl_Position=projectionMatrix*view;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uNear,uFar;
      varying float vDist,vLight;
      void main(){
        gl_FragColor=vec4(mix(uNear*vLight*mix(.6,1.,smoothstep(3.,16.,vDist)),uFar,smoothstep(80.,240.,vDist)),1.);
      }`,
  });
  const mesh = new Mesh(geometry, material);
  mesh.position.z = CENTER_Z;
  return { mesh, material };
}

/** Lớp hậu kỳ: threshold nhiều mức tông, ngọn cỏ cháy cam đỏ, quầng lửa bám mép ở nơi chuột vừa đi qua. Alpha .8125 giữ nguyên màu cho lớp sáng của cổng. */
function createThreshold(q: Quality, look: Look, width: number, height: number) {
  const target = new WebGLRenderTarget(width, height, { samples: q === "high" ? 4 : 0 });
  const material = new ShaderMaterial({
    depthTest: false,
    depthWrite: false,
    defines: { TAPS: q === "high" ? 8 : 5 },
    uniforms: {
      uScene: { value: target.texture },
      uTrail: { value: null },
      uPaperLook: { value: look === "paper" ? 1 : 0 },
      uInk: { value: COLOR.ink },
      uPlum: { value: COLOR.plum },
      uPaper: { value: COLOR.paper },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,
    fragmentShader: /* glsl */ `
      uniform sampler2D uScene,uTrail;
      uniform float uPaperLook;
      uniform vec3 uInk,uPlum,uPaper;
      varying vec2 vUv;
      ${NOISE_GLSL}
      ${FIRE_GLSL}
      float v,soft;
      float cut(float a,float b){
        float middle=(a+b)*.5,width=(b-a)*.5+soft;
        return smoothstep(middle-width,middle+width,v);
      }
      float luma(vec2 uv){return dot(texture2D(uScene,uv).rgb,vec3(.299,.587,.114));}
      float smear(vec2 uv,vec2 reach){
        // Lệch mỗi điểm ảnh một chút để quầng mịn, không thành răng lược.
        float jitter=hash(uv*917.)-.5;
        float sum=0.;
        for(int i=-TAPS;i<=TAPS;i++)sum+=luma(uv+(float(i)+jitter)/float(TAPS)*reach);
        return sum/float(2*TAPS+1);
      }
      void main(){
        vec4 scene=texture2D(uScene,vUv);
        // Alpha do cỏ ghi: 1 không phải cỏ, .5 thân cỏ, 0 ngọn cháy.
        float grass=1.-smoothstep(.5,.75,scene.a);
        float raw=dot(scene.rgb,vec3(.299,.587,.114));
        v=raw;
        soft=grass*.05;

        vec3 c;
        float light;
        if(uPaperLook>.5){
          // Trời sáng, mây xám nhạt, đá và chữ tối như mảng mực trên giấy.
          v=mix(v,min(v,.335),1.-step(.99,scene.a)); // Gồm cả mép lá đã khử răng cưa, kẻo sáng quá thành chấm mực.
          light=cut(.075,.1)*(1.-cut(.37,.4));
          c=mix(uInk,uPaper,cut(.075,.1));
          c=mix(c,uPaper*.83,cut(.2,.3));
          c=mix(c,uPlum,cut(.37,.4));
          c=mix(c,uInk,cut(.46,.5));
        }else{
          // Giữ đêm: bốn mức tông để vẫn đọc được mây, đá, cỏ.
          light=1.-cut(.29,.32);
          c=mix(uInk,uPlum*.75,cut(.09,.11));
          c=mix(c,uPlum*1.5,cut(.155,.175));
          c=mix(c,uPaper*.62,cut(.29,.32));
          c=mix(c,uPaper,cut(.46,.5));
        }
        // Vài ngọn cỏ cháy cam đỏ thay vì bị ép thành tím đen.
        c=mix(c,fire(.08+smoothstep(.2,.6,raw)*.34),1.-smoothstep(0.,.5,scene.a));

        // Quầng lửa cũ, nay chỉ sống ở nơi vệt chuột vừa đi qua.
        float trail=texture2D(uTrail,vUv).r;
        if(trail>.02){
          float wide=(smear(vUv,vec2(.045,0.))+smear(vUv,vec2(0.,.07)))*.5;
          float glow=smoothstep(.02,.22,abs(wide-v))*light*smoothstep(.02,.4,trail);
          c=mix(c,fire(glow*.95),smoothstep(0.,.3,glow));
        }
        // Khử răng cưa trộn alpha ở mép lá cỏ theo bội của 1/8, nên dấu của cổng nằm giữa hai bội và phải là vùng phẳng.
        c=mix(c,scene.rgb,step(abs(scene.a-.8125),.008)*step(fwidth(scene.a),.008));
        gl_FragColor=vec4(c,1.);
      }`,
  });
  const scene = new Scene();
  const quad = new Mesh(new PlaneGeometry(2, 2), material);
  quad.frustumCulled = false;
  scene.add(quad);
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  return { target, material, scene, camera, quad };
}

/** Các khối mây lớn ghép từ nhiều cụm lệch nhau, sáng từ trên xuống nên đọc được thể tích. */
function createClouds(q: Quality, rand: () => number) {
  const geometry = new IcosahedronGeometry(1, q === "high" ? 3 : 2);
  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const y = position.getY(i);
    const z = position.getZ(i);
    const k = 0.9 + valueNoise(x * 1.6 + z * 1.9 + 4, y * 2 - z) * 0.2;
    position.setXYZ(i, x * k, y * k, z * k);
  }
  const material = new ShaderMaterial({
    uniforms: {
      uShade: { value: COLOR.sky.clone().multiplyScalar(1.05) },
      uLit: { value: COLOR.skyLift.clone().multiplyScalar(1.12) },
    },
    vertexShader: /* glsl */ `
      varying vec3 vNormal,vWorld;
      void main(){
        vNormal=mat3(instanceMatrix)*normalize(position);
        vec4 world=instanceMatrix*vec4(position,1.);
        vWorld=world.xyz;
        gl_Position=projectionMatrix*viewMatrix*world;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uShade,uLit;
      varying vec3 vNormal,vWorld;
      ${NOISE_GLSL}
      void main(){
        float light=.5+.5*dot(normalize(vNormal),normalize(vec3(.34,.86,.32)));
        light+=(fbm(vWorld.xz*.03+vWorld.y*.04)-.5)*.26;
        gl_FragColor=vec4(mix(uShade,uLit,smoothstep(.54,1.02,light)),1.);
      }`,
  });

  // x, y, z, rộng, cao, số cụm: khối lớn nhất ở giữa, các khối nhỏ dạt ra hai bên.
  const masses = [
    [24, 4, -190, 92, 66, 120],
    [-132, 2, -160, 74, 26, 60],
    [-205, 0, -92, 58, 34, 36],
    [138, 2, -168, 82, 44, 64],
    [212, 0, -84, 54, 30, 32],
    [-58, 1, -150, 48, 15, 26],
    [64, 1, -146, 52, 16, 26],
    [-30, 4, 190, 110, 60, 90],
    [130, 2, 150, 70, 30, 40],
    [-160, 2, 140, 70, 34, 44],
  ];
  const count = masses.reduce((sum, mass) => sum + mass[5], 0);
  const mesh = new InstancedMesh(geometry, material, count);
  const dummy = new Object3D();
  let index = 0;
  for (const [x, y, z, width, height, lumps] of masses) {
    for (let i = 0; i < lumps; i++) {
      const u = (rand() - 0.5) * 2;
      const crown = 1 - Math.abs(u) ** 1.6;
      const rise = Math.pow(rand(), 1.3);
      // Cụm lớn làm thân, càng lên đỉnh cụm càng nhỏ để viền trên mây bồng lên.
      const size = (0.3 + crown * 0.5) * (0.6 + rand() * 0.75) * height * 0.42 * (1 - rise * 0.35);
      dummy.position.set(x + u * width, y + rise * height * (0.2 + crown * 0.8), z + (rand() - 0.5) * width * 0.45);
      dummy.scale.set(size * (1.05 + rand() * 0.3), size * (0.86 + rand() * 0.16), size);
      // Chỉ xoay quanh trục đứng, xoay nghiêng sẽ làm mây thành mảnh chéo.
      dummy.rotation.set(0, rand() * 6.28, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(index++, dummy.matrix);
    }
  }
  mesh.frustumCulled = false;
  return { mesh, material };
}

/** Các cụm đá hữu cơ, tạo điểm tựa cho bố cục. */
function createLandmarks(rand: () => number) {
  const material = new MeshBasicMaterial({ color: COLOR.rock });
  const rockGeometry = new IcosahedronGeometry(1, 4);
  const position = rockGeometry.attributes.position;
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const y = position.getY(i);
    const z = position.getZ(i);
    // Lệch theo tọa độ, các đỉnh trùng nhau lệch như nhau nên khối đá không hở.
    const k = 0.72 + valueNoise(x * 1.7 + z * 2.3 + 9, y * 2.1 - z) * 0.56;
    position.setXYZ(i, x * k, y * k, z * k);
  }
  const dummy = new Object3D();
  const formations = [
    [-21, -30, 1.5, 2.5, 1.4, -0.18],
    [-24.5, -32, 2.4, 2, 2, 0.1],
    [-18, -33, 1.1, 1.7, 1.2, 0.2],
    [-27, -27, 1.3, 1.5, 1.1, -0.1],
    [-33, -46, 2.8, 3, 2.2, 0.14],
    [-13, -48, 1.2, 2.2, 1.2, -0.2],
    [52, -66, 2.4, 3.8, 2, 0.12],
    [-22, 24, 2, 3, 1.8, 0.1],
    [-26, 27, 1.3, 1.8, 1.4, -0.15],
    [24, 30, 2.2, 2.6, 2, 0.12],
    [19, 28, 1.2, 1.6, 1.1, -0.1],
  ];
  const rocks = new InstancedMesh(rockGeometry, material, formations.length);
  formations.forEach(([x, z, sx, sy, sz, lean], i) => {
    dummy.position.set(x, terrainHeight(x, z) + sy * 0.3, z);
    dummy.scale.set(sx, sy, sz);
    dummy.rotation.set(0, rand() * Math.PI, lean);
    dummy.updateMatrix();
    rocks.setMatrixAt(i, dummy.matrix);
  });
  rocks.frustumCulled = false;

  return { rocks };
}

function createGrass(q: Quality, rand: () => number) {
  const { grass } = COUNTS[q];
  const rows = q === "high" ? 5 : 3;
  const vertices: number[] = [];
  const index: number[] = [];
  for (let r = 0; r <= rows; r++) vertices.push(-0.5, r / rows, 0, 0.5, r / rows, 0);
  for (let r = 0; r < rows; r++) {
    const a = r * 2;
    index.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }

  const geometry = new InstancedBufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(new Float32Array(vertices), 3));
  geometry.setIndex(index);
  const offset = new Float32Array(grass * 4);
  const shape = new Float32Array(grass * 3);
  const seed = new Float32Array(grass);
  const tone = new Float32Array(grass);
  for (let i = 0; i < grass; i++) {
    let x = 0;
    let z = 0;
    // Thử vài lần để cỏ tụ thành mảng, có chỗ dày chỗ thưa.
    const behind = i % 4 === 0; // Một phần tư lá cỏ trải về phía sau cho vòng bay.
    for (let tries = 0; tries < 4; tries++) {
      z = behind ? 4 + Math.pow(rand(), 1.6) * 36 : 4 - Math.pow(rand(), 2.2) * 70;
      x = (rand() - 0.5) * (behind ? 40 + z * 3.2 : 18 + Math.abs(z) * 2.8);
      if (valueNoise(x * 0.24, z * 0.24) > rand() * 0.8) break;
    }
    const patch = valueNoise(x * 0.09 + 11, z * 0.09);
    const scale = 1 + Math.abs(z) * 0.05;
    const height = (0.11 + Math.pow(rand(), 2) * 0.27) * (0.7 + patch * 0.6) * scale;
    const width = (0.016 + Math.pow(rand(), 2) * 0.03) * scale;
    offset.set([x, z, rand() * Math.PI, terrainHeight(x, z)], i * 4);
    shape.set([height, width, (rand() - 0.5) * 1.5], i * 3);
    seed[i] = rand();
    tone[i] = patch;
  }
  geometry.setAttribute("aOffset", new InstancedBufferAttribute(offset, 4));
  geometry.setAttribute("aShape", new InstancedBufferAttribute(shape, 3));
  geometry.setAttribute("aSeed", new InstancedBufferAttribute(seed, 1));
  geometry.setAttribute("aTone", new InstancedBufferAttribute(tone, 1));
  geometry.instanceCount = grass;

  const material = new ShaderMaterial({
    side: DoubleSide,
    uniforms: {
      uTime: { value: 0 },
      uRoot: { value: COLOR.ground },
      uTip: { value: COLOR.grassTip },
      uFar: { value: COLOR.sky },
      uSmoke: { value: null },
      uPointerX: { value: 0.5 },
      uRight: { value: new Vector2(1, 0) },
    },
    vertexShader: /* glsl */ `
      attribute vec4 aOffset;
      attribute vec3 aShape;
      attribute float aSeed,aTone;
      uniform float uTime,uPointerX;
      uniform vec2 uRight;
      uniform sampler2D uSmoke;
      varying float vH,vTone,vDist,vLit,vGust,vSeed;
      void main(){
        float h=position.y;
        float w=position.x*aShape.y*(1.-h*h*.9);
        float c=cos(aOffset.z),s=sin(aOffset.z);
        vec3 p=vec3(w*c,h*aShape.x,w*s);
        vec2 b=aOffset.xy;
        float wave=sin(b.x*.17+uTime*.55)+sin(b.y*.21-uTime*.4+1.7)+sin((b.x+b.y)*.07+uTime*.23);
        float gust=pow(.5+wave/6.,2.)*1.5;
        float sway=sin(uTime*1.15+aSeed*6.28+b.x*.5)*.13;
        float tip=sin(uTime*3.3+aSeed*40.)*.05*h;
        float bend=(aShape.z+gust+sway+tip)*h*h*aShape.x*.62;
        p.x+=bend;
        p.z+=bend*.35;

        // Vệt chuột đi qua thì cỏ rẽ sang hai bên, vệt tan thì cỏ từ từ đứng dậy.
        vec4 base=projectionMatrix*modelViewMatrix*vec4(b.x,aOffset.w,b.y,1.);
        if(base.w>0.){
          vec2 uv=base.xy/base.w*.5+.5;
          float trail=texture2D(uSmoke,uv).r;
          float side=clamp((uv.x-uPointerX)*14.,-1.,1.);
          p.xz+=uRight*side*trail*h*h*aShape.x*1.5;
          p.y*=1.-trail*.5;
        }
        vec4 view=modelViewMatrix*vec4(b.x+p.x,p.y+aOffset.w,b.y+p.z,1.);
        vH=h;vTone=aTone;vDist=-view.z;
        // Lá quay về phía ánh sáng thì sáng hơn, gió lướt qua thì ánh lên thành dải.
        vSeed=aSeed;
        vLit=.5+.5*cos(aOffset.z-.7);
        vGust=gust;
        gl_Position=projectionMatrix*view;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uRoot,uTip,uFar;
      varying float vH,vTone,vDist,vLit,vGust,vSeed;
      void main(){
        vec3 c=mix(uRoot,uTip*(.7+vTone*.42),pow(vH,1.3));
        c*=.76+vLit*.36;
        c+=uTip*vGust*vH*vH*.14;
        c*=mix(.42,1.,smoothstep(2.,12.,vDist));
        c=mix(c,uFar*1.25,smoothstep(16.,70.,vDist));
        // Chỉ phần ngọn của một số lá theo từng mảng mới cháy, gần camera thì rõ, xa thì tắt.
        float pick=smoothstep(.56,.66,vTone*.62+vSeed*.62);
        float tip=smoothstep(.7,.96,vH)*pick*smoothstep(44.,20.,vDist);
        gl_FragColor=vec4(c,.5*(1.-tip));
      }`,
  });
  const mesh = new Mesh(geometry, material);
  mesh.frustumCulled = false;
  return { mesh, material };
}

/** Cổng đá: các viên bay về xếp từng viên một, hai cánh mở ra, bên trong là lớp sáng dịch chuyển. */
function createGate(rand: () => number, look: Look) {
  const material = new ShaderMaterial({
    vertexShader: /* glsl */ `
      varying vec3 vNormal,vWorld;
      varying float vTone;
      void main(){
        mat4 m=modelMatrix*instanceMatrix;
        vNormal=normalize(mat3(m)*normal);
        vec4 world=m*vec4(position,1.);
        vWorld=world.xyz;
        vTone=instanceColor.r;
        gl_Position=projectionMatrix*viewMatrix*world;
      }`,
    fragmentShader: /* glsl */ `
      varying vec3 vNormal,vWorld;
      varying float vTone;
      ${NOISE_GLSL}
      void main(){
        float d=max(dot(vNormal,normalize(vec3(.55,.62,.56))),0.);
        float t=fbm(vWorld.xy*.42+vWorld.z*.3);
        float l=.035+d*.42*(.55+t*.95)+max(vNormal.y,0.)*.14+smoothstep(0.,16.,vWorld.y)*.05;
        gl_FragColor=vec4(vec3(1.02,.9,1.14)*l*vTone,1.);
      }`,
  });
  type Part = { x: number; y: number; z: number; w: number; h: number; d: number; ry: number; rz: number; tone: number };
  const part = (x: number, y: number, z: number, w: number, h: number, d: number, ry = 0, rz = 0, tone = 1): Part => ({ x, y, z, w, h, d, ry, rz, tone });
  const dummy = new Object3D();
  const instance = (parts: Part[]) => {
    const mesh = new InstancedMesh(new BoxGeometry(1, 1, 1), material, parts.length);
    const tone = new Color();
    parts.forEach((p, i) => {
      dummy.position.set(p.x, p.y, p.z);
      dummy.rotation.set(0, p.ry, p.rz);
      dummy.scale.set(p.w, p.h, p.d);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, tone.setScalar(p.tone));
    });
    mesh.frustumCulled = false;
    return mesh;
  };

  // Hai trụ xếp xen kẽ trái phải từ dưới lên, rồi đến xà và nét khắc.
  const parts: Part[] = [];
  let y = 0;
  ([[3.3, 2.3, 3.2, 0.06], [2.9, 3, 2.8, -0.05], [2.7, 2.7, 2.7, 0.08], [2.95, 2.5, 2.9, -0.03], [3.2, 1.4, 3.1, 0.04]] as const).forEach(([w, h, d, ry], i) => {
    for (const side of [-1, 1]) {
      parts.push(part(side * (4.05 + (i % 2 ? 0.12 : -0.1)), y + h / 2, 0, w, h, d, ry, (i % 2 ? 0.012 : -0.008) * side));
    }
    y += h + 0.05;
  });
  parts.push(part(0, 12.9, 0, 12.6, 1.7, 3.5, 0.015, 0.012, 1.08), part(0.3, 14.15, 0, 9.2, 0.85, 2.9, -0.02, -0.01, 1.08), part(-0.5, 14.95, 0.1, 3.4, 0.75, 2.1, 0.05, 0.02, 1.08));
  for (let i = -4; i <= 4; i++) {
    if (i) parts.push(part(i * 1.15, 12.9, 1.77, 0.34, 0.8, 0.05, 0, i % 2 ? 0.78 : 0, 0.45));
  }
  parts.push(part(0, 12.9, 1.77, 0.9, 0.9, 0.05, 0, 0.78, 1.7));
  const stones = instance(parts);
  const flights = parts.map(() => ({ x: (rand() - 0.5) * 10, y: 16 + rand() * 10, z: (rand() - 0.5) * 8, spin: (rand() - 0.5) * 3 }));

  const root = new Object3D();
  root.position.set(0, terrainHeight(0, GATE_Z) - 0.3, GATE_Z);
  root.add(stones);
  root.visible = false;

  const doors = [-1, 1].map((side) => {
    const panel = [part(-side * 1.31, 5.9, 0, 2.62, 11.8, 0.7, 0, 0, 0.92), part(-side * 1.9, 5.9, 0.38, 0.08, 10.2, 0.04, 0, 0, 0.5)];
    for (let j = 0; j < 5; j++) panel.push(part(-side * 1.31, 1.6 + j * 2.15, 0.38, 1.7, j % 2 ? 0.11 : 0.08, 0.04, 0, 0, 0.5));
    const pivot = instance(panel);
    pivot.position.set(side * 2.62, 0, 0.25);
    root.add(pivot);
    return { pivot, side };
  });

  const crack = new Mesh(
    new PlaneGeometry(1, 11.6),
    new ShaderMaterial({
      vertexShader: /* glsl */ `void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
      fragmentShader: /* glsl */ `void main(){gl_FragColor=vec4(1.,.62,.3,.8125);}`,
    }),
  );
  crack.position.set(0, 5.9, 0.64);
  root.add(crack);

  const portalMaterial = new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uCore: { value: 0 },
      uInk: { value: look === "night" ? COLOR.ink : COLOR.paper },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: /* glsl */ `
      uniform float uTime,uCore;
      uniform vec3 uInk;
      varying vec2 vUv;
      ${NOISE_GLSL}
      ${FIRE_GLSL}
      void main(){
        vec2 p=(vUv-.5)*vec2(5.3,11.9);
        float flow=fbm(vec2(p.x*.7,p.y*.3-uTime*.28));
        float veil=fbm(p*.45+vec2(uTime*.08,-uTime*.2)+flow*2.2);
        // Cánh cửa mở che bớt hai bên nên đo rìa theo khe thật.
        float edge=1.-max(abs(p.x)/2.25,abs(p.y)/5.9);
        float glow=smoothstep(0.,.75,edge);
        float shaft=smoothstep(.42,.72,fbm(vec2(p.x*2.2,p.y*.16+uTime*.35)));
        // Tím đậm ở rìa, ngọc tím ở giữa, lõi trắng và các dải sáng chạy dọc.
        vec3 c=mix(vec3(.3,.13,.62),vec3(.66,.5,1.),smoothstep(.1,.62,veil+glow*.32));
        c=mix(c,vec3(1.,.95,.88),smoothstep(.56,1.05,glow*.72+veil*.6));
        c+=vec3(.3,.24,.36)*shaft*(.35+glow*.5);
        // Một lớp cam đỏ mỏng sát khung đá.
        c=mix(fire(.26+veil*.3),c,smoothstep(.02,.1,edge));
        // Lõi tối nở ra như đĩa đen của emotion, mang viền trắng và cam đỏ, rồi thành nền section.
        float d=length(p*vec2(1.,.62))+(fbm(p*.9+uTime*.2)-.5)*.6;
        float r=uCore*9.6-1.1;
        c=mix(c,fire(.32),smoothstep(r+1.,r+.8,d));
        c=mix(c,vec3(.95,.92,.93),smoothstep(r+.8,r+.6,d));
        c=mix(c,uInk,smoothstep(r+.3,r-.15,d));
        gl_FragColor=vec4(c,.8125);
      }`,
  });
  const portal = new Mesh(new PlaneGeometry(5.3, 11.9), portalMaterial);
  portal.position.set(0, 5.95, -0.5);
  root.add(portal);

  let builtAt = -1;
  function update(build: number, ready: number, open: number, core: number) {
    root.visible = build > 0;
    crack.visible = ready > 0 && open < 0.03;
    crack.scale.x = 0.05 + ready * 0.12;
    portal.visible = open > 0;
    portalMaterial.uniforms.uCore.value = core;
    // Hai cánh trồi lên cuối cùng rồi quay ra phía camera.
    const rise = MathUtils.smoothstep(build, 0.84, 1);
    doors.forEach(({ pivot, side }) => {
      pivot.visible = rise > 0;
      pivot.position.y = (rise - 1) * 12.6;
      pivot.rotation.y = -side * open * 1.5;
    });
    if (build === builtAt) return;
    builtAt = build;
    const span = 0.26; // Mỗi viên bay trong một phần tư chặng, viên sau nối ngay viên trước.
    parts.forEach((p, i) => {
      const t = MathUtils.clamp((build * 0.84 - (i / parts.length) * (0.84 - span)) / span, 0, 1);
      const away = (1 - t) ** 3;
      const fly = flights[i];
      dummy.position.set(p.x + fly.x * away, p.y + fly.y * away, p.z + fly.z * away);
      dummy.rotation.set(fly.spin * away, p.ry + fly.spin * away, p.rz + fly.spin * away * 0.6);
      dummy.scale.set(p.w, p.h, p.d).multiplyScalar(t > 0 ? 1 : 0);
      dummy.updateMatrix();
      stones.setMatrixAt(i, dummy.matrix);
    });
    stones.instanceMatrix.needsUpdate = true;
  }
  return { root, portalMaterial, update };
}

/** Khối cube biến thành D, E, M, I. uMorph chạy từ 0 đến 3. */
function createLetters(q: Quality, rand: () => number, look: Look) {
  const { cubes } = COUNTS[q];
  const box = new BoxGeometry(1, 1, 1);
  const geometry = new InstancedBufferGeometry();
  geometry.index = box.index;
  geometry.setAttribute("position", box.attributes.position);
  geometry.setAttribute("normal", box.attributes.normal);

  const depth = new Float32Array(cubes * 4);
  const heat = new Float32Array(cubes * 4);
  LETTERS.forEach((letter, n) => {
    const sample = sampleLetter(letter, cubes, rand, n + 1);
    geometry.setAttribute(`aT${n}`, new InstancedBufferAttribute(sample.points, 3));
    for (let i = 0; i < cubes; i++) {
      depth[i * 4 + n] = sample.depth[i];
      heat[i * 4 + n] = sample.heat[i];
    }
  });
  const random = new Float32Array(cubes * 4);
  for (let i = 0; i < random.length; i++) random[i] = rand();
  geometry.setAttribute("aRnd", new InstancedBufferAttribute(random, 4));
  geometry.setAttribute("aDepth", new InstancedBufferAttribute(depth, 4));
  geometry.setAttribute("aHeat", new InstancedBufferAttribute(heat, 4));
  geometry.instanceCount = cubes;

  const material = new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uMorph: { value: 0 },
      uOrigin: { value: new Vector3() },
      uBlastT: { value: 0 },
      uBlastOn: { value: 0 },
      uCharge: { value: 0 },
      uField: { value: new Vector3() },
      uFieldOn: { value: 0 },
      uDrag: { value: new Vector2() },
      uDark: { value: look === "night" ? COLOR.violetGlow : COLOR.violet },
      uLight: { value: look === "night" ? COLOR.lilacGlow : COLOR.lilac },
    },
    vertexShader: /* glsl */ `
      attribute vec3 aT0,aT1,aT2,aT3;
      attribute vec4 aRnd,aDepth,aHeat;
      uniform float uTime,uMorph,uBlastT,uBlastOn,uCharge,uFieldOn;
      uniform vec3 uOrigin,uField;
      uniform vec2 uDrag;
      varying float vShade,vRnd,vEmber,vTemp;
      vec3 spin(vec3 v,vec3 k,float a){float c=cos(a),s=sin(a);return v*c+cross(k,v)*s+k*dot(k,v)*(1.-c);}
      void main(){
        float m=clamp(uMorph,0.,3.),i=floor(m),f=m-i;
        int n=int(i),next=min(n+1,3);
        float t=smoothstep(aRnd.x*.42,aRnd.x*.42+.58,f);
        vec3 a=i<.5?aT0:i<1.5?aT1:i<2.5?aT2:aT3;
        vec3 b=i<.5?aT1:i<1.5?aT2:aT3;
        vec3 c=mix(a,b,t);
        float depth=mix(aDepth[n],aDepth[next],t);
        float heat=mix(aHeat[n],aHeat[next],t);
        float travel=sin(t*3.1416);
        c+=(aRnd.yzw-.5)*travel*2.8;

        // Vỏ trôi chậm theo sóng liền nhau, lõi rung nhanh và càng gần chuột càng căng.
        vec3 wave=c*1.6;
        vec3 drift=vec3(sin(wave.y+uTime*.5+aRnd.x*1.6),sin(wave.z*1.3+uTime*.43+aRnd.y*1.6),sin(wave.x+uTime*.37+aRnd.z*1.6));
        c+=drift*(.016+aRnd.w*.02)*(1.25-depth);
        vec3 shake=vec3(sin(uTime*(11.+aRnd.x*6.)+aRnd.y*40.),sin(uTime*(13.+aRnd.y*5.)+aRnd.z*40.),sin(uTime*(12.+aRnd.z*7.)+aRnd.x*40.));
        c+=shake*depth*depth*(.013+uCharge*.05);

        // Trường lực quanh chuột: đẩy nhẹ và kéo theo hướng chuột, tắt dần khi chuột rời đi.
        vec2 field=c.xy-uField.xy;
        float g=exp(-dot(field,field)/.55)*uFieldOn;
        c.xy+=normalize(field+1e-4)*g*.15+uDrag*g;
        c.z+=(aRnd.w-.5)*g*.25;

        // Nổ lan từ điểm chạm. Mỗi cube có tiến trình về nhà riêng, vị trí và màu cùng đi theo nó.
        float age=max(uBlastT-length(c.xy-uOrigin.xy)/3.4-aRnd.x*.14,0.);
        float ignite=smoothstep(0.,.08,age);
        float home=smoothstep(aRnd.x*.35,aRnd.x*.35+.65,1.-uBlastOn);
        float away=ignite*(1.-home);
        vec3 dir=normalize(aRnd.xyz-.5+normalize(c-uOrigin+1e-3)*.7);
        vec3 swirl=vec3(sin(c.y*2.+uTime*.7+aRnd.x*6.),sin(c.z*2.+uTime*.6+aRnd.y*6.),cos(c.x*2.+uTime*.5+aRnd.z*6.));
        c+=(dir*(1.+aRnd.w*2.1)*(1.-exp(-age*1.7))+swirl*(1.-exp(-age*.8))*.4+vec3(0.,.3,0.)*(1.-exp(-age*.4)))*away;

        // Nhiệt: nóng khi nổ, nguội dần khi về; hạt đang bay giữa hai chữ cũng nóng rồi nguội.
        vTemp=max(smoothstep(.1,1.1,age)*away,travel*(.4+aRnd.w*.6));
        vEmber=heat*(.55+.45*sin(uTime*(1.1+aRnd.w*1.8)+aRnd.y*30.))*(1.+uCharge*.9);

        vec3 axis=normalize(aRnd.xyz-.5+1e-3);
        float angle=uTime*(.2+aRnd.w*(.5+away*5.))+aRnd.y*6.28;
        vec3 n3=spin(normal,axis,angle);
        vec3 p=spin(position,axis,angle)*mix(.022+aRnd.z*.02,.01+aRnd.z*.016,away);
        vShade=.5+.5*dot(n3,normalize(vec3(.35,.8,.5)));
        vRnd=aRnd.x;
        gl_Position=projectionMatrix*modelViewMatrix*vec4(c+p,1.);
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uDark,uLight;
      varying float vShade,vRnd,vEmber,vTemp;
      ${FIRE_GLSL}
      void main(){
        vec3 rock=mix(uDark,uLight,vShade*vShade)*(.7+vShade*.7);
        vec3 c=mix(rock,fire(.1+vEmber*.5),clamp(vEmber,0.,1.));
        float twinkle=pow(.5+.5*sin(uTime*(3.+vRnd*7.)+vRnd*80.),6.);
        vec3 hot=fire(fract(vRnd*17.)*.72+twinkle*.28)*(.8+vShade*.5+twinkle*.9);
        gl_FragColor=vec4(mix(c,hot,vTemp),1.);
      }`,
  });
  const mesh = new Mesh(geometry, material);
  mesh.frustumCulled = false;
  mesh.position.copy(LETTER_ANCHOR);
  return { mesh, material, parts: [box] };
}

function pointsGeometry(count: number, fill: (i: number, p: Float32Array, s: Float32Array) => void) {
  const position = new Float32Array(count * 3);
  const seed = new Float32Array(count * 2);
  for (let i = 0; i < count; i++) fill(i, position, seed);
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(position, 3));
  geometry.setAttribute("aSeed", new BufferAttribute(seed, 2));
  return geometry;
}

function createStars(q: Quality, rand: () => number, dpr: number) {
  const geometry = pointsGeometry(COUNTS[q].stars, (i, p, s) => {
    const az = (rand() - 0.5) * 4;
    const el = 0.09 + Math.pow(rand(), 0.7) * 1.05;
    p.set([Math.sin(az) * Math.cos(el) * 120, Math.sin(el) * 120, -Math.cos(az) * Math.cos(el) * 120], i * 3);
    s.set([rand(), rand()], i * 2);
  });
  const material = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uDpr: { value: dpr }, uGold: { value: COLOR.gold }, uWhite: { value: COLOR.mist } },
    vertexShader: /* glsl */ `
      attribute vec2 aSeed;
      uniform float uTime,uDpr;
      varying vec2 vSeed;
      varying float vLight;
      void main(){
        vSeed=aSeed;
        float twinkle=aSeed.y>.82?.65+.35*sin(uTime*(1.+aSeed.x*2.)+aSeed.y*50.):1.;
        vLight=(.3+aSeed.x*.7)*twinkle;
        gl_PointSize=(1.+aSeed.x*aSeed.x*2.6)*uDpr;
        gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uGold,uWhite;
      varying vec2 vSeed;
      varying float vLight;
      void main(){
        float a=smoothstep(.5,.1,length(gl_PointCoord-.5));
        gl_FragColor=vec4((vSeed.y>.96?uGold:mix(uWhite,vec3(.8,.4,1.),vSeed.x))*a*vLight,1.);
      }`,
  });
  const points = new Points(geometry, material);
  points.frustumCulled = false;
  points.renderOrder = 1;
  return { points, material };
}

function createEmbers(q: Quality, rand: () => number, dpr: number, blending: Blending) {
  const geometry = pointsGeometry(COUNTS[q].embers, (i, p, s) => {
    const z = -2 - rand() * 24;
    p.set([(rand() - 0.5) * (8 + Math.abs(z) * 1.5), rand() * 3, z], i * 3);
    s.set([rand(), rand()], i * 2);
  });
  const material = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending,
    uniforms: { uTime: { value: 0 }, uDpr: { value: dpr } },
    vertexShader: /* glsl */ `
      attribute vec2 aSeed;
      uniform float uTime,uDpr;
      varying float vLight,vHeat;
      void main(){
        vHeat=aSeed.x;
        vec3 p=position;
        float life=fract(p.y/3.+uTime*(.018+aSeed.x*.03));
        p.y=life*3.2;
        p.x+=sin(uTime*.4+aSeed.y*20.)*.35;
        vLight=sin(life*3.1416)*(.6+.4*sin(uTime*4.+aSeed.x*60.));
        vec4 view=modelViewMatrix*vec4(p,1.);
        gl_PointSize=(5.+aSeed.y*9.)*uDpr*(9./max(-view.z,3.));
        gl_Position=projectionMatrix*view;
      }`,
    fragmentShader: /* glsl */ `
      varying float vLight,vHeat;
      ${FIRE_GLSL}
      void main(){
        float a=smoothstep(.5,0.,length(gl_PointCoord-.5));
        gl_FragColor=vec4(fire(vHeat*.6+a*.4),a*a*vLight);
      }`,
  });
  const points = new Points(geometry, material);
  points.frustumCulled = false;
  points.renderOrder = 5;
  return { points, material };
}

/** Vệt khói: vẽ lên một texture nhỏ, mỗi khung hình trôi và phai đi một chút. */
function createSmoke(q: Quality, aspect: number, blending: Blending) {
  const height = COUNTS[q].smoke;
  const make = () => new WebGLRenderTarget(Math.round(height * aspect), height, { depthBuffer: false });
  let targets = [make(), make()];

  const feedback = new ShaderMaterial({
    depthTest: false,
    depthWrite: false,
    uniforms: {
      uPrev: { value: null },
      uTime: { value: 0 },
      uDecay: { value: 0.97 },
      uFrom: { value: new Vector2() },
      uTo: { value: new Vector2() },
      uAspect: { value: aspect },
      uStrength: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,
    fragmentShader: /* glsl */ `
      uniform sampler2D uPrev;
      uniform float uTime,uDecay,uAspect,uStrength;
      uniform vec2 uFrom,uTo;
      varying vec2 vUv;
      ${NOISE_GLSL}
      void main(){
        vec2 q=vUv*5.+uTime*.12;
        vec2 flow=vec2(noise(q)-.5,noise(q+7.3)-.5)*.006+vec2(0.,-.0006);
        vec2 uv=vUv-flow;
        vec2 e=vec2(.0035/uAspect,.0035);
        float c=(texture2D(uPrev,uv+e.xy).r+texture2D(uPrev,uv-e.xy).r+
          texture2D(uPrev,uv+vec2(e.x,-e.y)).r+texture2D(uPrev,uv+vec2(-e.x,e.y)).r)*.25;
        c=max(c*uDecay-.003,0.);
        vec2 p=vUv*vec2(uAspect,1.),a=uFrom*vec2(uAspect,1.),ab=(uTo-uFrom)*vec2(uAspect,1.);
        float h=clamp(dot(p-a,ab)/max(dot(ab,ab),1e-6),0.,1.);
        float stamp=smoothstep(.075,0.,length(p-a-ab*h))*uStrength;
        gl_FragColor=vec4(vec3(c+stamp*(1.-c)),1.);
      }`,
  });
  const quadScene = new Scene();
  const quad = new Mesh(new PlaneGeometry(2, 2), feedback);
  quad.frustumCulled = false;
  quadScene.add(quad);
  const quadCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const overlay = new ShaderMaterial({
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending,
    uniforms: { uSmoke: { value: null } },
    vertexShader: feedback.vertexShader,
    fragmentShader: /* glsl */ `
      uniform sampler2D uSmoke;
      varying vec2 vUv;
      ${FIRE_GLSL}
      void main(){
        float a=texture2D(uSmoke,vUv).r;
        gl_FragColor=vec4(fire(a*.85+.08),a*.18);
      }`,
  });
  const mesh = new Mesh(new PlaneGeometry(2, 2), overlay);
  mesh.frustumCulled = false;
  mesh.renderOrder = 999;

  return {
    mesh,
    feedback,
    overlay,
    quad,
    resize(next: number) {
      feedback.uniforms.uAspect.value = next;
      targets.forEach((t) => t.setSize(Math.round(height * next), height));
    },
    step(renderer: WebGLRenderer) {
      feedback.uniforms.uPrev.value = targets[0].texture;
      renderer.setRenderTarget(targets[1]);
      renderer.render(quadScene, quadCamera);
      renderer.setRenderTarget(null);
      overlay.uniforms.uSmoke.value = targets[1].texture;
      targets = [targets[1], targets[0]];
    },
    dispose: () => targets.forEach((t) => t.dispose()),
  };
}

/** Điểm chuột chiếu lên mặt phẳng chữ, tính trong hệ tọa độ của chữ. */
function pointerOnLetter(camera: Camera, ndc: Vector2, letter: Mesh, out: Vector3, origin: Vector3) {
  letter.worldToLocal(out.set(ndc.x, ndc.y, 0.5).unproject(camera));
  letter.worldToLocal(origin.copy(camera.position));
  out.sub(origin);
  return out.multiplyScalar(-origin.z / out.z).add(origin);
}

export function createMeadow(canvas: HTMLCanvasElement, quality: Quality, animate: boolean, look: Look) {
  const renderer = new WebGLRenderer({ canvas, antialias: quality === "high", powerPreference: "high-performance" });
  renderer.outputColorSpace = LinearSRGBColorSpace;
  let dpr = Math.min(devicePixelRatio, COUNTS[quality].dpr);
  renderer.setPixelRatio(dpr);

  const rand = seeded(26);
  const scene = new Scene();
  const camera = new PerspectiveCamera(46, 1, 0.1, 600);

  const sky = createSky();
  const ground = createGround(quality);
  const clouds = createClouds(quality, rand);
  const landmarks = createLandmarks(rand);
  const grass = createGrass(quality, rand);
  const blending = look === "night" ? AdditiveBlending : NormalBlending;
  const letters = createLetters(quality, rand, look);
  const stars = createStars(quality, rand, dpr);
  const embers = createEmbers(quality, rand, dpr, blending);
  const smoke = createSmoke(quality, canvas.clientWidth / Math.max(canvas.clientHeight, 1), blending);
  const threshold = createThreshold(quality, look, canvas.width, canvas.height);
  const gate = createGate(rand, look);
  // Camera đi vào đúng tâm lớp sáng để lõi tối nở ở giữa màn hình.
  GATE_END.y = GATE_THROUGH.y = gate.root.position.y + 5.95;
  scene.add(sky.mesh, clouds.mesh, ground.mesh, landmarks.rocks, gate.root, grass.mesh, stars.points);
  // Chữ, khói và lửa vẽ sau threshold để giữ nguyên nét và màu, chỉ phong cảnh đi qua hậu kỳ.
  const overlay = new Scene();
  overlay.add(letters.mesh, smoke.mesh, embers.points);

  const timed = [sky.material, grass.material, letters.material, stars.material, embers.material, smoke.feedback, gate.portalMaterial];
  const pointer = { target: new Vector2(), smooth: new Vector2(), velocity: new Vector2(), prevUv: new Vector2(), uv: new Vector2(), on: 0, onTarget: 0 };
  const world = new Vector3();
  const origin = new Vector3();
  const blast = { live: false, start: 0, amount: 0, charge: 0 };
  const field = new Vector3();

  /** Lò xo tắt dần tới hạn, cùng một kết quả ở mọi tốc độ khung hình. */
  function followPointer(axis: "x" | "y", delta: number) {
    const stiffness = 9;
    const x = stiffness * delta;
    const decay = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
    const offset = pointer.smooth[axis] - pointer.target[axis];
    const push = (pointer.velocity[axis] + stiffness * offset) * delta;
    pointer.velocity[axis] = (pointer.velocity[axis] - stiffness * push) * decay;
    pointer.smooth[axis] = pointer.target[axis] + (offset + push) * decay;
  }
  let morph = 0;
  let journey = 0;
  let viewAngle = 0;
  let flown = 0;
  const lookPoint = new Vector3();

  /** Vị trí camera chỉ phụ thuộc vào thanh cuộn nên cuộn ngược là chạy lùi đúng đường cũ. */
  function moveCamera(delta: number) {
    // Làm mượt tiến trình chứ không làm mượt vị trí, nên cuộn nhanh camera vẫn đi trên đường vòng.
    flown += (journey - flown) * (animate ? 1 - Math.exp(-delta * 6) : 1);
    const orbit = Math.min(flown, 3);
    const stop = Math.min(Math.floor(orbit), 2);
    const part = orbit - stop;
    // Chậm lại ở mỗi chữ nhưng không dừng hẳn.
    const eased = MathUtils.lerp(part, MathUtils.smoothstep(part, 0.2, 0.8), 0.7);
    const focus = MathUtils.smoothstep(flown, 3, DOORS[0]);
    viewAngle = (stop + eased) * ORBIT_STEP + focus * 0.2;
    const radius = MathUtils.lerp(ORBIT[stop].radius, ORBIT[stop + 1].radius, eased) + focus * 0.8;
    const x = Math.sin(viewAngle) * radius;
    const z = CAMERA_TARGET.z + Math.cos(viewAngle) * radius;
    const height = MathUtils.lerp(ORBIT[stop].height, ORBIT[stop + 1].height, eased) + focus * 0.6;
    camera.position.set(x, Math.max(height, terrainHeight(x, z) + 1), z);
    lookPoint.lerpVectors(CAMERA_TARGET, GATE_LOOK, focus);
    const approach = MathUtils.smoothstep(flown, DOORS[0], JOURNEY_END);
    camera.position.lerp(GATE_END, approach);
    lookPoint.lerp(GATE_THROUGH, approach);
    camera.lookAt(lookPoint);
    camera.updateMatrixWorld();
  }

  function resize() {
    const width = canvas.clientWidth;
    const height = Math.max(canvas.clientHeight, 1);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    letters.mesh.scale.setScalar(Math.min(1, camera.aspect / 0.8));
    letters.mesh.position.y = LETTER_ANCHOR.y - (camera.aspect < 1 ? 0.6 : 0); // Màn dọc: chừa chỗ cho chữ kể chuyện phía trên.
    smoke.resize(camera.aspect);
    threshold.target.setSize(canvas.width, canvas.height);
  }

  const onMove = (event: PointerEvent) => {
    pointer.target.set((event.clientX / innerWidth) * 2 - 1, 1 - (event.clientY / innerHeight) * 2);
    pointer.onTarget = 1;
  };
  const onLeave = () => (pointer.onTarget = 0);
  const onLift = (event: PointerEvent) => {
    if (event.pointerType === "touch") onLeave();
  };

  const meteors = [
    { start: -1, length: 1 },
    { start: -1, length: 1 },
  ];
  let nextMeteor = 3;
  function launchMeteor(slot: number, now: number) {
    const x = (Math.random() - 0.5) * 1.5;
    const y = 0.45 + Math.random() * 0.45;
    const dir = Math.random() < 0.5 ? -1 : 1;
    sky.material.uniforms.uMeteors.value[slot].set(x, y, x + dir * 0.34, y - 0.2);
    meteors[slot].start = now;
    meteors[slot].length = 0.9 + Math.random() * 0.6;
  }

  function tick(now: number, delta: number) {
    timed.forEach((m) => (m.uniforms.uTime.value = now));
    followPointer("x", delta);
    followPointer("y", delta);
    // Vào thì phản ứng ngay, rời đi thì lực tắt chậm để còn dư âm.
    pointer.on += (pointer.onTarget - pointer.on) * (1 - Math.exp(-delta * (pointer.onTarget > pointer.on ? 14 : 1.6)));

    moveCamera(delta);

    // Chữ đứng yên trong thế giới, chỉ đổi hướng lúc đang tan để chữ mới quay về phía camera.
    const orbit = Math.min(journey, 3);
    const stop = Math.floor(orbit);
    const facing = (stop + MathUtils.smoothstep(orbit - stop, 0.3, 0.7)) * ORBIT_STEP;
    letters.mesh.rotation.y = facing + Math.sin(now * 0.22) * 0.08 + pointer.smooth.x * 0.12;
    letters.mesh.updateMatrixWorld();

    const uniforms = letters.material.uniforms;
    uniforms.uField.value.copy(pointerOnLetter(camera, pointer.smooth, letters.mesh, world, origin));
    uniforms.uFieldOn.value = pointer.on;
    uniforms.uDrag.value.copy(pointer.velocity).multiplyScalar(0.1).clampLength(0, 0.4);

    // Nén rồi nổ: chuột ở trên chữ thì lõi căng dần, đầy thì nổ. Cuộn sang chữ khác thì hạt gom về và nguội.
    const settled = journey < READY[1] && Math.abs(morph - Math.round(morph)) < 0.01;
    if (!settled) blast.live = false;
    if (!blast.live) {
      const here = field.copy(pointerOnLetter(camera, pointer.target, letters.mesh, world, origin));
      const near = settled && pointer.onTarget === 1 && blast.amount < 0.02 && Math.abs(here.x) < 1.15 && Math.abs(here.y) < 1.2;
      blast.charge = MathUtils.clamp(blast.charge + (near ? delta / 0.5 : -delta / 0.8), 0, 1);
      if (near && blast.charge >= 1) {
        blast.live = true;
        blast.start = now;
        blast.charge = 0;
        uniforms.uOrigin.value.copy(here);
      }
    }
    blast.amount = blast.live ? 1 : Math.max(blast.amount - delta / 1.5, 0);
    if (blast.live) uniforms.uBlastT.value = now - blast.start;
    uniforms.uBlastOn.value = blast.amount;
    uniforms.uCharge.value = blast.charge;

    if (now > nextMeteor) {
      launchMeteor(0, now);
      if (Math.random() < 0.25) launchMeteor(1, now + 0.25);
      nextMeteor = now + 6 + Math.random() * 12;
    }
    meteors.forEach((m, i) => {
      sky.material.uniforms.uMeteorT.value[i] = m.start < 0 ? -1 : (now - m.start) / m.length;
    });

    pointer.prevUv.copy(pointer.uv);
    pointer.uv.set(pointer.smooth.x * 0.5 + 0.5, pointer.smooth.y * 0.5 + 0.5);
    const moved = pointer.uv.distanceTo(pointer.prevUv);
    const f = smoke.feedback.uniforms;
    f.uFrom.value.copy(pointer.prevUv);
    f.uTo.value.copy(pointer.uv);
    f.uStrength.value = Math.min(moved * 45, 0.75) * pointer.on;
    f.uDecay.value = Math.pow(0.975, delta * 60);
    smoke.step(renderer);
    const grassUniforms = grass.material.uniforms;
    grassUniforms.uSmoke.value = smoke.overlay.uniforms.uSmoke.value;
    threshold.material.uniforms.uTrail.value = smoke.overlay.uniforms.uSmoke.value;
    grassUniforms.uPointerX.value = pointer.uv.x;
    grassUniforms.uRight.value.set(Math.cos(viewAngle), -Math.sin(viewAngle));

    const core = MathUtils.smoothstep(journey, CORE[0], CORE[1]);
    gate.update(
      MathUtils.clamp((journey - BUILD[0]) / (BUILD[1] - BUILD[0]), 0, 1),
      MathUtils.clamp((journey - READY[0]) / (READY[1] - READY[0]), 0, 1),
      MathUtils.smoothstep(journey, DOORS[0], DOORS[1]),
      core,
    );

    renderer.setRenderTarget(threshold.target);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    renderer.render(threshold.scene, threshold.camera);
    if (core < 0.5) {
      renderer.autoClear = false;
      renderer.clearDepth();
      renderer.render(overlay, camera);
      renderer.autoClear = true;
    }
  }

  resize();

  let frame = 0;
  let parked = false;
  let last = 0;
  let slowTime = 0;
  let sampleTime = 0;
  const loop = (ms: number) => {
    frame = requestAnimationFrame(loop);
    const delta = Math.min((ms - last) / 1000 || 0.016, 0.1);
    last = ms;
    // Đã vào section mới thì màn hình chỉ còn nền, ngừng vẽ cho nhẹ máy.
    if (journey < JOURNEY_END || !parked) tick(ms / 1000, delta);
    parked = journey >= JOURNEY_END;

    // Máy không theo kịp thì tự hạ độ phân giải một lần.
    sampleTime += delta;
    if (delta > 0.026) slowTime += delta;
    if (sampleTime > 3) {
      if (slowTime > 2 && dpr > 1) {
        dpr = 1;
        renderer.setPixelRatio(dpr);
        resize();
      }
      sampleTime = slowTime = 0;
    }
  };

  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  if (animate) {
    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("pointerdown", onMove, { passive: true });
    addEventListener("pointerup", onLift, { passive: true });
    addEventListener("pointercancel", onLeave, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    frame = requestAnimationFrame(loop);
  } else {
    tick(4, 0.016);
  }

  return {
    /** 0 là D, 1 là E, 2 là M, 3 là I, từ 3 tới JOURNEY_END là cổng. */
    setJourney(value: number) {
      // Reduced motion không bay: chỉ có bốn chữ, cổng đã mở và nền section.
      journey = animate ? value : value < 3.5 ? Math.round(value) : value < 5.5 ? DOORS[1] : JOURNEY_END;
      const orbit = Math.min(journey, 3);
      const stop = Math.floor(orbit);
      // Dừng lại ở mỗi chữ một đoạn.
      morph = stop + MathUtils.smoothstep(orbit - stop, 0.2, 0.8);
      letters.material.uniforms.uMorph.value = morph;
      if (!animate) tick(4, 0.016);
    },
    dispose() {
      cancelAnimationFrame(frame);
      observer.disconnect();
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerdown", onMove);
      removeEventListener("pointerup", onLift);
      removeEventListener("pointercancel", onLeave);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      [scene, overlay].forEach((root) =>
        root.traverse((node) => {
          const object = node as Mesh;
          object.geometry?.dispose();
          (object.material as ShaderMaterial | undefined)?.dispose();
        }),
      );
      letters.parts.forEach((part) => part.dispose());
      smoke.feedback.dispose();
      threshold.target.dispose();
      threshold.material.dispose();
      threshold.quad.geometry.dispose();
      smoke.quad.geometry.dispose();
      smoke.dispose();
      renderer.dispose();
    },
  };
}
