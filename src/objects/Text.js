import * as  THREE from 'three';

import textVertex from '../shaders/text.vert';
import textFragment from '../shaders/text.frag';

export default class Text {
    constructor(options) {
        this.container = new THREE.Group();
        this.string = options.string;
        this.fontSrc = options.font;

        this.init();
    }

    init() {
        const fontLoader = new THREE.FontLoader();
        const font = fontLoader.parse(this.fontSrc)
        const geometry = new THREE.TextGeometry(this.string, {
            font,
            size: 10,
            height: 5,
            curveSegments: 12,
            // bevelEnabled: true,
            // bevelThickness: 1,
            // bevelSize: 1
        });
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                u_time: { value: 0 },
                u_mouse: {
                    value: {
                        x: 0,
                        y: 0
                    }
                }
            },
            vertexShader: textVertex,
            fragmentShader: textFragment
        });
        const mesh = new THREE.Mesh(geometry, this.material);
        this.container.add(mesh);

        const box = new THREE.Box3().setFromObject( mesh );
        box.getCenter(mesh.position);
        mesh.position.multiplyScalar(-1);
        this.size = new THREE.Vector3();
        box.getSize(this.size)

        this.container.position.x = 0;
        this.container.position.y = 0;

        // this.container.rotation.z = -0.5;
        this.container.rotation.x = -0.5;


        window.addEventListener('mousemove', (ev) => {
            this.container.rotation.y = (ev.clientX / window.innerWidth) * 2 - 1
            this.container.rotation.x = (ev.clientY / window.innerHeight) * 2 - 1
        })
    }
}