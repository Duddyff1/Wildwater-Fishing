const scene = new THREE.Scene();

scene.background = new THREE.Color(0x91b9c3);
scene.fog = new THREE.FogExp2(0x91b9c3, 0.0045);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1500
);

camera.position.set(0, 5, 20);

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance"
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

document.getElementById("game").appendChild(renderer.domElement);


/* =========================
   LIGHTING
========================= */

const skyLight = new THREE.HemisphereLight(
    0xc7e8ed,
    0x26362c,
    1.8
);

scene.add(skyLight);

const sun = new THREE.DirectionalLight(
    0xfff0c7,
    3
);

sun.position.set(-150, 250, -100);
sun.castShadow = true;

sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;

sun.shadow.camera.left = -300;
sun.shadow.camera.right = 300;
sun.shadow.camera.top = 300;
sun.shadow.camera.bottom = -300;

scene.add(sun);


/* =========================
   TERRAIN
========================= */

const terrainGeometry = new THREE.PlaneGeometry(
    1200,
    1200,
    100,
    100
);

const terrainPositions = terrainGeometry.attributes.position;

for (let i = 0; i < terrainPositions.count; i++) {

    const x = terrainPositions.getX(i);
    const y = terrainPositions.getY(i);

    let height =
        Math.sin(x * 0.025) * 7 +
        Math.cos(y * 0.018) * 8 +
        Math.sin((x + y) * 0.01) * 10;

    height += Math.max(0, Math.abs(x) - 250) * .035;
    height += Math.max(0, Math.abs(y) - 260) * .03;

    terrainPositions.setZ(i, height);
}

terrainGeometry.computeVertexNormals();

const terrainMaterial = new THREE.MeshStandardMaterial({
    color: 0x30452f,
    roughness: .95,
    metalness: 0
});

const terrain = new THREE.Mesh(
    terrainGeometry,
    terrainMaterial
);

terrain.rotation.x = -Math.PI / 2;
terrain.position.y = -3;

terrain.receiveShadow = true;
terrain.castShadow = true;

scene.add(terrain);


/* =========================
   LAKE
========================= */

const waterGeometry = new THREE.PlaneGeometry(
    650,
    650,
    100,
    100
);

const waterMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x17627a,
    roughness: .08,
    metalness: .1,
    transparent: true,
    opacity: .83,
    transmission: .05
});

const water = new THREE.Mesh(
    waterGeometry,
    waterMaterial
);

water.rotation.x = -Math.PI / 2;
water.position.y = 1;

scene.add(water);


/* =========================
   WATER WAVES
========================= */

const waterPositions = waterGeometry.attributes.position;

function animateWater(time) {

    for (let i = 0; i < waterPositions.count; i++) {

        const x = waterPositions.getX(i);
        const y = waterPositions.getY(i);

        const wave =
            Math.sin(x * .035 + time * .001) * .25 +
            Math.cos(y * .045 + time * .0012) * .18 +
            Math.sin((x + y) * .018 + time * .0008) * .12;

        waterPositions.setZ(i, wave);
    }

    waterPositions.needsUpdate = true;
    waterGeometry.computeVertexNormals();
}


/* =========================
   TREES
========================= */

function createTree(x, z, scale = 1) {

    const group = new THREE.Group();

    const trunkGeometry = new THREE.CylinderGeometry(
        .5 * scale,
        .8 * scale,
        8 * scale,
        8
    );

    const trunkMaterial = new THREE.MeshStandardMaterial({
        color: 0x4b3021,
        roughness: 1
    });

    const trunk = new THREE.Mesh(
        trunkGeometry,
        trunkMaterial
    );

    trunk.position.y = 4 * scale;
    trunk.castShadow = true;

    group.add(trunk);


    const leavesMaterial = new THREE.MeshStandardMaterial({
        color: 0x173d27,
        roughness: .9
    });


    for (let i = 0; i < 4; i++) {

        const leavesGeometry = new THREE.ConeGeometry(
            (3.5 - i * .4) * scale,
            6 * scale,
            8
        );

        const leaves = new THREE.Mesh(
            leavesGeometry,
            leavesMaterial
        );

        leaves.position.y =
            (7 + i * 2.5) * scale;

        leaves.castShadow = true;

        group.add(leaves);
    }

    group.position.set(x, 0, z);

    scene.add(group);
}


