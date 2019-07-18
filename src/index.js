/**
 * MODULES
 */
import * as THREE from 'three';
import { TweenMax } from 'gsap';
import normalizeWheel from 'normalize-wheel';

/**
 * STYLE
 */
import './style.css';

/**
 * TEXTURES
 */
import bubbleTextureSrc from './textures/alu-texture.jpg';
import pizzaTextureSrc from './textures/pizza.jpeg';

/**
 * SHADERS
 */
import pizzaVertex from './shaders/pizza.vert';
import pizzaFragment from './shaders/pizza.frag';
import bubbleVertex from './shaders/bubble.vert';
import bubbleFragment from './shaders/bubble.frag';

/* ====================================== */

const sizes = {
    width: document.body.clientWidth,
    height: window.innerHeight
};

/**
 * Scene
 */
const scene = new THREE.Scene();

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.z = 12;
scene.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({ alpha: true }); // alpha: true allows transparent background
renderer.setSize(sizes.width, sizes.height);
document.body.appendChild(renderer.domElement);

/**
 * Texture Loader
 */
const textureLoader = new THREE.TextureLoader();

/**
 * 
 * OBJECTS
 * 
 */

/**
 * Bubble
 */
const bubbleGeometry = new THREE.SphereGeometry(5, 100, 100);

const bubbleTexture = textureLoader.load(bubbleTextureSrc)
const bubbleShaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
        u_time: { value: 0},
        u_mouse: {
            value: {
                x: 0.5,
                y: 0.5
            }
        },
        u_texture: {
            type: 't',
            value: bubbleTexture
        }
    },
    vertexShader: bubbleVertex,
    fragmentShader: bubbleFragment
});

const bubbleMesh = new THREE.Mesh(bubbleGeometry, bubbleShaderMaterial);
bubbleMesh.name = 'bubble';

const bubbleContainer = new THREE.Object3D();
bubbleContainer.add(bubbleMesh)
bubbleContainer.position.x = -10
scene.add(bubbleContainer);

/**
 * Pizza
 */

let pizzaRatio;
const pizzaTexture = textureLoader.load(pizzaTextureSrc, () => {
    pizzaRatio = pizzaTexture.image.width / pizzaTexture.image.height;
    createPizzaMesh()
})

const planeShaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
        u_time: { value: 0 },
        u_timing: { value: 0 },
        u_pizza: {
            type: 't',
            value: pizzaTexture
        },
        u_mouseX: { value: 0 },
        u_clickedX: { value: 0 },
        u_clickedY: { value: 0 },
        u_translateX: { value: 0 },
        u_ratio: { value: 0 },
        u_clicked: { value: false }
    },
    vertexShader: pizzaVertex,
    fragmentShader: pizzaFragment
})

const planeContainer = new THREE.Object3D()
const createPizzaMesh = () => {
    const pizzaWidth = 8
    const planeGeometry = new THREE.PlaneGeometry(pizzaWidth, pizzaWidth / pizzaRatio, 8, 8)
    planeShaderMaterial.uniforms.u_ratio.value = pizzaRatio;
    const planeMesh = new THREE.Mesh(planeGeometry, planeShaderMaterial);
    planeMesh.name = 'pizza';
    planeContainer.add(planeMesh)
    planeContainer.position.x = 0
    scene.add(planeContainer)
}

/**
 * Cursor
 */
const cursorMoved = {
    x: 0,
    y: 0
};

const cursorMoving = { 
    x: 0,
    y: 0
};

const currentCursorMoving = {
    x: 0,
    y: 0
};

let totalCursorMoved = {
    x: 0,
    y: 0
};

const isCursorDownOn = {
    bubble: false,
    pizza: false
};

const isOn = {
    bubble: false,
    pizza: false
}

window.addEventListener('mousedown', (ev) => {
    currentCursorMoving.x = ev.clientX / sizes.width - 0.5;
    currentCursorMoving.y = ev.clientY / sizes.width - 0.5;

    
    if (isOn['pizza']) {
        isCursorDownOn['pizza'] = true;
        planeShaderMaterial.uniforms.u_timing.value = 0;

        if (holeActive) {
            planeShaderMaterial.uniforms.u_clicked.value = !planeShaderMaterial.uniforms.u_clicked.value;
        }

        planeShaderMaterial.uniforms.u_clickedX.value = intersections[0].uv.x;
        planeShaderMaterial.uniforms.u_clickedY.value = intersections[0].uv.y;
    }

    if (isOn['bubble']) {
        isCursorDownOn['bubble'] = true;
    }

    totalCursorMoved.x = 0;
    totalCursorMoved.y = 0;
});

const raycastingMouse = new THREE.Vector2()



