uniform sampler2D u_pizza;
uniform float u_time;
uniform float u_timing;
uniform float u_ratio;
uniform bool u_clicked;
uniform float u_clickedX;
uniform float u_clickedY;

varying vec2 v_uv;

void main() {
    vec2 st = vec2(v_uv.x, v_uv.y / u_ratio);
    vec4 pizzaTexture = texture2D(u_pizza, v_uv);
    float circlePct = distance(st, vec2(0.5, 0.5 / u_ratio));
    float smallCirclePct = distance(st, vec2(0.0));
    float smallCircle2Pct = distance(st, vec2(0.8, 0.6 / u_ratio));
    float smallCircle3Pct = distance(st, vec2(0.2, 1.0 / u_ratio));
    float smallCircle4Pct = distance(st, vec2(1.0, 0.2 / u_ratio));
    
    pizzaTexture.a = 1.0 - step(-0.5 + u_time * 0.4, circlePct * 2.0);
    pizzaTexture.a += 1.0 - step(u_time * 0.1, smallCirclePct);
    pizzaTexture.a += 1.0 - step(u_time * 0.2, smallCircle2Pct * 1.6);
    pizzaTexture.a += 1.0 - step(u_time * 0.2, smallCircle3Pct * 1.6);
    pizzaTexture.a += 1.0 - step(u_time * 0.25, smallCircle4Pct * 2.0);

    if (u_clicked) {
        float randomCirclePct = distance(st, vec2(u_clickedX, (1.0 - u_clickedY)/ u_ratio));

        pizzaTexture.a = step(u_timing * 0.02, randomCirclePct * 2.0);
        // pizzaTexture.a = u_timing;
    }
    
    gl_FragColor = pizzaTexture;
}