/* forest */

for (let i = 0; i < 110; i++) {

    const angle = Math.random() * Math.PI * 2;
    const distance = 260 + Math.random() * 240;

    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;

    createTree(
        x,
        z,
        .7 + Math.random() * .8
    );
}


/* =========================
   ROCKS
========================= */

function createRock(x, z, size) {

    const geometry = new THREE.DodecahedronGeometry(
        size,
        1
    );

    const material = new THREE.MeshStandardMaterial({
        color: 0x4e5754,
        roughness: 1
    });

    const rock = new THREE.Mesh(
        geometry,
        material
    );

    rock.position.set(
        x,
        0,
        z
    );

    rock.scale.y = .6;

    rock.rotation.y =
        Math.random() * Math.PI;

    rock.castShadow = true;
    rock.receiveShadow = true;

    scene.add(rock);
}

for (let i = 0; i < 50; i++) {

    const angle = Math.random() * Math.PI * 2;
    const distance = 120 + Math.random() * 120;

    createRock(
        Math.cos(angle) * distance,
        Math.sin(angle) * distance,
        1 + Math.random() * 3
    );
}


/* =========================
   DOCK
========================= */

const dock = new THREE.Group();

const dockMaterial = new THREE.MeshStandardMaterial({
    color: 0x6b4930,
    roughness: .9
});

const dockBase = new THREE.Mesh(
    new THREE.BoxGeometry(12, .5, 35),
    dockMaterial
);

dockBase.position.set(0, 3, 0);
dockBase.castShadow = true;

dock.add(dockBase);


for (let i = -5; i <= 5; i += 2) {

    const post = new THREE.Mesh(
        new THREE.CylinderGeometry(.25, .35, 5, 8),
        dockMaterial
    );

    post.position.set(
        5,
        .5,
        i * 2
    );

    dock.add(post);
}

scene.add(dock);


/* =========================
   FISH
========================= */

const fish = [];

function createFish() {

    const group = new THREE.Group();

    const bodyMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x647d54,
            roughness: .5,
            metalness: .05
        });

    const body = new THREE.Mesh(
        new THREE.SphereGeometry(1, 16, 10),
        bodyMaterial
    );

    body.scale.set(1.8, .65, .65);

    group.add(body);


    const tail = new THREE.Mesh(
        new THREE.ConeGeometry(.7, 1.4, 3),
        bodyMaterial
    );

    tail.rotation.z = Math.PI / 2;
    tail.position.x = -1.6;

    group.add(tail);


    const finMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x34442d
        });


    const fin = new THREE.Mesh(
        new THREE.ConeGeometry(.4, 1, 3),
        finMaterial
    );

    fin.position.y = .6;
    fin.rotation.x = Math.PI;

    group.add(fin);


    group.position.set(
        (Math.random() - .5) * 250,
        -3 - Math.random() * 12,
        (Math.random() - .5) * 250
    );

    const scale = .7 + Math.random() * .7;

    group.scale.setScalar(scale);

    scene.add(group);

    fish.push({
        object: group,
        speed: .015 + Math.random() * .025,
        angle: Math.random() * Math.PI * 2,
        size: scale
    });
}

for (let i = 0; i < 35; i++) {
    createFish();
}


/* =========================
   FISH AI
========================= */

