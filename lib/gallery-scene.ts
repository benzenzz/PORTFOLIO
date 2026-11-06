import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  ColorManagement,
  DoubleSide,
  Group,
  LinearFilter,
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  Raycaster,
  Scene,
  ShaderMaterial,
  Texture,
  TextureLoader,
  Vector2,
  VideoTexture,
  WebGLRenderer,
} from "three";

export type GalleryItem = {
  name: string;
  image?: string;
  video?: string;
  accent: string;
  /** Các dòng in lên thẻ khi hover: nhãn và giá trị. */
  info: [string, string[]][];
};

// Vòng rất lớn so với thẻ: thẻ giữa gần như phẳng, hai bên lùi dần về chân trời.
const RADIUS = 14;
const CARD = { w: 1.545, h: 1.9, lift: 0.12, glow: 0.28 };
const STEP = 1.66 / RADIUS;
const CAMERA = { y: 0.7, distance: 4.2, fov: 77 };
const CEILING = 3.4;
const STARS = 420;
// Sau tiếp tuyến của vòng thẻ khuất dần, nên chỉ vẽ tới đây.
const VISIBLE_SLOTS = 6.5;
const DAMPING = 6;
const SPIN_STRENGTH = 0.05;

const CARD_VERTEX = /* glsl */ `
uniform float uRadius, uHover, uTime, uSpin;
varying vec2 vP;
void main() {
  vP = position.xy;
  vec3 p = position;
  float a = p.x / uRadius;
  p.x = sin(a) * uRadius;
  p.z = (cos(a) - 1.0) * uRadius;
  float bend = sin((p.y + 1.0) * 1.6 + uTime * 1.8);
  p.z += bend * (uHover * 0.035 + uSpin * 0.5);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`;

const CARD_FRAGMENT = /* glsl */ `
uniform sampler2D uMap, uInfo;
uniform vec2 uCover, uSize;
uniform vec3 uAccent;
uniform float uFocus, uHover, uReflect, uReveal, uFade, uTime;
varying vec2 vP;

float box(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

vec3 image(vec2 uv) {
  vec2 cover = (uv - 0.5) * uCover + 0.5;
  if (uReflect < 0.5) return texture2D(uMap, cover).rgb;
  vec3 sum = vec3(0.0);
  for (int x = -1; x <= 1; x++) for (int y = -1; y <= 1; y++) sum += texture2D(uMap, cover + vec2(x, y) * 0.022).rgb;
  return sum / 9.0;
}

void main() {
  float d = box(vP, uSize * 0.5, 0.1);
  vec2 uv = vP / uSize + 0.5;

  // Thẻ càng xa giữa càng vỡ thành khối, về giữa trả lại ảnh sắc nét.
  float blocks = mix(13.0, 90.0, smoothstep(0.1, 0.62, uFocus));
  vec2 grid = vec2(blocks, blocks * 1.25);
  vec2 sharp = uFocus > 0.62 ? uv : (floor(uv * grid) + 0.5) / grid;
  vec3 color = image(sharp) * mix(0.42, 1.0, smoothstep(0.2, 0.95, uFocus));

  // Khe dọc như mặt kính gân, tắt hẳn ở thẻ đang chọn.
  float rib = 0.5 + 0.5 * sin(uv.x * 210.0);
  color *= mix(1.0, 0.8 + 0.2 * rib, smoothstep(0.98, 0.7, uFocus));

  // Chữ thông tin tách kênh màu rồi tụ lại khi hover.
  if (uHover > 0.01 && uReflect < 0.5) {
    color = mix(color, color * 0.22, uHover);
    vec2 wave = vec2(sin(uv.y * 16.0 + uTime * 2.4) * 0.02 * (1.0 - uHover * 0.75), 0.0);
    float shift = 0.004 + (1.0 - uHover) * 0.03;
    vec3 text = vec3(
      texture2D(uInfo, uv + wave + vec2(shift, 0.0)).a,
      texture2D(uInfo, uv + wave).a,
      texture2D(uInfo, uv + wave - vec2(shift, 0.0)).a
    );
    color += text * uHover;
  }

  vec3 light = mix(uAccent, vec3(1.0), 0.55);
  float inner = exp(min(d, 0.0) * 16.0) * mix(0.35, 1.0, uFocus);
  color = mix(color, light, inner * 0.6);
  color += vec3(1.0) * exp(-abs(d) * 110.0) * 0.5;

  float body = smoothstep(0.008, -0.008, d);
  float halo = exp(-max(d, 0.0) * 13.0) * smoothstep(${CARD.glow.toFixed(2)}, 0.0, d) * (1.0 - body) * mix(0.3, 0.9, uFocus);
  float rise = smoothstep(0.0, 0.14, uReveal * 1.14 - uv.y);
  float reflection = uReflect > 0.5 ? pow(1.0 - clamp(uv.y, 0.0, 1.0), 1.4) * 0.8 : 1.0;
  float alpha = rise * uFade * reflection;

  gl_FragColor = vec4((color * body + uAccent * halo) * alpha, body * alpha);
}
`;

