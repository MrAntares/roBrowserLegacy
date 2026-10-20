#version 300 es
precision highp float;

in vec2 vTextureCoord;  // 0..1 across the frame, as in SpriteRenderer.fs
flat in vec4 vUV;       // the frame's rectangle in the texture
flat in vec4 vColor;
flat in float vShadow;
out vec4 fragColor;

uniform sampler2D uDiffuse;
uniform sampler2D uPalette;

uniform bool uUsePal;

uniform bool  uFogUse;
uniform float uFogNear;
uniform float uFogFar;
uniform vec3  uFogColor;

uniform vec2 uTextSize;

// Where a point of the frame (0..1) is in the texture
vec2 toTexture(vec2 uv) {
    return mix(vUV.xy, vUV.zw, uv);
}

// One texel of the frame, as NEAREST with CLAMP_TO_EDGE picks it on the
// frame's own texture. Done in the frame's texels, not the atlas's, so the
// rounding is the frame's: a sample that falls on a texel's edge picks the
// same side it did before.
float fetchIndex(sampler2D indexT, vec2 uv, vec2 size, vec2 origin) {
    vec2 texel = clamp(floor(uv * size), vec2(0.0), size - 1.0);
    return texelFetch(indexT, ivec2(origin + texel), 0).x;
}

// The same as SpriteRenderer.fs, on the frame's own coordinates: uTextSize
// is twice the texture's size, so twice the frame's is its share of it.
vec4 bilinearSample(vec2 uv, sampler2D indexT, sampler2D LUT) {
    vec2 atlasSize = uTextSize * 0.5;
    vec2 size      = floor((vUV.zw - vUV.xy) * atlasSize + 0.5);
    vec2 origin    = floor(vUV.xy * atlasSize + 0.5);
    vec2 textSize  = size * 2.0;
    vec2 TextInterval = 1.0 / textSize;

    float tlLUT = fetchIndex(indexT, uv, size, origin);
    float trLUT = fetchIndex(indexT, uv + vec2(TextInterval.x, 0.0), size, origin);
    float blLUT = fetchIndex(indexT, uv + vec2(0.0, TextInterval.y), size, origin);
    float brLUT = fetchIndex(indexT, uv + TextInterval, size, origin);

    vec4 transparent = vec4( 0.0, 0.0, 0.0, 0.0);

    vec4 tl = tlLUT == 0.0 ? transparent : vec4( texture(LUT, vec2(tlLUT,1.0)).rgb, 1.0);
    vec4 tr = trLUT == 0.0 ? transparent : vec4( texture(LUT, vec2(trLUT,1.0)).rgb, 1.0);
    vec4 bl = blLUT == 0.0 ? transparent : vec4( texture(LUT, vec2(blLUT,1.0)).rgb, 1.0);
    vec4 br = brLUT == 0.0 ? transparent : vec4( texture(LUT, vec2(brLUT,1.0)).rgb, 1.0);

    vec2 f  = fract( uv.xy * textSize );
    vec4 tA = mix( tl, tr, f.x );
    vec4 tB = mix( bl, br, f.x );

    return mix( tA, tB, f.y );
}


void main(void) {

    // Don't render if it's not shown.
    if (vColor.a == 0.0) {
        discard;
    }

    // Calculate texture
    vec4 textureSample;
    if (uUsePal) {
        textureSample = bilinearSample( vTextureCoord, uDiffuse, uPalette );
    }
    else {
        textureSample = texture( uDiffuse, toTexture(vTextureCoord.st) );
    }

    // No alpha, skip.
    if ( textureSample.a == 0.0 )
        discard;

    // Apply shadow, apply color
    textureSample.rgb   *= vShadow;
    fragColor   = textureSample * vColor;

    // Fog feature
    if (uFogUse) {
        float depth     = gl_FragCoord.z / gl_FragCoord.w;
        float fogFactor = smoothstep( uFogNear, uFogFar, depth );
        fragColor    = mix( fragColor, vec4( uFogColor, fragColor.w ), fogFactor );
    }
}