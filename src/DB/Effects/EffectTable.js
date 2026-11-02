/**
 * @module DB/Effects/EffectTable
 *
 * List effects
 *
 * The rows live in DB/Effects/Table/, so changes to different effects land in different files:
 *   - ById/EffectsNNNN-MMMM.js: the numbered rows, in ID order, split along the groups of the
 *     official effect list (EffectConst.js), so `@effect 312` is found by its number;
 *   - Jobs/<first class>/<class>.js: a class's named ef_<skill prefix>_* rows, and named rows only
 *     its skills use (by DB/Skills/SkillEffect.js), e.g. Jobs/Thief/AbyssChaser.js;
 *   - Common/Named.js: the named rows of no single class.
 * Put a new row in its file and import what it uses there. A module holding one effect's rows is
 * spread at the end of its file; only modules whose rows span several files are spread here.
 *
 * @author Vincent Thibault
 */

import Effects0000_0061 from 'DB/Effects/Table/ById/Effects0000-0061.js';
import Effects0062_0171 from 'DB/Effects/Table/ById/Effects0062-0171.js';
import Effects0172_0198 from 'DB/Effects/Table/ById/Effects0172-0198.js';
import Effects0199_0299 from 'DB/Effects/Table/ById/Effects0199-0299.js';
import Effects0300_0399 from 'DB/Effects/Table/ById/Effects0300-0399.js';
import Effects0400_0499 from 'DB/Effects/Table/ById/Effects0400-0499.js';
import Effects0500_0599 from 'DB/Effects/Table/ById/Effects0500-0599.js';
import Effects0600_0699 from 'DB/Effects/Table/ById/Effects0600-0699.js';
import Effects0700_0799 from 'DB/Effects/Table/ById/Effects0700-0799.js';
import Effects0800_0899 from 'DB/Effects/Table/ById/Effects0800-0899.js';
import Effects0900_0999 from 'DB/Effects/Table/ById/Effects0900-0999.js';
import Effects1000_1099 from 'DB/Effects/Table/ById/Effects1000-1099.js';
import Effects1100_1199 from 'DB/Effects/Table/ById/Effects1100-1199.js';
import Effects1200_1299 from 'DB/Effects/Table/ById/Effects1200-1299.js';
import Effects1400_1499 from 'DB/Effects/Table/ById/Effects1400-1499.js';
import Effects1500_1599 from 'DB/Effects/Table/ById/Effects1500-1599.js';
import Effects1700_1799 from 'DB/Effects/Table/ById/Effects1700-1799.js';
import Effects1800_1899 from 'DB/Effects/Table/ById/Effects1800-1899.js';
import Effects1900_1999 from 'DB/Effects/Table/ById/Effects1900-1999.js';
import Effects2200_2299 from 'DB/Effects/Table/ById/Effects2200-2299.js';
import Effects2300_2399 from 'DB/Effects/Table/ById/Effects2300-2399.js';
import CommonNamed from 'DB/Effects/Table/Common/Named.js';
import ArchBishop from 'DB/Effects/Table/Jobs/Acolyte/ArchBishop.js';
import Cardinal from 'DB/Effects/Table/Jobs/Acolyte/Cardinal.js';
import Inquisitor from 'DB/Effects/Table/Jobs/Acolyte/Inquisitor.js';
import Sura from 'DB/Effects/Table/Jobs/Acolyte/Sura.js';
import Hunter from 'DB/Effects/Table/Jobs/Archer/Hunter.js';
import MinstrelWanderer from 'DB/Effects/Table/Jobs/Archer/MinstrelWanderer.js';
import Ranger from 'DB/Effects/Table/Jobs/Archer/Ranger.js';
import TroubadourTrouvere from 'DB/Effects/Table/Jobs/Archer/TroubadourTrouvere.js';
import Windhawk from 'DB/Effects/Table/Jobs/Archer/Windhawk.js';
import Gunslinger from 'DB/Effects/Table/Jobs/Gunslinger/Gunslinger.js';
import NightWatch from 'DB/Effects/Table/Jobs/Gunslinger/NightWatch.js';
import Rebellion from 'DB/Effects/Table/Jobs/Gunslinger/Rebellion.js';
import ArchMage from 'DB/Effects/Table/Jobs/Mage/ArchMage.js';
import ElementalMaster from 'DB/Effects/Table/Jobs/Mage/ElementalMaster.js';
import HighWizard from 'DB/Effects/Table/Jobs/Mage/HighWizard.js';
import Mage from 'DB/Effects/Table/Jobs/Mage/Mage.js';
import Sage from 'DB/Effects/Table/Jobs/Mage/Sage.js';
import Sorcerer from 'DB/Effects/Table/Jobs/Mage/Sorcerer.js';
import Warlock from 'DB/Effects/Table/Jobs/Mage/Warlock.js';
import Biolo from 'DB/Effects/Table/Jobs/Merchant/Biolo.js';
import Blacksmith from 'DB/Effects/Table/Jobs/Merchant/Blacksmith.js';
import Genetic from 'DB/Effects/Table/Jobs/Merchant/Genetic.js';
import Mechanic from 'DB/Effects/Table/Jobs/Merchant/Mechanic.js';
import Meister from 'DB/Effects/Table/Jobs/Merchant/Meister.js';
import KagerouOboro from 'DB/Effects/Table/Jobs/Ninja/KagerouOboro.js';
import ShinkiroShiranui from 'DB/Effects/Table/Jobs/Ninja/ShinkiroShiranui.js';
import HyperNovice from 'DB/Effects/Table/Jobs/Novice/HyperNovice.js';
import Novice from 'DB/Effects/Table/Jobs/Novice/Novice.js';
import SpiritHandler from 'DB/Effects/Table/Jobs/Summoner/SpiritHandler.js';
import Summoner from 'DB/Effects/Table/Jobs/Summoner/Summoner.js';
import DragonKnight from 'DB/Effects/Table/Jobs/Swordman/DragonKnight.js';
import ImperialGuard from 'DB/Effects/Table/Jobs/Swordman/ImperialGuard.js';
import Knight from 'DB/Effects/Table/Jobs/Swordman/Knight.js';
import LordKnight from 'DB/Effects/Table/Jobs/Swordman/LordKnight.js';
import RoyalGuard from 'DB/Effects/Table/Jobs/Swordman/RoyalGuard.js';
import RuneKnight from 'DB/Effects/Table/Jobs/Swordman/RuneKnight.js';
import SkyEmperor from 'DB/Effects/Table/Jobs/Taekwon/SkyEmperor.js';
import SoulAscetic from 'DB/Effects/Table/Jobs/Taekwon/SoulAscetic.js';
import SoulLinker from 'DB/Effects/Table/Jobs/Taekwon/SoulLinker.js';
import SoulReaper from 'DB/Effects/Table/Jobs/Taekwon/SoulReaper.js';
import StarEmperor from 'DB/Effects/Table/Jobs/Taekwon/StarEmperor.js';
import Taekwon from 'DB/Effects/Table/Jobs/Taekwon/Taekwon.js';
import AbyssChaser from 'DB/Effects/Table/Jobs/Thief/AbyssChaser.js';
import GuillotineCross from 'DB/Effects/Table/Jobs/Thief/GuillotineCross.js';
import ShadowChaser from 'DB/Effects/Table/Jobs/Thief/ShadowChaser.js';
import ShadowCross from 'DB/Effects/Table/Jobs/Thief/ShadowCross.js';

