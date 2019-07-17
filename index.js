import * as THREE from 'three';
import { Tweenmax } from 'gsap';
import normalizeWheel from 'normalize-wheel';

import './style.css';
import textureSrc from './alu-texture.jpg';
import pizza from './pizza.jpeg';

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
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(sizes.width, sizes.height);
document.body.appendChild(renderer.domElement);

/**
 * 
 * OBJECT
 * 
 */

/**
 * Geometry
 */
const geometry = new THREE.SphereGeometry(5, 100, 100);


const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load(textureSrc)
console.log(textureSrc);




/**
 * Material
 */
// const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const material = new THREE.ShaderMaterial({
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
            value: texture
        }
    },
    vertexShader: `
        #define PI 3.1415926535897932384626433832795

        uniform float u_time;
        uniform vec2 u_mouse;
        varying float v_offset;
        varying vec3 v_normal;
        varying vec2 v_uv;

        void main() {
            vec4 modelPosition = modelMatrix * vec4(position, 1.0);
            float offset = sin(u_time) * (sin(PI * normal.x * u_mouse.y) + cos(PI * normal.y * u_mouse.x));
            offset += cos(modelPosition.x * 0.3 - u_time);
            // float offset = sin(u_time) * 2.0 * (sin(5.0 * normal.x * u_mouse.y) * cos(5.0 * normal.y * u_mouse.x)) / 5.0;
            // float offset = sin(u_time) * (sin(5.0 * (pow(normal.x * u_mouse.y, 2.0) + pow(normal.y * u_mouse.x, 2.0))));

            v_offset = offset;
            v_normal = normal;
            v_uv = uv;
            modelPosition.xyz += offset; 
            gl_Position = projectionMatrix * viewMatrix * modelPosition;
        }
    `,
    fragmentShader: `
        #define PI 3.1415926535897932384626433832795
        uniform float u_time;
        uniform sampler2D u_texture;

        varying float v_offset;
        varying vec3 v_normal;
        varying vec2 v_uv;

        vec3 color1 = vec3(0.0, 0.3, 1.0);
        vec3 color2 = vec3(1.0, 0.3, 0.0);

        void main() {
            vec3 color = mix(color1, color2, (v_offset / 2.0) + 0.5);
            vec4 texture = texture2D(u_texture, v_uv);
            vec3 textureColor = texture.rgb;
            gl_FragColor = vec4(textureColor + color * ((sin(v_normal * 1.5) / 2.0) + 0.5) , 1.0);
        }
    `
});


/**
 * Mesh
 */
const mesh = new THREE.Mesh(geometry, material);

const meshContainer = new THREE.Object3D();
meshContainer.add(mesh)
meshContainer.position.x = -10
// scene.add(meshContainer);

let pizzaRatio;
const pizzaTexture = textureLoader.load(pizza, () => {
    pizzaRatio = pizzaTexture.image.width / pizzaTexture.image.height;
    createPizzaMesh()
})

const planeShaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
        u_time: {
            value: 0
        },
        u_pizza: {
            type: 't',
            value: pizzaTexture
        },
        u_mouseX: {
            value: 0 
        },
        u_translateX: {
            value: 0
        },
        u_ratio: {
            value: 0
        }
    },
    vertexShader: `
        #define PI 3.1415926535897932384626433832795
        uniform float u_time;
        uniform float u_mouseX;
        // uniform float u_translateX;

        varying vec2 v_uv;

        void main() {
            v_uv = uv;

            vec4 modelPosition = modelMatrix * vec4(position, 1.0);
            modelPosition.x += u_mouseX * sin(1.0 * PI * uv.y);
            gl_Position = projectionMatrix * viewMatrix * modelPosition ;
        }
    `,
    fragmentShader: `
        uniform sampler2D u_pizza;
        uniform float u_time;
        uniform float u_ratio;

        varying vec2 v_uv;

        void main() {
            vec2 st = vec2(v_uv.x, v_uv.y / u_ratio);
            vec4 pizzaTexture = texture2D(u_pizza, v_uv);
            float circlePct = distance(st, vec2(0.5, 0.5 / u_ratio));
            float smallCirclePct = distance(st, vec2(0.0));
            float smallCircle2Pct = distance(st, vec2(0.8, 0.6 / u_ratio));
            float smallCircle3Pct = distance(st, vec2(0.2, 1.0 / u_ratio));
            float smallCircle4Pct = distance(st, vec2(1.0, 0.2 / u_ratio));
            
            pizzaTexture.a = 1.0 - step(-0.5 + u_time * 0.4, circlePct * 2.0);
            pizzaTexture.a += 1.0 - step(u_time * 0.1, smallCirclePct);
            pizzaTexture.a += 1.0 - step(u_time * 0.2, smallCircle2Pct * 1.6);
            pizzaTexture.a += 1.0 - step(u_time * 0.2, smallCircle3Pct * 1.6);
            pizzaTexture.a += 1.0 - step(u_time * 0.25, smallCircle4Pct * 2.0);
            
            gl_FragColor = pizzaTexture;
        }
    `
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

let totalCursorMoved = 0;

window.addEventListener('mousedown', (ev) => {
    currentCursorMoving.x = ev.clientX / sizes.width - 0.5;
    currentCursorMoving.y = ev.clientY / sizes.width - 0.5;
    
    isCursorDown = true;
    totalCursorMoved = 0;
});



window.addEventListener('mousemove', (ev) => {
    
    cursorMoving.x = ev.clientX / sizes.width - 0.5;
    cursorMoving.y = ev.clientY / sizes.height - 0.5;

    

    if (isCursorDown) {
        cursorMoved.x = cursorMoving.x - currentCursorMoving.x;
        cursorMoved.y = cursorMoving.y - currentCursorMoving.y;

        totalCursorMoved += cursorMoved.x

        

        // material.uniforms.u_mouse.value.x += cursorMoved.y * 5
        // material.uniforms.u_mouse.value.y += cursorMoved.x * 5
        if (Math.abs(planeShaderMaterial.uniforms.u_mouseX.value + cursorMoved.x * 5) > 1.5) {
            planeShaderMaterial.uniforms.u_mouseX.value = Math.sign(planeShaderMaterial.uniforms.u_mouseX.value) * 1.5
        } else {
            planeShaderMaterial.uniforms.u_mouseX.value += cursorMoved.x * 5
        }

        planeShaderMaterial.uniforms.u_translateX.value += cursorMoved.x * 10

        
        currentCursorMoving.x = cursorMoving.x;
        currentCursorMoving.y = cursorMoving.y;
        
        // meshContainer.rotation.y += cursorMoved.x * 3;
        // meshContainer.rotation.x += cursorMoved.y * 3;
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
    if (Math.abs(totalCursorMoved * 10) > 1) {
        
        TweenMax.to(planeContainer.position, 1.2, {
            x: `+=${ Math.sign(totalCursorMoved) * Math.min(Math.abs(totalCursorMoved) * 10, 5) }`,
            ease: Power4.easeOut,
            onComplete: () => {
                totalCursorMoved = 0;
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



const loop = () => {

    if (keyPressed === 'ArrowLeft') {
        meshContainer.rotation.y += 0.05;
    }
    if (keyPressed === 'ArrowRight') {
        meshContainer.rotation.y -= 0.05;
    }
    if (keyPressed === 'ArrowUp') {
        meshContainer.rotation.x += 0.05;
    }
    if (keyPressed === 'ArrowDown') {
        meshContainer.rotation.x -= 0.05;
    }
    
    // shaderMaterial.uniforms.uTime.value += 0.5;
    material.uniforms.u_time.value += 0.05;
    planeShaderMaterial.uniforms.u_time.value += 0.05;
    
    camera.lookAt(scene.position)
    renderer.render(scene, camera);
    
    window.requestAnimationFrame(loop);
};

loop();