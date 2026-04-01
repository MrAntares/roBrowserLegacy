/**
 * Loaders/GrannyModel.js
 *
 * Loaders for Gravity .gr2 file (Resource Model with animation for the Granny3D Engine)
 *
 * This file is part of ROBrowser, (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 * @author Liam Mitchell
 */

import BinaryReader, { SEEK_SET } from 'Utils/BinaryReader.js';
import glMatrix from 'Utils/gl-matrix.js';
import 'Utils/CRC32.js';

const { vec3, mat3, mat4 } = glMatrix;

/**
 * @class BoundingBox
 * @description Bounding box for models and nodes.
 */
class BoundingBox {
	constructor() {
		this.max = vec3.fromValues(-Infinity, -Infinity, -Infinity);
		this.min = vec3.fromValues(Infinity, Infinity, Infinity);
		this.offset = vec3.create();
		this.range = vec3.create();
		this.center = vec3.create();
	}
}

/**
 * @class Section
 * @description Granny file section information
 */
class Section {
	constructor(fp) {
		this.Format = fp.readUInt();
		this.DataOffset = fp.readUInt();
		this.DataSize = fp.readUInt();
		this.ExpandedDataSize = fp.readUInt();
		this.InternalAlignment = fp.readUInt();
		this.First16Bit = fp.readUInt();
		this.First8Bit = fp.readUInt();
		this.PointerFixupArrayOffset = fp.readUInt();
		this.PointerFixupArrayCount = fp.readUInt();
		this.MixedMarshallingFixupArrayOffset = fp.readUInt();
		this.MixedMarshallingFixupArrayCount = fp.readUInt();
		this.IsReady = false;
		this.data = null;
	}

	decompress(fp) {
		if (this.IsReady) {
			return true;
		}

		const _data = new BinaryReader(fp.buffer, this.DataOffset, this.DataSize);

		switch (this.Format) {
			case GR2.COMPRESSION_TYPE.NoCompression:
				if (this.ExpandedDataSize !== this.DataSize) {
					console.error('Expanded Data Size and DataSize do not match.');
				}
				this.data = _data;
				this.IsReady = true;
				break;
			case GR2.COMPRESSION_TYPE.Oodle0Compression:
				console.error('Unhandled Compression Type Oodle0Compression');
				break;
			case GR2.COMPRESSION_TYPE.Oodle1Compression:
				console.error('Unhandled Compression Type Oodle1Compression');
				break;
			case GR2.COMPRESSION_TYPE.OnePastLastCompressionType:
				console.error('Unhandled Compression Type OnePastLastCompressionType');
				break;
		}
		return this.IsReady;
	}
}

/**
 * @class Reference
 * @description Section reference
 */
class Reference {
	constructor(fp) {
		this.SectionIndex = fp.readUInt();
		this.Offset = fp.readUInt();
	}
}

/**
 * @class Header
 * @description Granny file header
 */
class Header {
	constructor(fp) {
		this.Version = fp.readUInt();
		this.TotalSize = fp.readUInt();
		this.CRC = fp.readUInt();
		this.SectionArrayOffset = fp.readUInt();
		this.SectionArrayCount = fp.readUInt();
		this.RootObjectTypeDefinition = new Reference(fp);
		this.RootObject = new Reference(fp);
		this.TypeTag = fp.readUInt();
		this.ExtraTags = [];
		for (let i = 0; i < GR2.GRNExtraTagCount; i++) {
			this.ExtraTags.push(fp.readUInt());
		}
		this.StringDatabaseCRC = fp.readUInt();
		this.ReservedUnused = [fp.readUInt(), fp.readUInt(), fp.readUInt()];
	}
}

/**
 * @class GrannyFileMagicValue
 * @description File magic value and format info
 */
class GrannyFileMagicValue {
	constructor(fp) {
		this.MagicValue = [fp.readUInt(), fp.readUInt(), fp.readUInt(), fp.readUInt()];
		this.HeaderSize = fp.readUInt();
		this.HeaderFormat = fp.readUInt();
		this.Reserved = [fp.readUInt(), fp.readUInt()];
	}
}

/**
 * @class GrannyVariant
 * @description Variant data
 */
class _GrannyVariant {
	constructor(fp) {
		this.Type = new GrannyDataTypeDefinition(fp);
		this.Object = null;
	}
}

