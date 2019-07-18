import * as THREE from 'three';

import imageSlideVertex from '../shaders/image-slide.vert';
import imageSlideFragment from '../shaders/image-slide.frag';

export default class ImageSlide {
    constructor(options) {
        this.textureLoader = options.textureLoader
        this.textureSrc = options.textureSrc
        this.imageWidth = options.width

        this.init()
    }

    init() {
        const texture = this.textureLoader.load(this.textureSrc, () => {
            this.ratio = texture.image.width / texture.image.height;
            this.createMesh()
        })

        this.material = new THREE.ShaderMaterial({
            uniforms: {
                u_time: { value: 0 },
                u_timing: { value: 0 },
                u_pizza: {
                    type: 't',
                    value: texture
                },
                u_mouseX: { value: 0 },
                u_clickedX: { value: 0 },
                u_clickedY: { value: 0 },
                u_translateX: { value: 0 },
                u_ratio: { value: 0 },
                u_clicked: { value: false }
            },
            vertexShader: imageSlideVertex,
            fragmentShader: imageSlideFragment
        })

        this.container = new THREE.Object3D()
    }

    createMesh() {
        const geometry = new THREE.PlaneGeometry(this.imageWidth, this.imageWidth / this.ratio, 8, 8)
        this.material.uniforms.u_ratio.value = this.ratio;
        const mesh = new THREE.Mesh(geometry, this.material);
        mesh.name = 'pizza';
        this.container.add(mesh)
        this.container.position.x = 0
    }
}