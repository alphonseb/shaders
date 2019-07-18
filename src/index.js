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
    const planeGeometry = new THREE.PlaneGeometry(pizzaWidth, pizzaWidth / pizzaRatio, 100, 100)
    planeShaderMaterial.uniforms.u_ratio.value = pizzaRatio;
    const planeMesh = new THREE.Mesh(planeGeometry, planeShaderMaterial);
    planeContainer.add(planeMesh)
    planeContainer.position.x = 0
    scene.add(planeContainer)
}




// /**
//  * Shader
//  */
// const shaderGeometry = new THREE.SphereGeometry(1.5, 46, 46)
// const shaderMaterial = new THREE.ShaderMaterial({
//     uniforms:
//     {
//         uTime: { value: 0 }
//     },
//     vertexShader:
//     `
//         #define M_PI 3.1415926535897932384626433832795

//         uniform float uTime;

//         varying vec3 vNormal;
//         varying float vOffset;

//         void main()
//         {
//             vec4 modelPosition = modelMatrix * vec4(position, 1.0);

//             float offset = 0.0;
//             offset += sin(modelPosition.y * 20.0 - uTime * 0.03);
//             offset += sin(uv.x * M_PI * 2.0 - uTime * 0.03);
//             modelPosition.xyz += normal * offset * 0.1;

//             vOffset = offset;

//             vNormal = normal;

//             gl_Position = projectionMatrix * viewMatrix * modelPosition;
//         }
//     `,
//     fragmentShader:
//     `
//         varying vec3 vNormal;
//         varying float vOffset;

//         void main()
//         {
//             vec3 color = vNormal;
//             color += vec3(vOffset * 0.5);

//             gl_FragColor = vec4(color, 1.0);
//         }
//     `
// })
// const shaderMesh = new THREE.Mesh(shaderGeometry, shaderMaterial)
// scene.add(shaderMesh)

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

let isCursorDown = false;
let isMoving = false;

let totalCursorMoved = {
    x: 0,
    y: 0
};

let isOnImage = false;
let isOnBubble = false;

window.addEventListener('mousedown', (ev) => {
    currentCursorMoving.x = ev.clientX / sizes.width - 0.5;
    currentCursorMoving.y = ev.clientY / sizes.width - 0.5;

    if (isOnImage) {
        
        isCursorDown = true;
        planeShaderMaterial.uniforms.u_timing.value = 0;
        
        if (holeActive) {
            planeShaderMaterial.uniforms.u_clicked.value = !planeShaderMaterial.uniforms.u_clicked.value;
        }
        planeShaderMaterial.uniforms.u_clickedX.value = pizzaIntersection[0].uv.x;
        planeShaderMaterial.uniforms.u_clickedY.value = pizzaIntersection[0].uv.y;
    }
    

    totalCursorMoved.x = 0;
    totalCursorMoved.y = 0;
});

const raycastingMouse = new THREE.Vector2()



window.addEventListener('mousemove', (ev) => {
    
    cursorMoving.x = ev.clientX / sizes.width - 0.5;
    cursorMoving.y = ev.clientY / sizes.height - 0.5;
    raycastingMouse.x = (ev.clientX / sizes.width) * 2 - 1;
    raycastingMouse.y = (ev.clientY / sizes.height) * 2 - 1;
    

    if (isCursorDown) {
        cursorMoved.x = cursorMoving.x - currentCursorMoving.x;
        cursorMoved.y = cursorMoving.y - currentCursorMoving.y;

        totalCursorMoved.x += cursorMoved.x
        totalCursorMoved.y += cursorMoved.y

        // material.uniforms.u_mouse.value.x += cursorMoved.y * 5
        // material.uniforms.u_mouse.value.y += cursorMoved.x * 5

        if (Math.abs(planeShaderMaterial.uniforms.u_mouseX.value + cursorMoved.x * 5) > 1.5) {
            planeShaderMaterial.uniforms.u_mouseX.value = Math.sign(planeShaderMaterial.uniforms.u_mouseX.value) * 1.5
        } else {
            planeShaderMaterial.uniforms.u_mouseX.value += cursorMoved.x * 5
        }

        
        currentCursorMoving.x = cursorMoving.x;
        currentCursorMoving.y = cursorMoving.y;
        
        // bubbleContainer.rotation.y += cursorMoved.x * 3;
        // bubbleContainer.rotation.x += cursorMoved.y * 3;
        // camera.position.x += cursorMoved.x * 3;
        // camera.position.y += cursorMoved.y * 3;
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
    if (Math.abs(totalCursorMoved.x * 10) > 1) {
        
        TweenMax.to(planeContainer.position, 1.2, {
            x: `+=${ Math.sign(totalCursorMoved.x) * Math.min(Math.abs(totalCursorMoved.x) * 10, 10) }`,
            ease: Power4.easeOut,
            onComplete: () => {
                totalCursorMoved.x = 0;
            }
        });
    }
    isCursorDown = false;
    TweenMax.to(planeShaderMaterial.uniforms.u_mouseX, 0.6, {
        value: 0,
        ease: Power2.easeOut
    })
    // TweenMax.to(planeShaderMaterial.uniforms.u_translateX, 1, {
    //     value: `+=${ cursorMoved.x * 1000 }`,
    //     ease: Power2.easeOut
    // })
    // planeShaderMaterial.uniforms.u_mouseX.value = 0
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

let pizzaIntersection = [];

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

    
    pizzaIntersection = raycaster.intersectObject(planeContainer, true)
    const bubbleIntersection = raycaster.intersectObject(bubbleContainer, true)
    if (pizzaIntersection.length) {
        isOnImage = true;
    } else {
        isOnImage = false;
    }
    if (bubbleIntersection.length) {
        isOnBubble = true;
    } else {
        isOnBubble = false;
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