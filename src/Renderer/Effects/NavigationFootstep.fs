#version 300 es
precision highp float;

in vec2 vLocal;
in vec2 vTextureCoord;
out vec4 fragColor;

uniform vec4 uColor;
uniform float uAlpha;
uniform float uTick;
uniform float uIndex;
uniform float uUseTexture;
uniform sampler2D uDiffuse;

float rectShape(vec2 p, vec2 center, vec2 halfSize, float feather) {
    vec2 d = abs(p - center) - halfSize;
    float dist = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
    return 1.0 - smoothstep(0.0, feather, dist);
}

float arrowHead(vec2 p, float grow) {
    float y0 = 0.02 - grow;
    float y1 = 0.86 + grow;
    float t = clamp((p.y - y0) / max(0.001, y1 - y0), 0.0, 1.0);
    float halfWidth = mix(0.58 + grow, 0.02, t);
    float xMask = 1.0 - smoothstep(halfWidth, halfWidth + 0.035, abs(p.x));
    float yMask = smoothstep(y0 - 0.035, y0 + 0.035, p.y) * (1.0 - smoothstep(y1 - 0.035, y1 + 0.035, p.y));
    return xMask * yMask;
}

void main(void) {
    float pulse = 0.82 + 0.18 * sin(uTick * 0.006 + uIndex * 0.65);

    if (uUseTexture > 0.5) {
        vec4 tex = texture(uDiffuse, vTextureCoord);
        float alpha = tex.a * uAlpha * pulse;

        if (alpha < 0.025) {
            discard;
        }

        fragColor = vec4(tex.rgb, alpha);
        return;
    }

    vec2 p = vLocal;

    float shaft = rectShape(p, vec2(0.0, -0.32), vec2(0.17, 0.48), 0.035);
    float head = arrowHead(p, 0.00);
    float mark = max(shaft, head);

    float shaftOutline = rectShape(p, vec2(0.0, -0.32), vec2(0.23, 0.54), 0.040);
    float headOutline = arrowHead(p, 0.06);
    float outline = max(max(shaftOutline, headOutline) - mark, 0.0);

    float glow = rectShape(p, vec2(0.0, -0.10), vec2(0.48, 0.82), 0.42) * 0.22;
    float alpha = (mark + outline * 0.82 + glow) * uAlpha * pulse;

    if (alpha < 0.025) {
        discard;
    }

    vec3 outlineColor = vec3(0.20, 0.12, 0.00);
    vec3 glowColor = vec3(1.00, 0.92, 0.25);
    vec3 color = glow > mark && glow > outline ? glowColor : mix(outlineColor, uColor.rgb, mark);

    fragColor = vec4(color, alpha);
}
