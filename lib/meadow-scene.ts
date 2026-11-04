import {
  AdditiveBlending,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Camera,
  Color,
  ColorManagement,
  DoubleSide,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  LinearSRGBColorSpace,
  MathUtils,
  Mesh,
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

const COUNTS = {
  high: { grass: 42000, tall: 900, cubes: 15000, stars: 2600, embers: 150, smoke: 320, dpr: 1.75 },
  low: { grass: 12000, tall: 320, cubes: 6000, stars: 1000, embers: 60, smoke: 160, dpr: 1 },
};

const COLOR = {
  deep: new Color("#12040f"),
  plum: new Color("#3a0f34"),
  horizon: new Color("#b79ce0"),
  grassTip: new Color("#a98bd4"),
  mist: new Color("#e5e4e2"),
  gold: new Color("#eaaa00"),
};

const LETTERS = ["D", "E", "M", "I"];
const LETTER_HEIGHT = 2.5;
const LETTER_ANCHOR = new Vector3(0, 2.75, -6);
const CAMERA_TARGET = new Vector3(0, 2.16, -6);

/** Góc máy cho từng chữ: góc quay quanh chữ, khoảng cách, độ cao, độ nghiêng. */
const SHOTS = [
  { angle: 0, radius: 6, height: 0.95, roll: 0 },
  { angle: 0.74, radius: 6.2, height: 1.5, roll: 0.05 },
  { angle: -0.64, radius: 5.8, height: 1, roll: -0.06 },
  { angle: 0.32, radius: 6.6, height: 2.1, roll: 0 },
];

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

/** Lấy điểm ngẫu nhiên nằm trong hình chữ, trả về mảng xyz đã căn giữa. */
function sampleLetter(letter: string, count: number, rand: () => number) {
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

  const inside: number[] = [];
  for (let i = 0; i < size * size; i++) if (data[i * 4 + 3] > 128) inside.push(i);
  if (!inside.length) throw new Error(`Không vẽ được chữ ${letter}`);

  const out = new Float32Array(count * 3);
  const scale = LETTER_HEIGHT / (size * 0.72);
  for (let i = 0; i < count; i++) {
    const pixel = inside[Math.floor(rand() * inside.length)];
    // Vài cube bay lệch ra ngoài cho chữ có cảm giác vỡ mảnh.
    const stray = rand() < 0.07 ? 0.5 : 0;
    out[i * 3] = ((pixel % size) - size / 2) * scale + (rand() - 0.5) * stray;
    out[i * 3 + 1] = (size / 2 - Math.floor(pixel / size)) * scale + (rand() - 0.5) * stray;
    out[i * 3 + 2] = (rand() - 0.5) * 0.8 + (rand() - 0.5) * stray;
  }
  return out;
}

const NOISE_GLSL = /* glsl */ `
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p*=2.03;a*=.5;}return v;}
`;

function createSky() {
  const material = new ShaderMaterial({
    depthTest: false,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uInvProj: { value: null },
      uCamWorld: { value: null },
      uTop: { value: COLOR.deep },
      uMid: { value: COLOR.plum },
      uGlow: { value: COLOR.horizon },
      uMeteors: { value: [new Vector4(), new Vector4()] },
      uMeteorT: { value: [-1, -1] },
    },
    vertexShader: /* glsl */ `
      uniform mat4 uInvProj,uCamWorld;
      varying vec3 vDir;
      void main(){
        vec4 view=uInvProj*vec4(position.xy,1.,1.);
        vDir=mat3(uCamWorld)*(view.xyz/view.w);
        gl_Position=vec4(position.xy,.9999,1.);
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uTop,uMid,uGlow;
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
        vec3 c=mix(uGlow*.62,uMid,smoothstep(.0,.3,e));
        c=mix(c,uTop,smoothstep(.2,.8,e));
        float cloud=fbm(vec2(az*2.4+uTime*.006,e*5.));
        c+=uMid*(cloud-.4)*.9*smoothstep(.95,.1,e);
        float band=exp(-e*e*70.)*(.45+.55*exp(-az*az*2.5));
        c+=uGlow*band*.75;
        float ridge=.022+.05*fbm(vec2(az*5.,2.))*smoothstep(.0,.6,abs(az));
        c=mix(mix(uTop,uGlow,.3),c,smoothstep(ridge-.002,ridge+.002,e));
        vec2 p=vec2(az,e);
        float m=meteor(p,uMeteors[0],uMeteorT[0])+meteor(p,uMeteors[1],uMeteorT[1]);
        gl_FragColor=vec4(c+vec3(.9,.86,1.)*m,1.);
      }`,
  });
  const mesh = new Mesh(new PlaneGeometry(2, 2), material);
  mesh.frustumCulled = false;
  mesh.renderOrder = -10;
  return { mesh, material };
}

