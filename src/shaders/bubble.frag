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
    // vec3 color = vec3(1.0);
    vec4 texture = texture2D(u_texture, v_uv);
    vec3 textureColor = texture.rgb;
    gl_FragColor = vec4(color * ((sin(v_normal * 1.5) / 2.0) + 0.5) , 1.0);
}