// Not a full class yet as it was empty in legacy
class GrannyDataTypeDefinition {
	constructor(fp) {
		// members to be added when implementation details are known
	}
}

/**
 * @class GrannyNode
 * @description Represents a node in the GR2 model
 */
class _GrannyNode {
	constructor(gr2, fp, only) {
		const { version } = gr2;
		this.main = gr2;
		this.is_only = only;

		this.name = fp.readBinaryString(40);
		this.parentname = fp.readBinaryString(40);

		const texCount = fp.readLong();
		this.textures = new Array(texCount);
		for (let i = 0; i < texCount; ++i) {
			this.textures[i] = fp.readLong();
		}

		this.mat3 = [
			fp.readFloat(), fp.readFloat(), fp.readFloat(),
			fp.readFloat(), fp.readFloat(), fp.readFloat(),
			fp.readFloat(), fp.readFloat(), fp.readFloat()
		];
		this.offset = [fp.readFloat(), fp.readFloat(), fp.readFloat()];
		this.pos = [fp.readFloat(), fp.readFloat(), fp.readFloat()];
		this.rotangle = fp.readFloat();
		this.rotaxis = [fp.readFloat(), fp.readFloat(), fp.readFloat()];
		this.scale = [fp.readFloat(), fp.readFloat(), fp.readFloat()];

		const vertCount = fp.readLong();
		this.vertices = new Array(vertCount);
		for (let i = 0; i < vertCount; ++i) {
			this.vertices[i] = [fp.readFloat(), fp.readFloat(), fp.readFloat()];
		}

		const tvertCount = fp.readLong();
		this.tvertices = new Float32Array(tvertCount * 6);
		for (let i = 0, j = 0; i < tvertCount; ++i, j += 6) {
			if (version >= 1.2) {
				this.tvertices[j + 0] = fp.readUByte() / 255;
				this.tvertices[j + 1] = fp.readUByte() / 255;
				this.tvertices[j + 2] = fp.readUByte() / 255;
				this.tvertices[j + 3] = fp.readUByte() / 255;
			}
			this.tvertices[j + 4] = fp.readFloat() * 0.98 + 0.01;
			this.tvertices[j + 5] = fp.readFloat() * 0.98 + 0.01;
		}

		const faceCount = fp.readLong();
		this.faces = new Array(faceCount);
		for (let i = 0; i < faceCount; ++i) {
			this.faces[i] = {
				vertidx: [fp.readUShort(), fp.readUShort(), fp.readUShort()],
				tvertidx: [fp.readUShort(), fp.readUShort(), fp.readUShort()],
				texid: fp.readUShort(),
				padding: fp.readUShort(),
				twoSide: fp.readLong(),
				smoothGroup: version >= 1.2 ? fp.readLong() : 0
			};
		}

		if (version >= 1.5) {
			const count = fp.readLong();
			this.posKeyframes = new Array(count);
			for (let i = 0; i < count; ++i) {
				this.posKeyframes[i] = {
					frame: fp.readLong(),
					px: fp.readFloat(), py: fp.readFloat(), pz: fp.readFloat()
				};
			}
		} else {
			this.posKeyframes = [];
		}

		const rotCount = fp.readLong();
		this.rotKeyframes = new Array(rotCount);
		for (let i = 0; i < rotCount; ++i) {
			this.rotKeyframes[i] = {
				frame: fp.readLong(),
				q: [fp.readFloat(), fp.readFloat(), fp.readFloat(), fp.readFloat()]
			};
		}

		this.box = new BoundingBox();
		this.matrix = mat4.create();
	}

