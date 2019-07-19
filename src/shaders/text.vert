#define PI 3.1415926535897932384626433832795

uniform float u_time;

varying vec2 v_uv;
varying vec3 v_normal;
varying vec3 v_position;

void main() {
    v_uv = uv;
    v_normal = normal;

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    v_position = modelPosition.xyz;

    // modelPosition.z += sin(u_time) * modelPosition.x;
    // modelPosition.z += sin(u_time) * modelPosition.y;
    modelPosition.z += sin(PI * modelPosition.z);

    gl_Position = projectionMatrix * viewMatrix * modelPosition;
}