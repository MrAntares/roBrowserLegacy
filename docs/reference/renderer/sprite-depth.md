# The depth of an entity sprite

How `SpriteRenderer.vs` / `.fs` give each fragment of a sprite its depth, and
why the min of the two candidates is taken in the fragment shader.
`SpriteBatch.vs` / `.fs`, which draw the entities in instanced batches, do the
same with the per-sprite values read from the instance.

## Rules

- **Every sprite has two depth candidates.** The billboard itself, which faces
  the camera, and a vertical plane through the entity's anchor (its feet),
  facing the camera's horizontal direction. Above the anchor the plane is the
  closer one, below it the billboard is.
- **The depth is the closer of the two, per fragment**, minus the layer's
  `zIndex` lead. The plane keeps the part of a body under the water surface
  behind the water pass. The billboard keeps the feet, and whatever hangs
  below the anchor, in front of the ground.
- **NPCs take the plane only** (`SpriteRenderer.ignoreDepthMinCap`).
- **`disableDepthCorrection` takes the billboard only.**

## Why per fragment

A depth written by the vertex shader is interpolated linearly across the
quad. The min of two planes is not linear: on a quad that crosses the anchor
line, the bottom vertices take the billboard and the top ones the plane, and
the interpolated depth comes out closer to the camera than both, most of all
near the anchor. All layers of a player share the same two candidates, so
only the `zIndex` lead (0.01 per unit, about 0.4 world unit from the head to
the body) separates them, and the bend can be larger than that lead.

What it looked like: hair cut by the body where it falls over it. Measured on
the client's own sprites, it almost never happens standing. It shows when the
body sprite reaches far below the anchor: sitting seen from behind (Dancer,
Sage, several third-job women with long hair) or lying dead. A higher camera
makes it worse: on a sitting Dancer with hairstyle 5, 8 of about 2 250
sampled hair points lose at the default height (50 degrees), about 700 at 65.
The camera distance does not matter, the bend and the lead both scale with it.

The vertex shader passes both candidates, offset included, as clip-space
varyings. Perspective-correct interpolation gives their exact value at the
fragment, and `gl_FragDepth` writes the min. The vertex depth still holds the
per-vertex min, for clipping.

Writing `gl_FragDepth` turns off early depth testing for sprites. The fog
reads the same depth, not `gl_FragCoord.z`, which still holds the vertex one.

## Deviations

The original client sends pre-transformed quads with one depth per quad. It
has neither candidate, so it cannot show this artefact and does not tell how
a sprite should meet water or the ground; both candidates are the port's own.