	calcBoundingBox(parentMatrix) {
		const v = vec3.create();
		const { box, main, vertices, pos, rotKeyframes, rotangle, rotaxis, scale, offset, mat3: nodeMat3, is_only, name, matrix: localMatrix } = this;
		const { nodes } = main;
		const matrix = mat4.create();

		mat4.copy(localMatrix, parentMatrix);
		mat4.translate(localMatrix, localMatrix, pos);

		if (!rotKeyframes.length) {
			mat4.rotate(localMatrix, localMatrix, rotangle, rotaxis);
		} else {
			mat4.rotateQuat(localMatrix, localMatrix, rotKeyframes[0].q);
		}

		mat4.scale(localMatrix, localMatrix, scale);
		mat4.copy(matrix, localMatrix);

		if (!is_only) {
			mat4.translate(matrix, matrix, offset);
		}

		mat4.multiply(matrix, matrix, mat3.toMat4(nodeMat3));

		vertices.forEach(vert => {
			const [vx, vy, vz] = vert;
			v[0] = matrix[0] * vx + matrix[4] * vy + matrix[8] * vz + matrix[12];
			v[1] = matrix[1] * vx + matrix[5] * vy + matrix[9] * vz + matrix[13];
			v[2] = matrix[2] * vx + matrix[6] * vy + matrix[10] * vz + matrix[14];

			for (let j = 0; j < 3; j++) {
				box.min[j] = Math.min(v[j], box.min[j]);
				box.max[j] = Math.max(v[j], box.max[j]);
			}
		});

		for (let i = 0; i < 3; i++) {
			box.offset[i] = (box.max[i] + box.min[i]) / 2.0;
			box.range[i] = (box.max[i] - box.min[i]) / 2.0;
			box.center[i] = box.min[i] + box.range[i];
		}

		nodes.forEach(node => {
			if (node.parentname === name && name !== node.parentname) {
				node.calcBoundingBox(localMatrix);
			}
		});
	}

	compile(instance_matrix) {
		const modelViewMat = mat4.create();
		const normalMat = mat4.create();
		const matrix = mat4.create();

		mat4.identity(matrix);
		mat4.translate(matrix, matrix, [-this.main.box.center[0], -this.main.box.max[1], -this.main.box.center[2]]);
		mat4.multiply(matrix, matrix, this.matrix);

		if (!this.is_only) {
			mat4.translate(matrix, matrix, this.offset);
		}

		mat4.multiply(matrix, matrix, mat3.toMat4(this.mat3));
		mat4.multiply(modelViewMat, instance_matrix, matrix);
		mat4.extractRotation(normalMat, modelViewMat);

		const { vertices, faces, textures } = this;
		const vert = new Float32Array(vertices.length * 3);
		vertices.forEach((v, i) => {
			const [vx, vy, vz] = v;
			vert[i * 3 + 0] = modelViewMat[0] * vx + modelViewMat[4] * vy + modelViewMat[8] * vz + modelViewMat[12];
			vert[i * 3 + 1] = modelViewMat[1] * vx + modelViewMat[5] * vy + modelViewMat[9] * vz + modelViewMat[13];
			vert[i * 3 + 2] = modelViewMat[2] * vx + modelViewMat[6] * vy + modelViewMat[10] * vz + modelViewMat[14];
		});

		const face_normal = new Float32Array(faces.length * 3);
		const mesh_size = {};
		textures.forEach(t => mesh_size[t] = 0);
		faces.forEach(f => mesh_size[textures[f.texid]]++);

		const mesh = {};
		textures.forEach(t => mesh[t] = new Float32Array(mesh_size[t] * 9 * 3));

		const { shadeType } = this.main;
		const shadeGroup = new Array(32);
		const shadeGroupUsed = new Array(32);

		if (shadeType === GR2.SHADING.NONE) {
			this.calcNormal_NONE(face_normal);
			this.generate_mesh_FLAT(vert, face_normal, mesh);
		} else if (shadeType === GR2.SHADING.FLAT) {
			this.calcNormal_FLAT(face_normal, normalMat, shadeGroupUsed);
			this.generate_mesh_FLAT(vert, face_normal, mesh);
		} else if (shadeType === GR2.SHADING.SMOOTH) {
			this.calcNormal_FLAT(face_normal, normalMat, shadeGroupUsed);
			this.calcNormal_SMOOTH(face_normal, shadeGroupUsed, shadeGroup);
			this.generate_mesh_SMOOTH(vert, shadeGroup, mesh);
		}

		return mesh;
	}

	calcNormal_NONE(out) {
		for (let i = 1; i < out.length; i += 3) {
			out[i] = -1;
		}
	}