function createGround() {
  const geometry = new PlaneGeometry(400, 200);
  geometry.rotateX(-Math.PI / 2);
  const material = new ShaderMaterial({
    uniforms: { uNear: { value: COLOR.deep }, uFar: { value: COLOR.horizon } },
    vertexShader: /* glsl */ `
      varying float vDist;
      void main(){
        vec4 view=modelViewMatrix*vec4(position,1.);
        vDist=-view.z;
        gl_Position=projectionMatrix*view;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uNear,uFar;
      varying float vDist;
      void main(){gl_FragColor=vec4(mix(uNear,uFar*.34,smoothstep(8.,70.,vDist)),1.);}`,
  });
  const mesh = new Mesh(geometry, material);
  mesh.position.z = -90;
  return { mesh, material };
}

function createGrass(q: Quality, rand: () => number) {
  const { grass, tall } = COUNTS[q];
  const rows = q === "high" ? 5 : 3;
  const vertices: number[] = [];
  const index: number[] = [];
  for (let r = 0; r <= rows; r++) vertices.push(-0.5, r / rows, 0, 0.5, r / rows, 0);
  for (let r = 0; r < rows; r++) {
    const a = r * 2;
    index.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }

  const build = (count: number, place: () => number[]) => {
    const geometry = new InstancedBufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(new Float32Array(vertices), 3));
    geometry.setIndex(index);
    const offset = new Float32Array(count * 3);
    const shape = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const [x, z, height, width] = place();
      offset.set([x, z, rand() * Math.PI], i * 3);
      shape.set([height, width, (rand() - 0.5) * 0.7], i * 3);
      seed[i] = rand();
    }
    geometry.setAttribute("aOffset", new InstancedBufferAttribute(offset, 3));
    geometry.setAttribute("aShape", new InstancedBufferAttribute(shape, 3));
    geometry.setAttribute("aSeed", new InstancedBufferAttribute(seed, 1));
    geometry.instanceCount = count;
    return geometry;
  };

  const fieldGeometry = build(grass, () => {
    const z = 1 - Math.pow(rand(), 1.7) * 64;
    const x = (rand() - 0.5) * (14 + Math.abs(z) * 2.8);
    const height = (0.42 + rand() * 0.5) * (1 + Math.abs(z) * 0.012);
    return [x, z, height, (0.03 + rand() * 0.025) * (1 + Math.abs(z) * 0.09)];
  });
  // Cỏ tiền cảnh tính theo vị trí camera, thấp hơn đường chân trời để không chắn chữ.
  const nearGeometry = build(tall, () => {
    const side = rand() < 0.5 ? -1 : 1;
    const x = side * (1.5 + Math.pow(rand(), 0.7) * 2.2);
    return [x, -1.7 - rand() * 2, 0.85 + rand() * 0.55, 0.026 + rand() * 0.026];
  });

  const material = new ShaderMaterial({
    side: DoubleSide,
    uniforms: {
      uTime: { value: 0 },
      uRoot: { value: COLOR.deep },
      uTip: { value: COLOR.grassTip },
      uFar: { value: COLOR.horizon },
      uGold: { value: COLOR.gold },
    },
    vertexShader: /* glsl */ `
      attribute vec3 aOffset,aShape;
      attribute float aSeed;
      uniform float uTime;
      varying float vH,vSeed,vDist;
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
        p.y-=bend*bend*.35/max(aShape.x,.2);
        vec4 view=modelViewMatrix*vec4(b.x+p.x,p.y,b.y+p.z,1.);
        vH=h;vSeed=aSeed;vDist=-view.z;
        gl_Position=projectionMatrix*view;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uRoot,uTip,uFar,uGold;
      varying float vH,vSeed,vDist;
      void main(){
        vec3 c=mix(uRoot,uTip*(.55+vSeed*.5),pow(vH,1.6));
        c*=mix(.32,1.,smoothstep(1.2,9.,vDist));
        c=mix(c,uFar*.34,smoothstep(14.,62.,vDist));
        float ember=step(.982,vSeed)*smoothstep(.72,1.,vH)*smoothstep(4.,7.,vDist);
        c+=uGold*ember*(.75+.5*sin(uTime*2.2+vSeed*90.));
        gl_FragColor=vec4(c,1.);
      }`,
  });
  const mesh = new Mesh(fieldGeometry, material);
  const near = new Mesh(nearGeometry, material);
  mesh.frustumCulled = near.frustumCulled = false;
  return { mesh, near, material };
}