const FLOOR_VERTEX = /* glsl */ `
varying vec3 vWorld;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

const FLOOR_FRAGMENT = /* glsl */ `
uniform vec3 uAccent;
uniform float uRadius, uFront;
varying vec3 vWorld;
void main() {
  float d = abs(length(vWorld.xz) - uRadius);
  float side = smoothstep(uFront - 14.0, uFront - 3.0, vWorld.z);
  vec3 glow = (uAccent * 0.9 + 0.1) * exp(-d * 22.0) + uAccent * (exp(-d * 2.4) * 0.34 + exp(-d * 0.7) * 0.1);
  float shade = 0.3 + 0.4 * smoothstep(1.5, 9.0, d);
  gl_FragColor = vec4(glow * side, shade);
}
`;

const CEILING_FRAGMENT = /* glsl */ `
uniform vec3 uAccent;
uniform float uFront;
varying vec3 vWorld;

float line(float value, float width) {
  return smoothstep(width, 0.0, abs(fract(value + 0.5) - 0.5));
}

void main() {
  vec2 p = vec2(vWorld.x, vWorld.z - uFront + 16.0);
  float grid = max(line(p.x / 2.6, 0.035), line(p.y / 2.6, 0.035));
  float angle = atan(p.x, p.y + 15.0);
  float beams = exp(-abs(angle) * 320.0) * 1.4 + exp(-abs(abs(angle) - 0.5) * 120.0) * 0.6 + exp(-abs(abs(angle) - 0.95) * 120.0) * 0.4;
  float fade = smoothstep(26.0, 6.0, length(p));
  gl_FragColor = vec4((vec3(0.13) * grid + uAccent * beams * 0.75) * fade, 1.0);
}
`;

/** Vẽ bảng thông tin vào canvas để shader bóp méo được như một phần của thẻ. */
function paintInfo(canvas: HTMLCanvasElement, item: GalleryItem) {
  const context = canvas.getContext("2d")!;
  const font = getComputedStyle(document.body).getPropertyValue("--font-chivo-mono") || "monospace";
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#fff";
  context.font = `500 26px ${font}`;
  context.textBaseline = "top";
  const left = 56;
  const right = canvas.width - 56;
  let y = 150;
  item.info.forEach(([label, values]) => {
    context.textAlign = "left";
    context.fillText(label.toUpperCase(), left, y);
    context.textAlign = "right";
    values.forEach((value) => {
      context.fillText(value.toUpperCase(), right, y);
      y += 34;
    });
    y += 16;
  });
}

function fitRenderer(renderer: WebGLRenderer, camera: PerspectiveCamera, canvas: HTMLCanvasElement) {
  const { clientWidth: width, clientHeight: height } = canvas;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

export function createGallery(canvas: HTMLCanvasElement, items: GalleryItem[], onActive: (slot: number) => void) {
  ColorManagement.enabled = false;
  // Ném lỗi khi không có WebGL để component chuyển sang lưới ảnh.
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setClearColor("#040206");

  const scene = new Scene();
  const front = RADIUS;
  const camera = new PerspectiveCamera(CAMERA.fov, 1, 0.1, 80);
  camera.position.set(0, CAMERA.y, front + CAMERA.distance);
  camera.lookAt(0, CAMERA.y, front);
  fitRenderer(renderer, camera, canvas);

  const accent = { value: new Color(items[0].accent) };
  const time = { value: 0 };
  const spin = { value: 0 };
  const reveal = { value: 0 };

  const infoCanvas = document.createElement("canvas");
  infoCanvas.width = 620;
  infoCanvas.height = 762;
  const infoTexture = new CanvasTexture(infoCanvas);
  infoTexture.minFilter = LinearFilter;
  const loader = new TextureLoader();
  const videos: HTMLVideoElement[] = [];
  const textures: Texture[] = [infoTexture];

  const geometry = new PlaneGeometry(CARD.w + CARD.glow * 2, CARD.h + CARD.glow * 2, 24, 16);
  const ring = new Group();
  const mirror = new Group();
  mirror.scale.y = -1;
  scene.add(ring, mirror);

  const cards = items.map((item, index) => {
    const cover = { value: new Vector2(1, 1) };
    const map = { value: null as Texture | null };
    const fit = (width: number, height: number) => {
      const ratio = width / height / (CARD.w / CARD.h);
      cover.value.set(ratio > 1 ? 1 / ratio : 1, ratio > 1 ? 1 : ratio);
    };
    if (item.video) {
      const video = document.createElement("video");
      Object.assign(video, { src: item.video, muted: true, loop: true, playsInline: true, crossOrigin: "anonymous" });
      video.addEventListener("loadedmetadata", () => fit(video.videoWidth, video.videoHeight), { once: true });
      videos.push(video);
      map.value = new VideoTexture(video);
    } else {
      map.value = loader.load(item.image!, (texture) => {
        const { width, height } = texture.image as HTMLImageElement;
        fit(width, height);
      });
    }
    textures.push(map.value);

    const build = (reflect: number) => {
      const material = new ShaderMaterial({
        vertexShader: CARD_VERTEX,
        fragmentShader: CARD_FRAGMENT,
        transparent: true,
        premultipliedAlpha: true,
        depthWrite: false,
        side: DoubleSide,
        uniforms: {
          uMap: map,
          uInfo: { value: infoTexture },
          uCover: cover,
          uSize: { value: new Vector2(CARD.w, CARD.h) },
          uAccent: accent,
          uRadius: { value: RADIUS },
          uTime: time,
          uSpin: spin,
          uReveal: reveal,
          uReflect: { value: reflect },
          uFocus: { value: 0 },
          uHover: { value: 0 },
          uFade: { value: 1 },
        },
      });
      const mesh = new Mesh(geometry, material);
      mesh.userData.index = index;
      return mesh;
    };
    const card = build(0);
    const echo = build(1);
    card.renderOrder = 2;
    ring.add(card);
    mirror.add(echo);
    return { card, echo };
  });

  const floorGeometry = new PlaneGeometry(120, 120);
  const shared = { uAccent: accent, uRadius: { value: RADIUS }, uFront: { value: front } };
  const floorMaterial = new ShaderMaterial({ vertexShader: FLOOR_VERTEX, fragmentShader: FLOOR_FRAGMENT, transparent: true, depthWrite: false, uniforms: shared });
  const ceilingMaterial = new ShaderMaterial({ vertexShader: FLOOR_VERTEX, fragmentShader: CEILING_FRAGMENT, depthWrite: false, side: DoubleSide, uniforms: shared });
  const floor = new Mesh(floorGeometry, floorMaterial);
  const ceiling = new Mesh(floorGeometry, ceilingMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.renderOrder = 1;
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = CEILING;
  ceiling.renderOrder = -1;
  scene.add(floor, ceiling);

  const starPositions = new Float32Array(STARS * 3);
  for (let i = 0; i < STARS; i++) {
    starPositions[i * 3] = (Math.random() - 0.5) * 34;
    starPositions[i * 3 + 1] = 0.6 + Math.random() * 3;
    starPositions[i * 3 + 2] = front - 3 - Math.random() * 18;
  }
  const starGeometry = new BufferGeometry();
  starGeometry.setAttribute("position", new BufferAttribute(starPositions, 3));
  const starMaterial = new ShaderMaterial({
    vertexShader: "void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_PointSize = 2.2; }",
    fragmentShader: "uniform vec3 uAccent; void main() { gl_FragColor = vec4(uAccent * 0.6, 1.0); }",
    blending: AdditiveBlending,
    transparent: true,
    depthWrite: false,
    uniforms: { uAccent: accent },
  });
  scene.add(new Points(starGeometry, starMaterial));

  let list = items.map((_, index) => index);
  let position = 0;
  let target = 0;
  let activeSlot = -1;
  let activeItem = -1;
  let hovered = false;
  let running = false;
  let last = 0;
  let frame = 0;
  const accentTarget = new Color(items[0].accent);

  const place = (mesh: Mesh, angle: number, focus: number, fade: number, hover: number) => {
    mesh.position.set(Math.sin(angle) * RADIUS, CARD.lift + CARD.h / 2, Math.cos(angle) * RADIUS);
    mesh.rotation.y = angle;
    const uniforms = (mesh.material as ShaderMaterial).uniforms;
    uniforms.uFocus.value = focus;
    uniforms.uFade.value = fade;
    uniforms.uHover.value += (hover - uniforms.uHover.value) * 0.12;
  };

  const draw = (now: number) => {
    frame = requestAnimationFrame(draw);
    const delta = Math.min((now - last) / 1000, 0.05);
    last = now;
    const before = position;
    position += (target - position) * (1 - Math.exp(-delta * DAMPING));
    const speed = delta ? (position - before) / delta : 0;
    spin.value += (Math.max(-1, Math.min(1, speed * SPIN_STRENGTH)) - spin.value) * 0.1;
    time.value = now / 1000;
    reveal.value += (1 - reveal.value) * (1 - Math.exp(-delta * 2.4));
    accent.value.lerp(accentTarget, 1 - Math.exp(-delta * 5));

    const slot = Math.max(0, Math.min(list.length - 1, Math.round(target)));
    if (slot !== activeSlot) {
      activeSlot = slot;
      activeItem = list[slot];
      accentTarget.set(items[activeItem].accent);
      paintInfo(infoCanvas, items[activeItem]);
      infoTexture.needsUpdate = true;
      onActive(slot);
    }

    cards.forEach(({ card, echo }, index) => {
      const at = list.indexOf(index);
      card.visible = echo.visible = at >= 0;
      if (at < 0) return;
      // Quấn vòng: thẻ đi quá nửa số thẻ thì sang phía bên kia, tắt dần ngay trước khi đổi bên.
      const half = list.length / 2;
      const offset = ((at - position + half) % list.length + list.length) % list.length - half;
      const distance = Math.abs(offset);
      const angle = offset * STEP;
      const focus = 1 - Math.min(distance / 4.5, 1);
      const fade = Math.min(1, (half - distance) * 2, (VISIBLE_SLOTS - distance) * 2);
      const hover = hovered && index === activeItem && distance < 0.5 ? 1 : 0;
      place(card, angle, focus, fade, hover);
      place(echo, angle, focus, fade, 0);
    });

    renderer.render(scene, camera);
  };

  const start = () => {
    if (running) return;
    running = true;
    last = performance.now();
    frame = requestAnimationFrame(draw);
    videos.forEach((video) => void video.play().catch(() => {}));
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(frame);
    videos.forEach((video) => video.pause());
  };

  const resize = new ResizeObserver(() => fitRenderer(renderer, camera, canvas));
  resize.observe(canvas);
  // Không vẽ khi đã cuộn xuống Contact.
  const visible = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()));
  visible.observe(canvas);

  const raycaster = new Raycaster();
  const pointer = new Vector2();

  return {
    /** Vị trí trên vòng tính theo số thẻ, 0 là thẻ đầu trong list. */
    setPosition(value: number) {
      target = value;
    },
    setList(indices: number[]) {
      list = indices;
      position = target = 0;
      activeSlot = -1;
      reveal.value = 0;
    },
    setHovered(value: boolean) {
      hovered = value;
    },
    /** Trả về thứ tự trong list của thẻ dưới con trỏ, -1 nếu không trúng thẻ nào. */
    pick(clientX: number, clientY: number) {
      const box = canvas.getBoundingClientRect();
      pointer.set(((clientX - box.left) / box.width) * 2 - 1, -((clientY - box.top) / box.height) * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(cards.map(({ card }) => card))[0];
      return hit ? list.indexOf(hit.object.userData.index) : -1;
    },
    dispose() {
      stop();
      resize.disconnect();
      visible.disconnect();
      videos.forEach((video) => video.removeAttribute("src"));
      textures.forEach((texture) => texture.dispose());
      cards.forEach(({ card, echo }) => {
        (card.material as ShaderMaterial).dispose();
        (echo.material as ShaderMaterial).dispose();
      });
      [floorMaterial, ceilingMaterial, starMaterial].forEach((material) => material.dispose());
      [geometry, floorGeometry, starGeometry].forEach((item) => item.dispose());
      renderer.dispose();
    },
  };
}