	calcNormal_FLAT(out, normalMat, groupUsed) {
		const temp_vec = vec3.create();
		const { faces, vertices } = this;
		faces.forEach((face, i) => {
			vec3.calcNormal(vertices[face.vertidx[0]], vertices[face.vertidx[1]], vertices[face.vertidx[2]], temp_vec);
			const j = i * 3;
			out[j] = normalMat[0] * temp_vec[0] + normalMat[4] * temp_vec[1] + normalMat[8] * temp_vec[2] + normalMat[12];
			out[j + 1] = normalMat[1] * temp_vec[0] + normalMat[5] * temp_vec[1] + normalMat[9] * temp_vec[2] + normalMat[13];
			out[j + 2] = normalMat[2] * temp_vec[0] + normalMat[6] * temp_vec[1] + normalMat[10] * temp_vec[2] + normalMat[14];
			groupUsed[face.smoothGroup] = true;
		});
	}

	calcNormal_SMOOTH(normal, groupUsed, group) {
		const { vertices, faces } = this;
		const size = vertices.length;
		for (let j = 0; j < 32; ++j) {
			if (!groupUsed[j]) {
				continue;
			}
			group[j] = new Float32Array(size * 3);
			const norm = group[j];
			for (let v = 0; v < size; ++v) {
				let x = 0, y = 0, z = 0;
				faces.forEach((face, i) => {
					if (face.smoothGroup === j && (face.vertidx[0] === v || face.vertidx[1] === v || face.vertidx[2] === v)) {
						x += normal[i * 3];
						y += normal[i * 3 + 1];
						z += normal[i * 3 + 2];
					}
				});
				const len = 1 / Math.sqrt(x * x + y * y + z * z);
				const l = v * 3;
				norm[l] = x * len; norm[l + 1] = y * len; norm[l + 2] = z * len;
			}
		}
	}

	generate_mesh_FLAT(vert, norm, mesh) {
		const { faces, textures, tvertices: tver, main } = this;
		const { alpha } = main;
		const offset = {};
		textures.forEach(t => offset[t] = 0);

		faces.forEach((face, i) => {
			const { vertidx: idx, tvertidx: tidx, texid } = face;
			const t = textures[texid];
			const out = mesh[t];
			let o = offset[t];
			const k = i * 3;
			for (let j = 0; j < 3; j++, o += 9) {
				const a = idx[j] * 3;
				const b = tidx[j] * 6;
				out[o + 0] = vert[a + 0]; out[o + 1] = vert[a + 1]; out[o + 2] = vert[a + 2];
				out[o + 3] = norm[k + 0]; out[o + 4] = norm[k + 1]; out[o + 5] = norm[k + 2];
				out[o + 6] = tver[b + 4]; out[o + 7] = tver[b + 5];
				out[o + 8] = alpha;
			}
			offset[t] = o;
		});
	}

	generate_mesh_SMOOTH(vert, shadeGroup, mesh) {
		const { faces, textures, tvertices: tver, main } = this;
		const { alpha } = main;
		const offset = {};
		textures.forEach(t => offset[t] = 0);

		faces.forEach(face => {
			const { vertidx: idx, tvertidx: tidx, texid, smoothGroup } = face;
			const norm = shadeGroup[smoothGroup];
			const t = textures[texid];
			const out = mesh[t];
			let o = offset[t];
			for (let j = 0; j < 3; j++, o += 9) {
				const a = idx[j] * 3;
				const b = tidx[j] * 6;
				out[o + 0] = vert[a + 0]; out[o + 1] = vert[a + 1]; out[o + 2] = vert[a + 2];
				out[o + 3] = norm[a + 0]; out[o + 4] = norm[a + 1]; out[o + 5] = norm[a + 2];
				out[o + 6] = tver[b + 4]; out[o + 7] = tver[b + 5];
				out[o + 8] = alpha;
			}
			offset[t] = o;
		});
	}
}

/**
 * @class GR2
 * @description Loader for Gravity .gr2 models (Granny3D)
 */
