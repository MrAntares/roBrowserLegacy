#version 300 es
precision highp float;
precision highp sampler2DArray;

in vec2 vTextureCoord;  // 0..1 across the frame, as in SpriteRenderer.fs
flat in vec4 vUV;       // the frame's rectangle in the texture
flat in vec4 vColor;
flat in float vShadow;
flat in vec3 vSource;   // source, atlas layer, palette row (see SpriteBatch.js)
out vec4 fragColor;

// The sprite's own texture and palette (source 0, palette row -2)
uniform sampler2D uDiffuse;
uniform sampler2D uPalette;
uniform vec2 uTextSize;

// The shared atlas (SpriteAtlas.js)
uniform sampler2DArray uIndexAtlas;
uniform sampler2DArray uRGBAAtlas;
uniform sampler2D uPaletteAtlas;
uniform vec2 uIndexAtlasSize;

uniform bool  uFogUse;
uniform float uFogNear;
uniform float uFogFar;
uniform vec3  uFogColor;

// Where a point of the frame (0..1) is in the texture
vec2 toTexture(vec2 uv) {
    return mix(vUV.xy, vUV.zw, uv);
}

// One texel of the frame, as NEAREST with CLAMP_TO_EDGE picks it on the
// frame's own texture. Done in the frame's texels, not the atlas's, so the
// rounding is the frame's: a sample that falls on a texel's edge picks the
// same side it did before.
float fetchIndex(vec2 uv, vec2 size, vec2 origin) {
    ivec2 texel = ivec2(origin + clamp(floor(uv * size), vec2(0.0), size - 1.0));
    if (vSource.x > 0.5) {
        return texelFetch(uIndexAtlas, ivec3(texel, int(vSource.y + 0.5)), 0).x;
    }
    return texelFetch(uDiffuse, texel, 0).x;
}

// A palette colour; index is the texel's value, k / 255. On its own texture,
// texture(LUT, vec2(index, 1.0)) reads colour k, except for 255: 1.0 wraps
// around (palette textures REPEAT) and reads colour 0. The atlas does the same.
vec4 lookup(float index) {
    if (vSource.z > -0.5) {
        int k = int(index * 255.0 + 0.5);
        return vec4(texelFetch(uPaletteAtlas, ivec2(k == 255 ? 0 : k, int(vSource.z + 0.5)), 0).rgb, 1.0);
    }
    return vec4(texture(uPalette, vec2(index, 1.0)).rgb, 1.0);
}

// The same as SpriteRenderer.fs, on the frame's own coordinates.
vec4 bilinearSample(vec2 uv) {
    vec2 atlasSize = vSource.x > 0.5 ? uIndexAtlasSize : uTextSize * 0.5;
    vec2 size      = floor((vUV.zw - vUV.xy) * atlasSize + 0.5);
    vec2 origin    = floor(vUV.xy * atlasSize + 0.5);
    vec2 textSize  = size * 2.0;
    vec2 TextInterval = 1.0 / textSize;

    float tlLUT = fetchIndex(uv, size, origin);
    float trLUT = fetchIndex(uv + vec2(TextInterval.x, 0.0), size, origin);
    float blLUT = fetchIndex(uv + vec2(0.0, TextInterval.y), size, origin);
    float brLUT = fetchIndex(uv + TextInterval, size, origin);

    vec4 transparent = vec4( 0.0, 0.0, 0.0, 0.0);

    vec4 tl = tlLUT == 0.0 ? transparent : lookup(tlLUT);
    vec4 tr = trLUT == 0.0 ? transparent : lookup(trLUT);
    vec4 bl = blLUT == 0.0 ? transparent : lookup(blLUT);
    vec4 br = brLUT == 0.0 ? transparent : lookup(brLUT);

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
    if (abs(vSource.z + 1.0) > 0.5) { // a palette: not -1
        textureSample = bilinearSample( vTextureCoord );
    }
    else if (vSource.x > 1.5) {
        textureSample = texture( uRGBAAtlas, vec3(toTexture(vTextureCoord.st), vSource.y) );
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