export default {
	/// Common parameters
	///
	/// - duration:
	///   specifies the duration of the effect
	///
	/// - duplicate:
	///   the EffectManager duplicates the effect this many times
	///
	/// - timeBetweenDupli:
	///   if the duplicate param is specified, then the EffectManager waits for this long between duplicates
	///
	/// - wav:
	///   audio file stored in data/wav/ folder
	///
	/// - attachedEntity:
	///   if set to true, the effect will follow the entity attached

	/// type = STR
	///
	/// - file:
	///   STR file name stored in data/texture/effect/(.*).str
	///
	/// - min:
	///   minify str file stored in data/texture/effect/(.*).str
	///   used when /mineffect is enabled
	///
	/// - rand
	///   replace the %d in the file name with a rand(val1, val2).
	///
	/// - texturePath:
	///   path to look for the textures
	///   instead of the regular data/texture/effect path

	/// type = SPR
	///
	/// - file:
	///   Sprite file name stored in data/sprite/AIANA®/(.*).spr
	///
	/// - head
	///   if set to true, the sprite will be at the character's head
	///
	/// - stopAtEnd
	///   do not remove when animation end
	///
	/// - direction
	///   if set to true, the sprite will inherit character's direction

	/// type = FUNC
	///
	/// - func:
	///   callback to use

	/// type = CYLINDER
	///
	/// - textureName:
	///   name of the targa texture stored in data/texture/effect/(.*).tga
	///
	/// - red, green, blue:
	///   overrides the color values of the texture (0.0 ~ 1.0)
	///
	/// - totalCircleSides:
	///   number of sides of the base "circle" of the cylinder
	///
	/// - circleSides:
	///   number of sides shown out of the totalCircleSides
	///
	/// - repeatTextureX:
	///   how many times the texture is repeated on the side of the cylinder (the whole 360 turn regardless of how many sides are actually visible)
	///   use it to fit the texture to sides or semi-circles
	///
	/// - rotate:
	///   if set to true, the cylinder will continously rotate around it's Y (vertical) axis before any other rotation is applied
	///
	/// - angleX, angleY, angleZ:
	///   rotates the cylinder on the X, Y, Z axis by the set amount of degrees (applied after rotate)
	///
	/// - rotateWithCamera
	///   if set to true the cylinder rotates with the camera on the final Y (vertical) axis after every other rotation is applied
	///
	/// - rotateToTarget
	///   if set to true the notrh side of the cylinder is rotated to face the target
	///
	/// - rotateWithSource
	///   if set to true the notrh side of the cylinder will be rotated to match the source's direction
	///
	/// - topSize:
	///   top radius of the circle
	///
	/// - bottomSize:
	///   bottom radius of the circle
	///
	/// - height:
	///   height of the cylinder
	///
	/// - posX, posY, posZ:
	///   offsets the cylinder's position on it's X, Y, Z axis
	///
	/// - fade:
	///   if set to true the cylinder will fade out at the end of the duration
	///
	/// - alphaMax:
	///   sets the opacity of the cylinder (0.0 ~ 1.0)
	///
	/// - animation:
	///   sets the animation type of the cylinder
	///	 - 1: the height of the cylinder grows to the set height from 0
	///	 - 2: top radius of the cylinder grows to the topSize value from 0
	///	 - 3: the radius of the whole cylinder shrinks to 0
	///	 - 4: the radius of the whole cylinder grows to the set topSize and bottomSize values from 0
	///	 - 5: the height of the cylinder grows to the set height value, and then shrinks back to 0
	///
	/// - blendMode:
	///   sets the webgl blendFunc target mode of the cylinder
	///	 - 1: ZERO
	///	 - 2: ONE (transparent light effect)
	///	 - 3: SRC_COLOR
	///	 - 4: ONE_MINUS_SRC_COLOR
	///	 - 5: DST_COLOR
	///	 - 6: ONE_MINUS_DST_COLOR
	///	 - 7: SRC_ALPHA
	///	 - 8: ONE_MINUS_SRC_ALPHA (default)
	///	 - 9: DST_ALPHA
	///	 - 10: ONE_MINUS_DST_ALPHA
	///	 - 11: CONSTANT_COLOR
	///	 - 12: ONE_MINUS_CONSTANT_COLOR
	///	 - 13: CONSTANT_ALPHA
	///	 - 14: ONE_MINUS_CONSTANT_ALPHA
	///	 - 15: SRC_ALPHA_SATURATE
	///   the webgl blendFunc source mode is always SRC_ALPHA
	///
	/// - repeat
	///   if set to true the effect will play repeatedly until removed

	/// type = 2D
	///
	/// - file:
	///   Texture file name stored in data/texture/(.*.bmp|tga)
	///
	/// - wav:
	///   audio file stored in data/wav/ folder
	///
	/// - red:
	///   if set to >0, overrides the red color of the texture
	///
	/// - green:
	///   if set to >0, overrides the green color of the texture
	///
	/// - blue:
	///   if set to >0, overrides the blue color of the texture
	///
	/// - alphaMax:
	///   sets the opacity of the texture (0.0 ~ 1.0)
	///
	/// - fadeIn:
	///   if set to true the texture will fade in at the beginning of the duration
	///
	/// - fadeOut:
	///   if set to true the texture will fade out at the end of the duration
	///
	/// - fadeIn:
	///   if set to true the texture will fade in at the beginning of the duration
	///
	/// - posx, posy, posz:
	///   sets the relative position of the texture
	///
	/// - posxStart, posyStart, poszStart, posxEnd, posyEnd, poszEnd:
	///   sets the relative starting and ending position of the texture
	///
	/// - posxRand, posyRand, poszRand:
	///   sets a +- range for a random relative position
	///
	/// - posxRandDiff, posyRandDiff, poszRandDiff:
	///   sets a +- range for a random relative starting and ending position. The start and end is 2 different random numbers in the same range.
	///
	/// - posxStartRand, posyStartRand, poszStartRand, posxEndRand, posyEndRand, poszEndRand:
	///   sets a +- range for a random relative starting and ending position
	///
	/// - posxSmooth, posySmooth, poszSmooth:
	///   smoohtes out the movement on an axis
	///
	/// - size, sizeX, sizeY, sizeStart, sizeEnd, sizeStartX, sizeStartY, sizeEndX, sizeEndY:
	/// - sizeRand, sizeRandx, sizeEndY:
	/// - sizeSmooth:
	///   works the same way as positions, but effects the size of the texture
	///
	/// - poszStartRandMiddle, poszEndRandMiddle:
	///   sets the relative middle position of the random range of the starting and ending Z position
	///
	/// - sizeRandXMiddle, sizeRandYMiddle:
	///   sets the middle value for the random range for the size X&Y values
	///
	/// - rotate:
	///   if set to true makes the texture rotate on it's y axis (turn around)
	///
	/// - angle:
	///   sets the starting angle of the texture in degrees (eg: 180=upside down)
	///
	/// - toAngle:
	///   sets the final angle of the texture in degrees (eg: 180=upside down)
	///
	/// - zIndex:
	///   sets the zindex of the texture (closer to the camera or farther)

	/// type = 3D
	///
	/// - file:
	///   Texture file name stored in data/texture/(.*.bmp|tga)
	///
	/// - fileList:
	///   An array of texture file name stored in data/texture/(.*.bmp|tga)
	///
	/// - frameDelay:
	///   For how many ticks (time) one texture is shown when using fileList. Used for "hand animated" effects that are created from multiple textures.
	///
	/// - delayStart:
	///   delays the visual start of this effect entry by the given number of
	///   milliseconds. Sound (wav) is NOT delayed — it plays at the original startTick.
	///
	/// - spriteName:
	///   Sprite file name stored in data/sprite/AIANA®/(.*).spr
	///
	/// - absoluteSpriteName:
	///   Sprite file name stored in the absolute path.spr
	///   eg: data/sprite/npc/skel_archer_arrow.spr
	///
	/// - playSprite:
	///   if set to true plays the sprite animation
	///
	/// - sprDelay:
	///   frame delay for a sprite animation
	///
	/// - wav:
	///   audio file stored in data/wav/ folder
	///
	/// - red:
	///   if set to >0, overrides the red color of the texture
	///
	/// - green:
	///   if set to >0, overrides the green color of the texture
	///
	/// - blue:
	///   if set to >0, overrides the blue color of the texture
	///
	/// - alphaMax:
	///   sets the opacity of the texture (0.0 ~ 1.0)
	///
	/// - alphaMaxDelta:
	///   when using duplicates, increase alpaMax value between duplicates by this amount
	///
	/// - fadeIn:
	///   if set to true the texture will fade in at the beginning of the duration
	///
	/// - fadeOut:
	///   if set to true the texture will fade out at the end of the duration
	///
	/// - fadeIn:
	///   if set to true the texture will fade in at the beginning of the duration
	///
	/// - posx, posy, posz:
	///   sets the relative position of the texture
	///
	/// - posxStart, posyStart, poszStart, posxEnd, posyEnd, poszEnd:
	///   sets the relative starting and ending position of the texture
	///
	/// - posxRand, posyRand, poszRand:
	///   sets a +- range for a random relative position
	///
	/// - posxRandDiff, posyRandDiff, poszRandDiff:
	///   sets a +- range for a random relative starting and ending position. The start and end is 2 different random numbers in the same range.
	///
	/// - posxStartRand, posyStartRand, poszStartRand, posxEndRand, posyEndRand, poszEndRand:
	///   sets a +- range for a random relative starting and ending position
	///
	/// - posxSmooth, posySmooth, poszSmooth:
	///   smoohtes out the movement on an axis
	///
	/// - size, sizeX, sizeY, sizeStart, sizeEnd, sizeStartX, sizeStartY, sizeEndX, sizeEndY:
	/// - sizeRand, sizeRandx, sizeEndY:
	/// - sizeSmooth:
	///   works the same way as positions, but effects the size of the texture
	///
	/// - sizeDelta
	///   when using duplicates, increase sizeDelta value between duplicates by this amount
	///
	/// - posxStartRandMiddle, posyStartRandMiddle, poszStartRandMiddle, posxEndRandMiddle, posyEndRandMiddle, poszEndRandMiddle:
	///   sets the relative middle position of the random range of the starting and ending
	///
	/// - sizeRandXMiddle, sizeRandYMiddle:
	///   sets the middle value for the random range for the size X&Y values
	///
	/// - zOffsetStart:
	///   initial Z offset when using fromSrc or toSrc
	///
	/// - zOffsetEnd:
	///   final Z offset when using fromSrc or toSrc
	///
	/// - arc:
	///   creates an arced trajectory using sine wave
	///   positive values create upward arc, negative values create downward arc
	///
	/// - retreat:
	///   makes projectile retreat backward before moving forward
	///   creates a "pull back" effect in the middle of the trajectory
	///
	/// - rotate:
	///   if set to true makes the texture rotate on it's y axis (turn around)
	///
	/// - rotatePosX, rotatePosY, rotatePosZ:
	///   offsets the rotation axis
	///
	/// - nbOfRotation:
	///   sets the number of rotations
	///
	/// - rotateLate:
	///   sets a delay before the rotation
	///
	/// - rotateLateDelta:
	///   when using duplicates, increase rotateLate value between duplicates by this amount
	///
	/// - rotationClockwise:
	///   if set to true then rotates clockwise
	///
	/// - angle:
	///   sets the starting angle of the texture in degrees (eg: 180=upside down)
	///
	/// - toAngle:
	///   sets the final angle of the texture in degrees (eg: 180=upside down)
	///
	/// - rotateToTarget:
	///   if set to true the upper side of the texture is rotated to face the target
	///
	/// - rotateWithCamera:
	///   if set to true the texture rotates if the camera is rotated makig it's sides always face the same coordinate in the 3D environment
	///
	/// - zIndex:
	///   sets the zindex of the texture (closer to the camera or farther)
	///
	/// - shadowTexture:
	///   if set to true then enables the shadow
	///
	/// - blendMode:
	///   sets the webgl blendFunc target mode of the cylinder
	///	 - 1: ZERO
	///	 - 2: ONE (transparent light effect)
	///	 - 3: SRC_COLOR
	///	 - 4: ONE_MINUS_SRC_COLOR
	///	 - 5: DST_COLOR
	///	 - 6: ONE_MINUS_DST_COLOR
	///	 - 7: SRC_ALPHA
	///	 - 8: ONE_MINUS_SRC_ALPHA (default)
	///	 - 9: DST_ALPHA
	///	 - 10: ONE_MINUS_DST_ALPHA
	///	 - 11: CONSTANT_COLOR
	///	 - 12: ONE_MINUS_CONSTANT_COLOR
	///	 - 13: CONSTANT_ALPHA
	///	 - 14: ONE_MINUS_CONSTANT_ALPHA
	///	 - 15: SRC_ALPHA_SATURATE
	///   the webgl blendFunc source mode is always SRC_ALPHA
	///
	/// - sparkling
	///   if set to true then makes the effect blink/sparkle
	///
	/// - sparkNumber
	///   sets how often the effect blinks/sparkles
	///
	/// - repeat
	///   if set to true the effect will play repeatedly until removed

	...Effects0000_0061,
	...Effects0062_0171,
	...Effects0172_0198,
	...Effects0199_0299,
	...Effects0300_0399,
	...Effects0400_0499,
	...Effects0500_0599,
	...Effects0600_0699,
	...Effects0700_0799,
	...Effects0800_0899,
	...Effects0900_0999,
	...Effects1000_1099,
	...Effects1100_1199,
	...Effects1200_1299,
	...Effects1400_1499,
	...Effects1500_1599,
	...Effects1700_1799,
	...Effects1800_1899,
	...Effects1900_1999,
	...Effects2200_2299,
	...Effects2300_2399,
	...CommonNamed,
	...ArchBishop,
	...Cardinal,
	...Inquisitor,
	...Sura,
	...Hunter,
	...MinstrelWanderer,
	...Ranger,
	...TroubadourTrouvere,
	...Windhawk,
	...Gunslinger,
	...NightWatch,
	...Rebellion,
	...ArchMage,
	...ElementalMaster,
	...HighWizard,
	...Mage,
	...Sage,
	...Sorcerer,
	...Warlock,
	...Biolo,
	...Blacksmith,
	...Genetic,
	...Mechanic,
	...Meister,
	...KagerouOboro,
	...ShinkiroShiranui,
	...HyperNovice,
	...Novice,
	...SpiritHandler,
	...Summoner,
	...DragonKnight,
	...ImperialGuard,
	...Knight,
	...LordKnight,
	...RoyalGuard,
	...RuneKnight,
	...SkyEmperor,
	...SoulAscetic,
	...SoulLinker,
	...SoulReaper,
	...StarEmperor,
	...Taekwon,
	...AbyssChaser,
	...GuillotineCross,
	...ShadowChaser,
	...ShadowCross
};
