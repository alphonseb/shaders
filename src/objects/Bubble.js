import * as THREE from 'three';

import bubbleTextureSrc from '../textures/alu-texture.jpg';

import bubbleVertex from '../shaders/bubble.vert';
import bubbleFragment from '../shaders/bubble.frag';

export default class Bubble {
    constructor(options) {
        this.textureLoader = options.textureLoader;
        this.scene = options.scene;

        this.init();
    }

    init() {
        const bubbleGeometry = new THREE.SphereGeometry(5, 100, 100);

        const bubbleTexture = this.textureLoader.load(bubbleTextureSrc)
        this.material = new THREE.ShaderMaterial({
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

        const bubbleMesh = new THREE.Mesh(bubbleGeometry, this.material);
        bubbleMesh.name = 'bubble';

        this.container = new THREE.Object3D();
        this.container.add(bubbleMesh)
        this.container.position.x = 0.0

        const bubbleBox = new THREE.Box3().setFromObject( bubbleMesh );
        this.size = new THREE.Vector3();
        bubbleBox.getSize(this.size)
    }
}