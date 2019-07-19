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
import pizzaTextureSrc from './textures/pizza.jpeg';

/**
 * OBJECTS
 */
import Bubble from './objects/Bubble';
import ImageSlide from './objects/ImageSlide';
import Text from './objects/Text';

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
camera.position.z = 18;
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

const bubble = new Bubble({ textureLoader })

/**
 * Pizza
 */

const imageSlide = new ImageSlide({
    textureLoader,
    textureSrc: pizzaTextureSrc,
    width: 8
})

/**
 * Text
 */
const text = new Text();

/**
 * Object Selection
 */

const $imageControls = document.querySelector('.image-controls')

const $select = document.querySelector('.js-obj-select');
$select.addEventListener('change', (ev) => {
    $imageControls.style.display = 'none';
    while (scene.children.length) {
        scene.remove(scene.children[0]);
    }
    switch (ev.target.selectedOptions[0].value) {
        case 'image-slide':
            $imageControls.style.display = 'initial';
            imageSlide.material.uniforms.u_time.value = 0;
            scene.add(imageSlide.container);
            break;
        case 'bubble':
            scene.add(bubble.container);
            break;
        case 'text':
            scene.add(text.container);
            text.material.uniforms.u_time.value = 0;
        break;
    }
}) ;

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
        imageSlide.material.uniforms.u_timing.value = 0;

        if (holeActive) {
            imageSlide.material.uniforms.u_clicked.value = true;
        }

        imageSlide.material.uniforms.u_clickedX.value = intersections[0].uv.x;
        imageSlide.material.uniforms.u_clickedY.value = intersections[0].uv.y;
    }

    if (isOn['bubble']) {
        isCursorDownOn['bubble'] = true;
        TweenMax.killTweensOf(bubble.container.position)
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


        
        if (Math.abs(imageSlide.material.uniforms.u_mouseX.value + cursorMoved.x * 5) > 1.5) {
            imageSlide.material.uniforms.u_mouseX.value = Math.sign(imageSlide.material.uniforms.u_mouseX.value) * 1.5
        } else {
            imageSlide.material.uniforms.u_mouseX.value += cursorMoved.x * 5
        }

        
    }
    
    if (isCursorDownOn['bubble']) {
        bubble.material.uniforms.u_mouse.value.x += cursorMoved.y * 1.5;
        bubble.material.uniforms.u_mouse.value.y += cursorMoved.x * 1.5;
    }
});

window.addEventListener('mouseup', () => {
    if (isCursorDownOn['pizza']) {
        if (Math.abs(totalCursorMoved.x * 10) > 1) {
            
            TweenMax.to(imageSlide.container.position, 1.2, {
                x: `+=${ Math.sign(totalCursorMoved.x) * Math.min(Math.abs(totalCursorMoved.x) * 10, 10) }`,
                ease: Power4.easeOut,
                onComplete: () => {
                    totalCursorMoved.x = 0;
                }
            });
        }
        TweenMax.to(imageSlide.material.uniforms.u_mouseX, 0.6, {
            value: 0,
            ease: Power2.easeOut
        })
        isCursorDownOn['pizza'] = false;
    }
    if (isCursorDownOn['bubble']) {
        if (Math.abs(totalCursorMoved.x * 10) > 1) {
            TweenMax.to(bubble.container.position, 5, {
                x: `+=${ Math.sign(totalCursorMoved.x) * Math.min(Math.abs(totalCursorMoved.x) * 30, 50) }`,
                ease: Power4.easeOut,
                onComplete: () => {
                    totalCursorMoved.x = 0;
                }
            });
            TweenMax.to(bubble.container.rotation, 5, {
                y: `+=${ Math.sign(totalCursorMoved.x) * Math.min(Math.abs(totalCursorMoved.x) * 20, 10) }`,
                ease: Power4.easeOut,
                onComplete: () => {
                    totalCursorMoved.x = 0;
                }
            });
        }
        if (Math.abs(totalCursorMoved.y * 10) > 1) {
            TweenMax.to(bubble.container.position, 5, {
                y: `+=${ -Math.sign(totalCursorMoved.y) * Math.min(Math.abs(totalCursorMoved.y) * 30, 50) }`,
                ease: Power4.easeOut,
                onComplete: () => {
                    totalCursorMoved.y = 0;
                }
            });
            TweenMax.to(bubble.container.rotation, 5, {
                x: `+=${ Math.sign(totalCursorMoved.y) * Math.min(Math.abs(totalCursorMoved.y) * 20, 10) }`,
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
    imageSlide.material.uniforms.u_time.value = 0;
})

const $bubbleBackButton = document.querySelector('.js-bubble-back');
$bubbleBackButton.addEventListener('click', () => {
    TweenMax.killTweensOf(bubble.container.position)
    bubble.container.position.x = 0;
    bubble.container.position.y = 0;
    $bubbleBackButton.style.display = 'none';
});

let holeActive = false;
const $holeCheckbox = document.querySelector('.js-hole');
$holeCheckbox.addEventListener('change', (ev) => {
    holeActive = !holeActive;
    if (!ev.target.checked) {
        imageSlide.material.uniforms.u_clicked.value = false;
    }
})
const raycaster = new THREE.Raycaster();

let intersections = [];

const loop = () => {

    if (cursorMoved.x === 0) {
        totalCursorMoved.x = 0;
    }
    if (cursorMoved.y === 0) {
        totalCursorMoved.y = 0;
    }
    
    if (isCursorDownOn['bubble']) {
        TweenMax.to(bubble.container.position, 3.5, {
            x: cursorMoving.x * Math.tan((camera.fov / 2) * Math.PI/180) * camera.position.z * 2,
            y: -cursorMoving.y * Math.tan((camera.fov / 2) * Math.PI/180) * camera.position.z * 2,
            ease: Power4.easeOut
        })
        TweenMax.to(bubble.container.rotation, 3.5, {
            y: cursorMoving.x * Math.tan((camera.fov / 2) * Math.PI/180) * camera.position.z * 0.5,
            x: cursorMoving.y * Math.tan((camera.fov / 2) * Math.PI/180) * camera.position.z * 0.5,
            ease: Power4.easeOut
        })
        // bubble.container.rotation.y += totalCursorMoved.x * 0.3;
        // bubble.container.rotation.x += totalCursorMoved.y * 0.3;
    }
    
    if ((Math.abs(bubble.container.position.x) > (Math.tan((camera.fov / 2) * Math.PI/180) * camera.position.z + bubble.size.x)
        || Math.abs(bubble.container.position.y) > (Math.tan((camera.fov / 2) * Math.PI/180) * camera.position.z + bubble.size.y)) && !isCursorDownOn['bubble']) {
        $bubbleBackButton.style.display = 'initial';
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

    bubble.material.uniforms.u_time.value += 0.05;
    imageSlide.material.uniforms.u_time.value += 0.05;
    imageSlide.material.uniforms.u_timing.value += 0.05;
    text.material.uniforms.u_time.value += 0.05;

    camera.lookAt(scene.position)
    renderer.render(scene, camera);
    
    window.requestAnimationFrame(loop);
};

loop();