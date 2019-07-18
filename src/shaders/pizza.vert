#define PI 3.1415926535897932384626433832795
uniform float u_time;
uniform float u_mouseX;

varying vec2 v_uv;



void main() {
    v_uv = uv;

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    modelPosition.x += u_mouseX * sin(1.0 * PI * uv.y) * sin(PI * uv.x);
    modelPosition.x += u_mouseX * sin(1.0 * PI * uv.y);
    // modelPosition.z += sin(u_time) * sin(PI * uv.y);
    // modelPosition.y += sin(u_time * 7.) * sin(3.0 * PI * uv.x) / 10.0;

    gl_Position = projectionMatrix * viewMatrix * modelPosition ;
}