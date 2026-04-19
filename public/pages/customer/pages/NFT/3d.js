import * as THREE from 'https://esm.sh/three@0.128.0';
import { GLTFLoader } from 'https://esm.sh/three@0.128.0/examples/jsm/loaders/GLTFLoader.js';

const TIERS = {
    copper: { file: 'amulet1.glb', bgColor: 0x0e0805 },
    silver: { file: 'amulet2.glb', bgColor: 0x080810 },
    gold: { file: 'amulet3.glb', bgColor: 0x090700 },
};

let current = 'copper';
const scenes = {};
let mouseX = 0, mouseY = 0;

function buildScene(tier) {
    if (scenes[tier]) return;

    const cfg = TIERS[tier];
    const wrap = document.getElementById(`wrap-${tier}`);

    const canvas = document.createElement('canvas');
    wrap.appendChild(canvas);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(wrap.clientWidth, wrap.clientHeight);
    renderer.setClearColor(cfg.bgColor, 1);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, wrap.clientWidth / wrap.clientHeight, 0.1, 100);
    camera.position.set(0, 0.3, 5);

  
    scene.add(new THREE.AmbientLight(0xffffff, 1));

    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(3, 5, 2);
    scene.add(light);

    const geo = new THREE.OctahedronGeometry(1, 1);
    const mat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.9,
        roughness: 0.9
    });

    const placeholder = new THREE.Mesh(geo, mat);
    scene.add(placeholder);

    let model = placeholder;

    const loader = new GLTFLoader();
    loader.load(cfg.file, (gltf) => {
        scene.remove(placeholder);

        const m = gltf.scene;

        const box = new THREE.Box3().setFromObject(m);
        const size = box.getSize(new THREE.Vector3()).length();
        const scale = 4 / size;

        m.scale.setScalar(scale);
        m.position.sub(box.getCenter(new THREE.Vector3()).multiplyScalar(scale));

        scene.add(m);
        model = m;

        document.getElementById(`load-${tier}`).style.display = 'none';
    });

    function resize() {
        const w = wrap.clientWidth;
        const h = wrap.clientHeight;

        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    }

    window.addEventListener('resize', resize);

    scenes[tier] = { scene, camera, renderer, model };
}

document.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth - 0.5);
    mouseY = (e.clientY / window.innerHeight - 0.5);
});

let t = 0;

function animate() {
    requestAnimationFrame(animate);
    t += 0.1;

    const s = scenes[current];
    if (!s) return;

    const { scene, camera, renderer } = s;
    let model = s.model;

    if (model) {
        model.rotation.y += (mouseX * 1.5 - model.rotation.y) * 0.05;
        model.rotation.x += (mouseY * 0.5 - model.rotation.x) * 0.05;
        model.position.y = Math.sin(t) * 0.1;
    }

    camera.position.x += (mouseX * 1.2 - camera.position.x) * 0.05;
    camera.position.y += (-mouseY * 0.8 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
}

window.showPage = function (tier) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('active'));

    document.getElementById(`page-${tier}`).classList.add('active');
    document.querySelector(`.nav-tab.${tier}`).classList.add('active');

    current = tier;
    buildScene(tier);
};


window.confirmBuy = function (tier) {
    const names = {
        copper: 'หลวงพ่อโสธร',
        silver: 'พระพุทธชินราช',
        gold: 'หลวงพ่อเงิน'
    };

    document.getElementById('conf-title').textContent = 'ได้รับพระเรียบร้อย';
    document.getElementById('conf-sub').textContent =
        names[tier] + ' NFT ได้ถูกโอนเข้ากระเป๋าของท่านแล้ว';

    document.getElementById('confirm-overlay').classList.add('show');
};

buildScene(current);
animate();