window.addEventListener('mousemove', (ev) => {
    
    cursorMoving.x = ev.clientX / sizes.width - 0.5;
    cursorMoving.y = ev.clientY / sizes.height - 0.5;
    raycastingMouse.x = (ev.clientX / sizes.width) * 2 - 1;
    raycastingMouse.y = (1 - ev.clientY / sizes.height) * 2 - 1;
    
    cursorMoved.x = cursorMoving.x - currentCursorMoving.x;
    cursorMoved.y = cursorMoving.y - currentCursorMoving.y;
    totalCursorMoved.x += cursorMoved.x
    totalCursorMoved.y += cursorMoved.y
    currentCursorMoving.x = cursorMoving.x;
    currentCursorMoving.y = cursorMoving.y;
    

    if (isCursorDownOn['pizza']) {


        
        if (Math.abs(planeShaderMaterial.uniforms.u_mouseX.value + cursorMoved.x * 5) > 1.5) {
            planeShaderMaterial.uniforms.u_mouseX.value = Math.sign(planeShaderMaterial.uniforms.u_mouseX.value) * 1.5
        } else {
            planeShaderMaterial.uniforms.u_mouseX.value += cursorMoved.x * 5
        }

        
    }
    
    if (isCursorDownOn['bubble']) {
        bubbleShaderMaterial.uniforms.u_mouse.value.x += cursorMoved.y * 0.5;
        bubbleShaderMaterial.uniforms.u_mouse.value.y += cursorMoved.x * 0.5;
    }
});

let keyPressed;

window.addEventListener('keydown', (ev) => {
    keyPressed = ev.key;
})
window.addEventListener('keyup', () => {
    keyPressed = null;
})

window.addEventListener('mouseup', () => {
    if (isCursorDownOn['pizza']) {
        if (Math.abs(totalCursorMoved.x * 10) > 1) {
            
            TweenMax.to(planeContainer.position, 1.2, {
                x: `+=${ Math.sign(totalCursorMoved.x) * Math.min(Math.abs(totalCursorMoved.x) * 10, 10) }`,
                ease: Power4.easeOut,
                onComplete: () => {
                    totalCursorMoved.x = 0;
                }
            });
        }
        TweenMax.to(planeShaderMaterial.uniforms.u_mouseX, 0.6, {
            value: 0,
            ease: Power2.easeOut
        })
        isCursorDownOn['pizza'] = false;
    }
    if (isCursorDownOn['bubble']) {
        if (Math.abs(totalCursorMoved.x * 10) > 1) {
            TweenMax.to(bubbleContainer.position, 5, {
                x: `+=${ Math.sign(totalCursorMoved.x) * Math.min(Math.abs(totalCursorMoved.x) * 30, 50) }`,
                ease: Power4.easeOut,
                onComplete: () => {
                    totalCursorMoved.x = 0;
                }
            });
            TweenMax.to(bubbleContainer.rotation, 5, {
                y: `+=${ Math.sign(totalCursorMoved.x) * Math.min(Math.abs(totalCursorMoved.x) * 10, 5) }`,
                ease: Power4.easeOut,
                onComplete: () => {
                    totalCursorMoved.x = 0;
                }
            });
        }
        if (Math.abs(totalCursorMoved.y * 10) > 1) {
            TweenMax.to(bubbleContainer.position, 5, {
                y: `+=${ -Math.sign(totalCursorMoved.y) * Math.min(Math.abs(totalCursorMoved.y) * 30, 50) }`,
                ease: Power4.easeOut,
                onComplete: () => {
                    totalCursorMoved.y = 0;
                }
            });
            TweenMax.to(bubbleContainer.rotation, 5, {
                x: `+=${ Math.sign(totalCursorMoved.y) * Math.min(Math.abs(totalCursorMoved.y) * 10, 5) }`,
                ease: Power4.easeOut,
                onComplete: () => {
                    totalCursorMoved.y = 0;
                }
            });
        }
        isCursorDownOn['bubble'] = false;
    }
});

window.addEventListener('mousewheel', (ev) => {
    const normalizedWheel = normalizeWheel(ev);
    const offset = camera.position.z + normalizedWheel.pixelY * 0.01;
    if(offset < 1.3) {
        camera.position.z = 1.3;
    } else if (offset > 23.5) {
        camera.position.z = 23.5;
    } else {
        camera.position.z = offset;
    }
});

const $button = document.querySelector('.js-doit');
$button.addEventListener('click', () => {
    planeShaderMaterial.uniforms.u_time.value = 0;
})

let holeActive = false;
const $holeCheckbox = document.querySelector('.js-hole');
$holeCheckbox.addEventListener('change', () => {
    holeActive = !holeActive;
})
const raycaster = new THREE.Raycaster();

let intersections = [];

const loop = () => {
    if (keyPressed === 'ArrowLeft') {
        bubbleContainer.rotation.y += 0.05;
    }
    if (keyPressed === 'ArrowRight') {
        bubbleContainer.rotation.y -= 0.05;
    }
    if (keyPressed === 'ArrowUp') {
        bubbleContainer.rotation.x += 0.05;
    }
    if (keyPressed === 'ArrowDown') {
        bubbleContainer.rotation.x -= 0.05;
    }
    
    raycaster.setFromCamera(raycastingMouse, camera);

    intersections = raycaster.intersectObjects(scene.children, true);
    if (intersections.length) {
        isOn[intersections[0].object.name] = true;
    } else {
        Object.keys(isOn).forEach((key) => {
            isOn[key] = false
        })
    }

    // shaderMaterial.uniforms.uTime.value += 0.5;
    bubbleShaderMaterial.uniforms.u_time.value += 0.05;
    planeShaderMaterial.uniforms.u_time.value += 0.05;
    planeShaderMaterial.uniforms.u_timing.value += 0.05;
    
    camera.lookAt(scene.position)
    renderer.render(scene, camera);
    
    window.requestAnimationFrame(loop);
};

loop();