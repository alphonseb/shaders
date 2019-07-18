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