/** Khối cube biến thành D, E, M, I. uMorph chạy từ 0 đến 3. */
function createLetters(q: Quality, rand: () => number) {
  const { cubes } = COUNTS[q];
  const box = new BoxGeometry(1, 1, 1);
  const geometry = new InstancedBufferGeometry();
  geometry.index = box.index;
  geometry.setAttribute("position", box.attributes.position);
  geometry.setAttribute("normal", box.attributes.normal);

  LETTERS.forEach((letter, i) => {
    geometry.setAttribute(`aT${i}`, new InstancedBufferAttribute(sampleLetter(letter, cubes, rand), 3));
  });
  const random = new Float32Array(cubes * 4);
  for (let i = 0; i < random.length; i++) random[i] = rand();
  geometry.setAttribute("aRnd", new InstancedBufferAttribute(random, 4));
  geometry.instanceCount = cubes;

  const material = new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uMorph: { value: 0 },
      uPointer: { value: new Vector3() },
      uPointerOn: { value: 0 },
      uSmoke: { value: null },
      uDark: { value: COLOR.plum },
      uLight: { value: COLOR.horizon },
      uWhite: { value: COLOR.mist },
      uGold: { value: COLOR.gold },
    },
    vertexShader: /* glsl */ `
      attribute vec3 aT0,aT1,aT2,aT3;
      attribute vec4 aRnd;
      uniform float uTime,uMorph,uPointerOn;
      uniform vec3 uPointer;
      uniform sampler2D uSmoke;
      varying float vHeat,vShade,vRnd;
      vec3 spin(vec3 v,vec3 k,float a){float c=cos(a),s=sin(a);return v*c+cross(k,v)*s+k*dot(k,v)*(1.-c);}
      void main(){
        float m=clamp(uMorph,0.,3.),i=floor(m),f=m-i;
        float t=smoothstep(aRnd.x*.42,aRnd.x*.42+.58,f);
        vec3 a=i<.5?aT0:i<1.5?aT1:i<2.5?aT2:aT3;
        vec3 b=i<.5?aT1:i<1.5?aT2:aT3;
        vec3 c=mix(a,b,t);
        c+=(aRnd.yzw-.5)*sin(t*3.1416)*2.8;
        c+=vec3(sin(uTime*.5+aRnd.x*30.),cos(uTime*.42+aRnd.y*30.),sin(uTime*.36+aRnd.z*30.))*.012;

        vec2 away=c.xy-uPointer.xy;
        float r2=dot(away,away);
        float k=exp(-r2/.2)*uPointerOn;
        c.xy+=normalize(away+1e-4)*k*.62;
        c.z+=(aRnd.w-.5)*k*1.1;
        vHeat=exp(-r2/.55)*uPointerOn;

        // Vệt chuột đi qua đâu thì cube ở đó văng ra, rồi tự về chỗ khi vệt tan.
        vec4 clip=projectionMatrix*modelViewMatrix*vec4(c,1.);
        float trail=texture2D(uSmoke,clip.xy/clip.w*.5+.5).r;
        c+=(aRnd.yzw-.5)*trail*1.6;
        vHeat=max(vHeat,trail*.9);

        vec3 axis=normalize(aRnd.xyz-.5+1e-3);
        float angle=uTime*(.2+aRnd.w*.5)+aRnd.y*6.28+k*3.;
        vec3 n=spin(normal,axis,angle);
        vec3 p=spin(position,axis,angle)*(.03+aRnd.z*.026);
        vShade=.5+.5*dot(n,normalize(vec3(.35,.8,.5)));
        vRnd=aRnd.x;
        gl_Position=projectionMatrix*modelViewMatrix*vec4(c+p,1.);
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uDark,uLight,uWhite,uGold;
      varying float vHeat,vShade,vRnd;
      void main(){
        vec3 c=mix(uDark*1.5,uLight,vShade);
        c=mix(c,uWhite,smoothstep(.72,1.,vRnd)*vShade*.7);
        c=mix(c,uGold*(1.+vShade*.5),smoothstep(.2,.75,vHeat));
        float spark=step(.975,vRnd)*(.5+.5*sin(uTime*3.+vRnd*200.));
        gl_FragColor=vec4(c+uGold*spark*.8,1.);
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
        gl_FragColor=vec4((vSeed.y>.96?uGold:uWhite)*a*vLight,1.);
      }`,
  });
  const points = new Points(geometry, material);
  points.frustumCulled = false;
  points.renderOrder = 1;
  return { points, material };
}

