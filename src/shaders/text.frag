varying vec2 v_uv;
varying vec3 v_normal;
varying vec3 v_position;

void main() {
    vec3 colorBlue = vec3(0., 0., 1.0);
    vec3 colorRed = vec3(1., 0., 0.);
    vec3 color = mix(colorBlue, colorRed, v_normal.z);
    color += vec3(0.0, v_normal.y, 0.0);
    gl_FragColor = vec4(color, 1.0);
}