class GR2 {
	static TRANSFORM_FLAGS = { HasPosition: 0x1, HasOrientation: 0x2, HasScaleShear: 0x4 };
	static MARSHALLING_TYPE = { AnyMarshalling: 0x0, Int8Marshalling: 0x1, Int16Marshalling: 0x2, Int32Marshalling: 0x4, MarshallingMask: 0x7 };
	static MEMBER_TYPE = { 
		EndMember: 0, InlineMember: 1, ReferenceMember: 2, ReferenceToArrayMember: 3, ArrayOfReferencesMember: 4, 
		VariantReferenceMember: 5, UnsupportedMemberType_Remove: 6, ReferenceToVariantArrayMember: 7, 
		StringMember: 8, TransformMember: 9, Real32Member: 10, Int8Member: 11, UInt8Member: 12, 
		BinormalInt8Member: 13, NormalUInt8Member: 14, Int16Member: 15, UInt16Member: 16, 
		BinormalInt16Member: 17, NormalUInt16Member: 18, Int32Member: 19, UInt32Member: 20, 
		Real16Member: 21, EmptyReferenceMember: 22, OnePastLastMemberType: 23, Bool32Member: 19
	};
	static MATERIAL_TEXTURE_TYPE = { 
		UnknownTextureType: 0, AmbientColorTexture: 1, DiffuseColorTexture: 2, SpecularColorTexture: 3, 
		SelfIlluminationTexture: 4, OpacityTexture: 5, BumpHeightTexture: 6, ReflectionTexture: 7, 
		RefractionTexture: 8, DisplacementTexture: 9, OnePastLastMaterialTextureType: 10
	};
	static BOUND_TRANSFORM_TRACK_FLAGS = {
		PositionCurveIsIdentity: 0, PositionCurveIsConstant: 1, PositionCurveIsKeyframed: 2, PositionCurveIsGeneral: 3, PositionCurveFlagMask: 3,
		OrientationCurveIsIdentity: 0, OrientationCurveIsConstant: 4, OrientationCurveIsKeyframed: 8, OrientationCurveIsGeneral: 12, OrientationCurveFlagMask: 12,
		ScaleShearCurveIsIdentity: 0, ScaleShearCurveIsConstant: 16, ScaleShearCurveIsKeyframed: 32, ScaleShearCurveIsGeneral: 48, ScaleShearCurveFlagMask: 48
	};
	static TRANSFORM_FILE_FLAGS = { RenormalizeNormals: 0x1, ReorderTriangleIndices: 0x2 };
	static BINK_TEXTURE_FLAGS = { EncodeAlpha: 0x1, UseScaledRGBInsteadOfYUV: 0x2, UseBink1: 0x4 };
	static BSPLINE_SOLVER_FLAGS = { BSplineSolverEvaluateAsQuaternions: 0x1, BSplineSolverAllowC0Splitting: 0x2, BSplineSolverAllowC1Splitting: 0x4, BSplineSolverExtraDOFKnotZero: 0x10, BSplineSolverForceEndpointAlignment: 0x20, BSplineSolverAllowReduceKeys: 0x40 };
	static CAMERA_OUTPUT_Z_RANGE = { CameraOutputZZeroToOne: 0, CameraOutputZNegativeOneToOne: 1, CameraOutputZNegativeOneToZero: 2 };
	static ACCUMULATION_MODE = { NoAccumulation: 0, ConstantExtractionAccumulation: 1, VariableDeltaAccumulation: 2 };
	static BLEND_DAG_NODE_TYPE = { Leaf_AnimationBlend: 0, Leaf_LocalPose: 1, Leaf_Callback: 2, OnePastLastLeafType: 3, Node_Crossfade: 4, Node_WeightedBlend: 5, OnePastLast: 6 };
	static FILE_DATA_TREE_FLAGS = { ExcludeTypeTree: 0x1 };
	static DEFORMATION_TYPE = { Position: 1, PositionNormal: 2, PositionNormalTangent: 3, PositionNormalTangentBinormal: 4 };
	static DEGREE_OF_FREEDOM = { 
		NoDOFs: 0, XTranslation: 1, YTranslation: 2, ZTranslation: 4, XRotation: 8, YRotation: 16, ZRotation: 32, 
		XScaleShear: 64, YScaleShear: 128, ZScaleShear: 256, 
		TranslationDOFs: 7, RotationDOFs: 56, ScaleShearDOFs: 448, AllDOFs: 511
	};
	static COMPRESSION_TYPE = { NoCompression: 0, Oodle0Compression: 1, Oodle1Compression: 2, OnePastLastCompressionType: 3 };
	static STANDARD_SECTION_INDEX = { MainSection: 0, RigidVertexSection: 1, RigidIndexSection: 2, DeformableVertexSection: 3, DeformableIndexSection: 4, TextureSection: 5, DiscardableSection: 6, UnloadedSection: 7, SectionCount: 8 };
	static GRN_TYPE_TAG = { FirstGRNUserTag: 0, LastGRNUserTag: 0x7fffffff, FirstGRNStandardTag: 0x80000000, LastGRNStandardTag: 0xffffffff };
	static FILE_WRITER_SEEK_TYPE = { GrannySeekStart: 0, GrannySeekEnd: 1, GrannySeekCurrent: 2 };
	static PIXEL_FILTER_TYPE = { CubicPixelFilter: 0, LinearPixelFilter: 1, BoxPixelFilter: 2, OnePastLastPixelFilterType: 3 };
	static QUATERNION_MODE = { BlendQuaternionDirectly: 0, BlendQuaternionInverted: 1, BlendQuaternionNeighborhooded: 2, BlendQuaternionAccumNeighborhooded: 3 };
	static LOG_MESSAGE_TYPE = { IgnoredLogMessage: 0, NoteLogMessage: 1, WarningLogMessage: 2, ErrorLogMessage: 3, OnePastLastMessageType: 4 };
	static LOG_MESSAGE_ORIGIN = { 
		NotImplementedLogMessage: 0, ApplicationLogMessage: 1, Win32SubsystemLogMessage: 2, Win64SubsystemLogMessage: 3, MacOSSubsystemLogMessage: 4, 
		ANSISubsystemLogMessage: 5, GamecubeSubsystemLogMessage: 6, PS2SubsystemLogMessage: 7, PSPSubsystemLogMessage: 8, PS3SubsystemLogMessage: 9, 
		XboxSubsystemLogMessage: 10, XenonSubsystemLogMessage: 11, MAXSubsystemLogMessage: 12, MayaSubsystemLogMessage: 13, XSISubsystemLogMessage: 14, 
		LightwaveSubsystemLogMessage: 15, FileWritingLogMessage: 16, FileReadingLogMessage: 17, ExporterLogMessage: 18, CompressorLogMessage: 19, 
		StringLogMessage: 20, StringTableLogMessage: 21, VertexLayoutLogMessage: 22, MeshLogMessage: 23, PropertyLogMessage: 24, SkeletonLogMessage: 25, 
		AnimationLogMessage: 26, SetupGraphLogMessage: 27, TextureLogMessage: 28, BSplineLogMessage: 29, HashLogMessage: 30, LinkerLogMessage: 31, 
		InstantiatorLogMessage: 32, DataTypeLogMessage: 33, NameMapLogMessage: 34, MaterialLogMessage: 35, ModelLogMessage: 36, StackAllocatorLogMessage: 37, 
		FixedAllocatorLogMessage: 38, SceneLogMessage: 39, TrackMaskLogMessage: 40, LocalPoseLogMessage: 41, WorldPoseLogMessage: 42, NameLibraryLogMessage: 43, 
		ControlLogMessage: 44, MeshBindingLogMessage: 45, MathLogMessage: 46, VersionLogMessage: 47, MemoryLogMessage: 48, DeformerLogMessage: 49, 
		VoxelLogMessage: 50, BitmapLogMessage: 51, IKLogMessage: 52, CurveLogMessage: 53, TrackGroupLogMessage: 54, ThreadSafetyLogMessage: 55, 
		QuantizeLogMessage: 56, BlendDagLogMessage: 57, OnePastLastMessageOrigin: 58
	};
	static DEFORMER_TAIL_FLAGS = { DontAllowUncopiedTail: 0, AllowUncopiedTail: 1 };
	static S3TC_TEXTURE_FORMAT = { S3TCBGR565: 0, S3TCBGRA5551: 1, S3TCBGRA8888MappedAlpha: 2, S3TCBGRA8888InterpolatedAlpha: 3, OnePastLastS3TCTextureFormat: 4 };
	static SKELETON_LOD_TYPE = { GrannyNoSkeletonLOD: 0x0, GrannyEstimatedLOD: 0x1, GrannyMeasuredLOD: 0x2 };
	static SPU_CURVE_TYPES = { CurveTypeReal32: 0, CurveTypeK16: 1, CurveTypeK8: 2, CurveType4nK16: 3, CurveType4nK8: 4 };
	static SPU_REPLICATION_TYPE = { ReplicationRaw: 0, ReplicationNormOri: 1, ReplicationDiagonalSS: 2 };
	static TEXTURE_TYPE = { ColorMapTextureType: 0, CubeMapTextureType: 1, OnePastLastTextureType: 2 };
	static TEXTURE_ENCODING = { UserTextureEncoding: 0, RawTextureEncoding: 1, S3TCTextureEncoding: 2, BinkTextureEncoding: 3, OnePastLastTextureEncoding: 4 };
	static TRANSFORM_TRACK_FLAGS = { UseAccumulatorNeighborhood: 0x1 };
	static TRACK_GROUP_FLAGS = { AccumulationExtracted: 0x1, TrackGroupIsSorted: 0x2, AccumulationIsVDA: 0x4 };
	static VECTOR_DIFF_MODE = { DiffAsVectors: 0, DiffAsQuaternions: 1, ManhattanMetric: 2 };
	static EXTRACT_TRACK_MASK_RESULT = { ExtractTrackMaskResult_AllDataPresent: 0, ExtractTrackMaskResult_PartialDataPresent: 1, ExtractTrackMaskResult_NoDataPresent: 2 };
	static COMPOSITE_FLAG = { IncludeComposites: 0, ExcludeComposites: 1 };
	static SHADING = { NONE: 0, FLAT: 1, SMOOTH: 2 };
	static InfiniteFarClipPlane = 0.0;
	static CurrentGRNStandardTag = 0x80000000 + 38;
	static CurrentGRNFileVersion = 7;
	static GRNExtraTagCount = 4;

