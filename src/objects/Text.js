import * as  THREE from 'three';

import Oswald from '../fonts/Oswald_Regular.json';

import textVertex from '../shaders/text.vert';
import textFragment from '../shaders/text.frag';

export default class Text {
    constructor() {
        this.container = new THREE.Object3D();

        this.init();
    }

    init() {
        const fontLoader = new THREE.FontLoader();
        const font = fontLoader.parse(Oswald)
        const geometry = new THREE.TextGeometry('Test', {
            font,
            size: 10,
            height: 5 
        });
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                u_time: { value: 0 }
            },
            vertexShader: textVertex,
            fragmentShader: textFragment
        });
        const mesh = new THREE.Mesh(geometry, this.material);
        this.container.add(mesh);

        const box = new THREE.Box3().setFromObject( mesh );
        this.size = new THREE.Vector3();
        box.getSize(this.size)

        this.container.position.x = -this.size.x / 2;
        this.container.position.y = -this.size.y / 2;

        this.container.rotation.z = -0.5;
        this.container.rotation.x = -0.5;


        window.addEventListener('mousemove', (ev) => {
            this.container.rotation.z = (ev.clientX / window.innerWidth) * 2 - 1
            this.container.rotation.y = (ev.clientY / window.innerHeight) * 2 - 1
        })
    }
}