function createEmbers(q: Quality, rand: () => number, dpr: number) {
  const geometry = pointsGeometry(COUNTS[q].embers, (i, p, s) => {
    const z = -2 - rand() * 24;
    p.set([(rand() - 0.5) * (8 + Math.abs(z) * 1.5), rand() * 3, z], i * 3);
    s.set([rand(), rand()], i * 2);
  });
  const material = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uDpr: { value: dpr }, uGold: { value: COLOR.gold } },
    vertexShader: /* glsl */ `
      attribute vec2 aSeed;
      uniform float uTime,uDpr;
      varying float vLight;
      void main(){
        vec3 p=position;
        float life=fract(p.y/3.+uTime*(.018+aSeed.x*.03));
        p.y=life*3.2;
        p.x+=sin(uTime*.4+aSeed.y*20.)*.35;
        vLight=sin(life*3.1416)*(.6+.4*sin(uTime*4.+aSeed.x*60.));
        vec4 view=modelViewMatrix*vec4(p,1.);
        gl_PointSize=(1.6+aSeed.y*3.4)*uDpr*(9./max(-view.z,2.));
        gl_Position=projectionMatrix*view;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uGold;
      varying float vLight;
      void main(){
        float a=smoothstep(.5,0.,length(gl_PointCoord-.5));
        gl_FragColor=vec4(uGold*a*a*vLight*1.6,1.);
      }`,
  });
  const points = new Points(geometry, material);
  points.frustumCulled = false;
  points.renderOrder = 5;
  return { points, material };
}