	constructor(data) {
		this.version = 0.0;
		this.animLen = 0;
		this.shadeType = GR2.SHADING.SMOOTH;
		this.main_node = null;
		this.alpha = 1.0;
		this.instances = [];
		this.box = new BoundingBox();
		this.textures = [];
		this.nodes = [];
		this.volumebox = [];
		this.posKeyframes = [];

		if (data) {
			this.load(data);
		}
	}

	load(data) {
		const fp = new BinaryReader(data);
		fp.seek(0x1f, SEEK_SET);
		this.IsByteReversed = !!fp.readByte();
		this.Header = new Header(fp);
		this.SourceMagicValue = new GrannyFileMagicValue(fp);
		this.SectionCount = fp.readInt();
		this.Sections = [];

		const sectionArrayAddress = 0x20 + this.Header.SectionArrayOffset;
		const crc = fp.CRC32(sectionArrayAddress);
		if (crc !== this.Header.CRC) {
			console.warn('GR2::load() - CRC mismatch');
		}

		fp.seek(sectionArrayAddress, SEEK_SET);
		for (let i = 0; i < this.Header.SectionArrayCount; i++) {
			const s = new Section(fp);
			if (s.Format === GR2.COMPRESSION_TYPE.NoCompression) {
				s.decompress(fp);
			}
			this.Sections.push(s);
		}
		// Legacy code stopped here with return;
	}