function updateFish() {

    for (const f of fish) {

        const obj = f.object;

        f.angle +=
            (Math.random() - .5) * .01;

        obj.position.x +=
            Math.cos(f.angle) * f.speed;

        obj.position.z +=
            Math.sin(f.angle) * f.speed;

        obj.rotation.y =
            -f.angle;

        obj.position.y +=
            Math.sin(Date.now() * .001 + obj.id) * .002;

        if (Math.abs(obj.position.x) > 300) {
            obj.position.x *= -.9;
        }

        if (Math.abs(obj.position.z) > 300) {
            obj.position.z *= -.9;
        }
    }
}


/* =========================
   PLAYER
========================= */

const keys = {};

let yaw = 0;
let pitch = 0;

let velocity = new THREE.Vector3();

document.addEventListener("keydown", e => {

    keys[e.code] = true;

    if (e.code === "Space") {
        e.preventDefault();
    }
});

document.addEventListener("keyup", e => {
    keys[e.code] = false;
});


renderer.domElement.addEventListener(
    "click",
    () => {

        if (
            document.pointerLockElement !==
            renderer.domElement
        ) {
            renderer.domElement.requestPointerLock();
        }

    }
);


document.addEventListener(
    "mousemove",
    e => {

        if (
            document.pointerLockElement !==
            renderer.domElement
        ) return;

        yaw -= e.movementX * .002;
        pitch -= e.movementY * .002;

        pitch = Math.max(
            -1.4,
            Math.min(1.4, pitch)
        );

    }
);


/* =========================
   ROD
========================= */

const rod = new THREE.Group();

const rodMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x181b1c,
        roughness: .45
    });

const rodBody = new THREE.Mesh(
    new THREE.CylinderGeometry(
        .045,
        .07,
        5,
        12
    ),
    rodMaterial
);

rodBody.rotation.z = Math.PI / 2;

rod.add(rodBody);

rod.position.set(
    .8,
    -1.2,
    -1.5
);

camera.add(rod);
scene.add(camera);


/* =========================
   FISHING
========================= */

let fishingState = "ready";

let biteTimer = null;

let hookedFish = null;

let tension = 0;

const statusTitle =
    document.getElementById("statusTitle");

const statusText =
    document.getElementById("statusText");

const fishInfo =
    document.getElementById("fishInfo");

const fishName =
    document.getElementById("fishName");

const tensionBar =
    document.getElementById("tensionBar");


function setStatus(title, text) {

    statusTitle.textContent = title;
    statusText.textContent = text;
}


function castLine() {

    if (fishingState !== "ready") return;

    fishingState = "waiting";

    setStatus(
        "LINE CAST",
        "Waiting for a bite..."
    );

    fishInfo.style.opacity = ".8";

    biteTimer = setTimeout(() => {

        if (fishingState !== "waiting") return;

        fishingState = "bite";

        setStatus(
            "FISH ON!",
            "SPACE to set the hook!"
        );

        fishName.textContent =
            "LARGEMOUTH BASS";

        tension = 20;

    }, 2500 + Math.random() * 3500);
}


function hookFish() {

    if (fishingState === "bite") {

        fishingState = "fighting";

        setStatus(
            "FISH HOOKED",
            "Hold SPACE to reel!"
        );

        hookedFish =
            fish[
                Math.floor(
                    Math.random() * fish.length
                )
            ];

    }

    else if (
        fishingState === "fighting" &&
        hookedFish
    ) {

        tension += 7;

        if (tension > 100) {

            fishingState = "ready";

            tension = 0;

            setStatus(
                "LINE BROKE",
                "The fish got away."
            );

            fishInfo.style.opacity = ".25";

            hookedFish = null;
        }

        else {

            hookedFish.object.position.lerp(
                camera.position,
                .04
            );

            if (
                hookedFish.object.position.distanceTo(
                    camera.position
                ) < 4
            ) {
                catchFish();
            }

        }

    }

}