/** Vệt khói: vẽ lên một texture nhỏ, mỗi khung hình trôi và phai đi một chút. */
function createSmoke(q: Quality, aspect: number) {
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
    blending: AdditiveBlending,
    uniforms: { uSmoke: { value: null }, uTint: { value: COLOR.mist } },
    vertexShader: feedback.vertexShader,
    fragmentShader: /* glsl */ `
      uniform sampler2D uSmoke;
      uniform vec3 uTint;
      varying vec2 vUv;
      void main(){
        float a=texture2D(uSmoke,vUv).r;
        gl_FragColor=vec4(uTint*a*.6,1.);
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

export function createMeadow(canvas: HTMLCanvasElement, quality: Quality, animate: boolean) {
  const renderer = new WebGLRenderer({ canvas, antialias: quality === "high", powerPreference: "high-performance" });
  renderer.outputColorSpace = LinearSRGBColorSpace;
  let dpr = Math.min(devicePixelRatio, COUNTS[quality].dpr);
  renderer.setPixelRatio(dpr);

  const rand = seeded(26);
  const scene = new Scene();
  const camera = new PerspectiveCamera(46, 1, 0.1, 400);

  const sky = createSky();
  const ground = createGround();
  const grass = createGrass(quality, rand);
  const letters = createLetters(quality, rand);
  const stars = createStars(quality, rand, dpr);
  const embers = createEmbers(quality, rand, dpr);
  const smoke = createSmoke(quality, canvas.clientWidth / Math.max(canvas.clientHeight, 1));
  scene.add(sky.mesh, ground.mesh, grass.mesh, grass.near, letters.mesh, stars.points, embers.points, smoke.mesh);

  sky.material.uniforms.uInvProj.value = camera.projectionMatrixInverse;
  sky.material.uniforms.uCamWorld.value = camera.matrixWorld;

  const timed = [sky.material, grass.material, letters.material, stars.material, embers.material, smoke.feedback];
  const pointer = { target: new Vector2(), smooth: new Vector2(), prevUv: new Vector2(), uv: new Vector2(), on: 0, onTarget: 0 };
  const world = new Vector3();
  const origin = new Vector3();
  const shot = { ...SHOTS[0] };
  let morph = 0;

  function moveCamera(delta: number) {
    const from = Math.min(Math.floor(morph), SHOTS.length - 2);
    const blend = morph - from;
    const follow = animate ? 1 - Math.exp(-delta * 4) : 1;
    for (const key of ["angle", "radius", "height", "roll"] as const) {
      shot[key] += (MathUtils.lerp(SHOTS[from][key], SHOTS[from + 1][key], blend) - shot[key]) * follow;
    }
    camera.position.set(
      CAMERA_TARGET.x + Math.sin(shot.angle) * shot.radius,
      shot.height,
      CAMERA_TARGET.z + Math.cos(shot.angle) * shot.radius,
    );
    camera.lookAt(CAMERA_TARGET);
    camera.rotateZ(shot.roll);
    camera.rotateY(-pointer.smooth.x * 0.035);
    camera.rotateX(pointer.smooth.y * 0.018);
    camera.updateMatrixWorld();

    grass.near.position.set(camera.position.x, 0, camera.position.z);
    grass.near.rotation.y = shot.angle;
  }

  function resize() {
    const width = canvas.clientWidth;
    const height = Math.max(canvas.clientHeight, 1);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    letters.mesh.scale.setScalar(Math.min(1, camera.aspect / 0.8));
    smoke.resize(camera.aspect);
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
    const ease = 1 - Math.exp(-delta * 6);
    pointer.smooth.lerp(pointer.target, ease);
    pointer.on += (pointer.onTarget - pointer.on) * ease;

    moveCamera(delta);

    // Chữ quay theo một phần để vẫn đọc được ở mọi góc máy.
    letters.mesh.rotation.y = shot.angle * 0.6 + Math.sin(now * 0.22) * 0.08 + pointer.smooth.x * 0.12;
    letters.mesh.updateMatrixWorld();
    letters.material.uniforms.uPointer.value.copy(pointerOnLetter(camera, pointer.smooth, letters.mesh, world, origin));
    letters.material.uniforms.uPointerOn.value = pointer.on;

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
    f.uDecay.value = Math.pow(0.968, delta * 60);
    smoke.step(renderer);
    letters.material.uniforms.uSmoke.value = smoke.overlay.uniforms.uSmoke.value;

    renderer.render(scene, camera);
  }

  resize();

  let frame = 0;
  let last = 0;
  let slowTime = 0;
  let sampleTime = 0;
  const loop = (ms: number) => {
    frame = requestAnimationFrame(loop);
    const delta = Math.min((ms - last) / 1000 || 0.016, 0.1);
    last = ms;
    tick(ms / 1000, delta);

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
    /** 0 là D, 1 là E, 2 là M, 3 là I. */
    setMorph(value: number) {
      const stop = Math.floor(value);
      // Dừng lại ở mỗi chữ một đoạn, reduced motion thì đổi thẳng không bay.
      morph = animate ? stop + MathUtils.smoothstep(value - stop, 0.2, 0.8) : Math.round(value);
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
      scene.traverse((node) => {
        const object = node as Mesh;
        object.geometry?.dispose();
        (object.material as ShaderMaterial | undefined)?.dispose();
      });
      letters.parts.forEach((part) => part.dispose());
      smoke.feedback.dispose();
      smoke.quad.geometry.dispose();
      smoke.dispose();
      renderer.dispose();
    },
  };
}