	createInstance(model, width, height) {
		const matrix = mat4.create();
		mat4.identity(matrix);
		mat4.translate(matrix, matrix, [model.position[0] + width, model.position[1], model.position[2] + height]);
		mat4.rotateZ(matrix, matrix, (model.rotation[2] / 180) * Math.PI);
		mat4.rotateX(matrix, matrix, (model.rotation[0] / 180) * Math.PI);
		mat4.rotateY(matrix, matrix, (model.rotation[1] / 180) * Math.PI);
		mat4.scale(matrix, matrix, model.scale);
		this.instances.push(matrix);
	}

	calcBoundingBox() {
		const { box, nodes } = this;
		const matrix = mat4.create();
		mat4.identity(matrix);
		this.main_node.calcBoundingBox(matrix);

		for (let i = 0; i < 3; ++i) {
			nodes.forEach(node => {
				box.max[i] = Math.max(box.max[i], node.box.max[i]);
				box.min[i] = Math.min(box.min[i], node.box.min[i]);
			});
			box.offset[i] = (box.max[i] + box.min[i]) / 2.0;
			box.range[i] = (box.max[i] - box.min[i]) / 2.0;
			box.center[i] = box.min[i] + box.range[i];
		}
	}

	compile() {
		const { nodes, instances, textures } = this;
		const meshes = new Array(nodes.length * instances.length);
		let k = 0;
		nodes.forEach(node => {
			instances.forEach(instance => {
				meshes[k++] = node.compile(instance);
			});
		});
		return { meshes, textures };
	}
}

export default GR2;