function catchFish() {

    fishingState = "ready";

    const weight =
        (2 + Math.random() * 6).toFixed(1);

    document.getElementById(
        "caughtFish"
    ).textContent =
        "LARGEMOUTH BASS";

    document.getElementById(
        "caughtWeight"
    ).textContent =
        weight + " lb";

    document.getElementById(
        "catchScreen"
    ).style.display =
        "flex";

    tension = 0;

    fishInfo.style.opacity = ".25";

    setStatus(
        "CAUGHT",
        "Nice catch!"
    );
}


/* =========================
   INPUT
========================= */

document.addEventListener(
    "keydown",
    e => {

        if (e.code !== "Space") return;

        if (fishingState === "ready") {

            castLine();

        } else {

            hookFish();

        }

    }
);


document.getElementById(
    "keepFish"
).addEventListener(
    "click",
    () => {

        const money =
            document.getElementById("money");

        money.textContent =
            Number(money.textContent) + 35;

        document.getElementById(
            "catchScreen"
        ).style.display =
            "none";

    }
);


document.getElementById(
    "releaseFish"
).addEventListener(
    "click",
    () => {

        document.getElementById(
            "catchScreen"
        ).style.display =
            "none";

    }
);


/* =========================
   MOVEMENT
========================= */

function updatePlayer() {

    const direction =
        new THREE.Vector3();

    if (keys["KeyW"])
        direction.z -= 1;

    if (keys["KeyS"])
        direction.z += 1;

    if (keys["KeyA"])
        direction.x -= 1;

    if (keys["KeyD"])
        direction.x += 1;


    if (direction.length() > 0) {

        direction.normalize();

        direction.applyAxisAngle(
            new THREE.Vector3(0, 1, 0),
            yaw
        );

        velocity.lerp(
            direction.multiplyScalar(.35),
            .12
        );

    } else {

        velocity.lerp(
            new THREE.Vector3(),
            .15
        );

    }

    camera.position.add(velocity);

    camera.position.y =
        5 + Math.sin(
            Date.now() * .006
        ) * .015;

    camera.rotation.order = "YXZ";

    camera.rotation.y = yaw;
    camera.rotation.x = pitch;

}


/* =========================
   CLOUDS
========================= */

function createCloud(x, y, z) {

    const group = new THREE.Group();

    const material =
        new THREE.MeshStandardMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: .72
        });

    for (let i = 0; i < 6; i++) {

        const cloud = new THREE.Mesh(
            new THREE.SphereGeometry(
                10 + Math.random() * 8,
                12,
                8
            ),
            material
        );

        cloud.position.set(
            i * 8,
            Math.random() * 5,
            Math.random() * 10
        );

        group.add(cloud);
    }

    group.position.set(x, y, z);

    scene.add(group);
}

createCloud(-120, 80, -150);
createCloud(100, 100, -250);
createCloud(250, 75, 100);


/* =========================
   LOADING
========================= */

let progress = 0;

const loadingInterval =
    setInterval(() => {

        progress += 10;

        document.getElementById(
            "loadProgress"
        ).style.width =
            progress + "%";

        if (progress >= 100) {

            clearInterval(
                loadingInterval
            );

            setTimeout(() => {

                const loading =
                    document.getElementById(
                        "loading"
                    );

                loading.style.opacity = "0";

                setTimeout(() => {
                    loading.style.display = "none";
                }, 1000);

            }, 400);

        }

    }, 100);


/* =========================
   GAME LOOP
========================= */

const clock = new THREE.Clock();

function animate(time) {

    requestAnimationFrame(animate);

    updatePlayer();

    updateFish();

    animateWater(time);

    if (fishingState === "fighting") {

        tension +=
            Math.sin(time * .004) * .7;

        tension = Math.max(
            0,
            Math.min(100, tension)
        );

        tensionBar.style.width =
            tension + "%";

        if (tension > 80) {

            setStatus(
                "HIGH TENSION",
                "Release SPACE!"
            );

        }
    }

    renderer.render(
        scene,
        camera
    );
}

animate();


/* =========================
   RESIZE
========================= */

window.addEventListener(
    "resize",
    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

    }
);
