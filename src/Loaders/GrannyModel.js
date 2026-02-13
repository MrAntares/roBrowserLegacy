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

//TODO:
//Figure out how to decompress.
//Figure out how to use this structure tree that granny has by default for each sections information.

define(['Utils/BinaryReader', 'Utils/gl-matrix', 'Utils/CRC32'], function (BinaryReader, glMatrix) {
	'use strict';

	/**
	 * Import
	 */
	var vec3 = glMatrix.vec3;
	var mat3 = glMatrix.mat3;
	var mat4 = glMatrix.mat4;

	/**
	 * Model class loader
	 *
	 * @param {ArrayBuffer} data - optional
	 */
	function GR2(data) {
		if (data) {
			this.load(data);
		}
	}

	/**
	 *  Transformation Flags
	 */
	GR2.TRANSFORM_FLAGS = {
		HasPosition: 0x1,
		HasOrientation: 0x2,
		HasScaleShear: 0x4
	};

	GR2.MARSHALLING_TYPE = {
		AnyMarshalling: 0x0,
		Int8Marshalling: 0x1,
		Int16Marshalling: 0x2,
		Int32Marshalling: 0x4,
		MarshallingMask: 0x7
	};

	GR2.MEMBER_TYPE = {
		EndMember: 0,
		InlineMember: 1,
		ReferenceMember: 2,
		ReferenceToArrayMember: 3,
		ArrayOfReferencesMember: 4,
		VariantReferenceMember: 5,
		UnsupportedMemberType_Remove: 6,
		ReferenceToVariantArrayMember: 7,
		StringMember: 8,
		TransformMember: 9,
		Real32Member: 10,
		Int8Member: 11,
		UInt8Member: 12,
		BinormalInt8Member: 13,
		NormalUInt8Member: 14,
		Int16Member: 15,
		UInt16Member: 16,
		BinormalInt16Member: 17,
		NormalUInt16Member: 18,
		Int32Member: 19,
		UInt32Member: 20,
		Real16Member: 21,
		EmptyReferenceMember: 22,
		OnePastLastMemberType: 23,
		Bool32Member: 19 // Same as Int32Member
	};

	GR2.MATERIAL_TEXTURE_TYPE = {
		UnknownTextureType: 0,
		AmbientColorTexture: 1,
		DiffuseColorTexture: 2,
		SpecularColorTexture: 3,
		SelfIlluminationTexture: 4,
		OpacityTexture: 5,
		BumpHeightTexture: 6,
		ReflectionTexture: 7,
		RefractionTexture: 8,
		DisplacementTexture: 9,
		OnePastLastMaterialTextureType: 10
	};

	GR2.BOUND_TRANSFORM_TRACK_FLAGS = {
		PositionCurveIsIdentity: 0x0 << 0, // TODO Turn these into the number it would become
		PositionCurveIsConstant: 0x1 << 0,
		PositionCurveIsKeyframed: 0x2 << 0,
		PositionCurveIsGeneral: 0x3 << 0,
		PositionCurveFlagMask: 0x3 << 0,
		OrientationCurveIsIdentity: 0x0 << 2,
		OrientationCurveIsConstant: 0x1 << 2,
		OrientationCurveIsKeyframed: 0x2 << 2,
		OrientationCurveIsGeneral: 0x3 << 2,
		OrientationCurveFlagMask: 0x3 << 2,
		ScaleShearCurveIsIdentity: 0x0 << 4,
		ScaleShearCurveIsConstant: 0x1 << 4,
		ScaleShearCurveIsKeyframed: 0x2 << 4,
		ScaleShearCurveIsGeneral: 0x3 << 4,
		ScaleShearCurveFlagMask: 0x3 << 4
	};

	GR2.TRANSFORM_FILE_FLAGS = {
		RenormalizeNormals: 0x1,
		ReorderTriangleIndices: 0x2
	};

	GR2.BINK_TEXTURE_FLAGS = {
		EncodeAlpha: 0x1,
		UseScaledRGBInsteadOfYUV: 0x2,
		UseBink1: 0x4
	};

	GR2.BSPLINE_SOLVER_FLAGS = {
		BSplineSolverEvaluateAsQuaternions: 0x1,
		BSplineSolverAllowC0Splitting: 0x2,
		BSplineSolverAllowC1Splitting: 0x4,
		BSplineSolverExtraDOFKnotZero: 0x10,
		BSplineSolverForceEndpointAlignment: 0x20,
		BSplineSolverAllowReduceKeys: 0x40
	};

	GR2.CAMERA_OUTPUT_Z_RANGE = {
		CameraOutputZZeroToOne: 0,
		CameraOutputZNegativeOneToOne: 1,
		CameraOutputZNegativeOneToZero: 2
	};

	GR2.ACCUMULATION_MODE = {
		NoAccumulation: 0,
		ConstantExtractionAccumulation: 1,
		VariableDeltaAccumulation: 2
	};

	GR2.BLEND_DAG_NODE_TYPE = {
		Leaf_AnimationBlend: 0,
		Leaf_LocalPose: 1,
		Leaf_Callback: 2,
		OnePastLastLeafType: 3,
		Node_Crossfade: 4,
		Node_WeightedBlend: 5,
		OnePastLast: 6
	};

	GR2.FILE_DATA_TREE_FLAGS = {
		ExcludeTypeTree: 0x1
	};

	GR2.DEFORMATION_TYPE = {
		// Starts from 1
		Position: 1,
		PositionNormal: 2,
		PositionNormalTangent: 3,
		PositionNormalTangentBinormal: 4
	};

	GR2.DEGREE_OF_FREEDOM = {
		NoDOFs: 0,
		XTranslation: 0x001,
		YTranslation: 0x002,
		ZTranslation: 0x004,
		XRotation: 0x008,
		YRotation: 0x010,
		ZRotation: 0x020,
		XScaleShear: 0x040,
		YScaleShear: 0x080,
		ZScaleShear: 0x100,
		TranslationDOFs: 0x001 | 0x002 | 0x004, //XTranslation | YTranslation | ZTranslation,
		RotationDOFs: 0x008 | 0x010 | 0x020, //XRotation | YRotation | ZRotation,
		ScaleShearDOFs: 0x040 | 0x080 | 0x100, //XScaleShear | YScaleShear | ZScaleShear,
		AllDOFs:
			0x001 |
			0x002 |
			0x004 | // RotationDOFs
			0x008 |
			0x010 |
			0x020 | // ScaleShearDOFs
			0x040 |
			0x080 |
			0x100 // TranslationDOFs
	};

	GR2.COMPRESSION_TYPE = {
		NoCompression: 0,
		Oodle0Compression: 1,
		Oodle1Compression: 2,
		OnePastLastCompressionType: 3
	};

	GR2.STANDARD_SECTION_INDEX = {
		MainSection: 0,
		RigidVertexSection: 1,
		RigidIndexSection: 2,
		DeformableVertexSection: 3,
		DeformableIndexSection: 4,
		TextureSection: 5,
		DiscardableSection: 6,
		UnloadedSection: 7,
		SectionCount: 8
	};

	GR2.GRN_TYPE_TAG = {
		FirstGRNUserTag: 0,
		LastGRNUserTag: 0x7fffffff,
		FirstGRNStandardTag: 0x80000000,
		LastGRNStandardTag: 0xffffffff
	};

	GR2.FILE_WRITER_SEEK_TYPE = {
		GrannySeekStart: 0,
		GrannySeekEnd: 1,
		GrannySeekCurrent: 2
	};

	GR2.PIXEL_FILTER_TYPE = {
		CubicPixelFilter: 0,
		LinearPixelFilter: 1,
		BoxPixelFilter: 2,
		OnePastLastPixelFilterType: 3
	};

	GR2.QUATERNION_MODE = {
		BlendQuaternionDirectly: 0,
		BlendQuaternionInverted: 1,
		BlendQuaternionNeighborhooded: 2,
		BlendQuaternionAccumNeighborhooded: 3
	};

	GR2.LOG_MESSAGE_TYPE = {
		IgnoredLogMessage: 0,
		NoteLogMessage: 1,
		WarningLogMessage: 2,
		ErrorLogMessage: 3,
		OnePastLastMessageType: 4
	};

	GR2.LOG_MESSAGE_ORIGIN = {
		NotImplementedLogMessage: 0,
		ApplicationLogMessage: 1,
		Win32SubsystemLogMessage: 2,
		Win64SubsystemLogMessage: 3,
		MacOSSubsystemLogMessage: 4,
		ANSISubsystemLogMessage: 5,
		GamecubeSubsystemLogMessage: 6,
		PS2SubsystemLogMessage: 7,
		PSPSubsystemLogMessage: 8,
		PS3SubsystemLogMessage: 9,
		XboxSubsystemLogMessage: 10,
		XenonSubsystemLogMessage: 11,
		MAXSubsystemLogMessage: 12,
		MayaSubsystemLogMessage: 13,
		XSISubsystemLogMessage: 14,
		LightwaveSubsystemLogMessage: 15,
		FileWritingLogMessage: 16,
		FileReadingLogMessage: 17,
		ExporterLogMessage: 18,
		CompressorLogMessage: 19,
		StringLogMessage: 20,
		StringTableLogMessage: 21,
		VertexLayoutLogMessage: 22,
		MeshLogMessage: 23,
		PropertyLogMessage: 24,
		SkeletonLogMessage: 25,
		AnimationLogMessage: 26,
		SetupGraphLogMessage: 27,
		TextureLogMessage: 28,
		BSplineLogMessage: 29,
		HashLogMessage: 30,
		LinkerLogMessage: 31,
		InstantiatorLogMessage: 32,
		DataTypeLogMessage: 33,
		NameMapLogMessage: 34,
		MaterialLogMessage: 35,
		ModelLogMessage: 36,
		StackAllocatorLogMessage: 37,
		FixedAllocatorLogMessage: 38,
		SceneLogMessage: 39,
		TrackMaskLogMessage: 40,
		LocalPoseLogMessage: 41,
		WorldPoseLogMessage: 42,
		NameLibraryLogMessage: 43,
		ControlLogMessage: 44,
		MeshBindingLogMessage: 45,
		MathLogMessage: 46,
		VersionLogMessage: 47,
		MemoryLogMessage: 48,
		DeformerLogMessage: 49,
		VoxelLogMessage: 50,
		BitmapLogMessage: 51,
		IKLogMessage: 52,
		CurveLogMessage: 53,
		TrackGroupLogMessage: 54,
		ThreadSafetyLogMessage: 55,
		QuantizeLogMessage: 56,
		BlendDagLogMessage: 57,
		OnePastLastMessageOrigin: 58
	};

	GR2.DEFORMER_TAIL_FLAGS = {
		DontAllowUncopiedTail: 0,
		AllowUncopiedTail: 1
	};

	GR2.S3TC_TEXTURE_FORMAT = {
		S3TCBGR565: 0,
		S3TCBGRA5551: 1,
		S3TCBGRA8888MappedAlpha: 2,
		S3TCBGRA8888InterpolatedAlpha: 3,
		OnePastLastS3TCTextureFormat: 4
	};

	GR2.SKELETON_LOD_TYPE = {
		GrannyNoSkeletonLOD: 0x0,
		GrannyEstimatedLOD: 0x1,
		GrannyMeasuredLOD: 0x2
	};

	GR2.SPU_CURVE_TYPES = {
		CurveTypeReal32: 0,
		CurveTypeK16: 1,
		CurveTypeK8: 2,
		CurveType4nK16: 3,
		CurveType4nK8: 4
	};

	GR2.spu_replication_type = {
		ReplicationRaw: 0,
		ReplicationNormOri: 1,
		ReplicationDiagonalSS: 2
	};

	GR2.TEXTURE_TYPE = {
		ColorMapTextureType: 0,
		CubeMapTextureType: 1,
		OnePastLastTextureType: 2
	};

	GR2.TEXTURE_ENCODING = {
		UserTextureEncoding: 0,
		RawTextureEncoding: 1,
		S3TCTextureEncoding: 2,
		BinkTextureEncoding: 3,
		OnePastLastTextureEncoding: 4
	};

	GR2.TRANSFORM_TRACK_FLAGS = {
		UseAccumulatorNeighborhood: 0x1
	};

	GR2.track_group_flags = {
		AccumulationExtracted: 0x1,
		TrackGroupIsSorted: 0x2,
		AccumulationIsVDA: 0x4
	};

	GR2.VECTOR_DIFF_MODE = {
		DiffAsVectors: 0,
		DiffAsQuaternions: 1,
		ManhattanMetric: 2
	};

	GR2.EXTRACT_TRACK_MASK_RESULT = {
		ExtractTrackMaskResult_AllDataPresent: 0,
		ExtractTrackMaskResult_PartialDataPresent: 1,
		ExtractTrackMaskResult_NoDataPresent: 2
	};

	GR2.COMPOSITE_FLAG = {
		IncludeComposites: 0,
		ExcludeComposites: 1
	};

	/**
	 * Constants defined by the Granny Engine
	 */
	GR2.InfiniteFarClipPlane = 0.0;
	GR2.LCD17PhysicalAspectRatio = 1.25;
	GR2.NTSCTelevisionPhysicalAspectRatio = 1.33;
	GR2.PALTelevisionPhysicalAspectRatio = 1.33;
	GR2.WidescreenMonitorPhysicalAspectRatio = 1.56;
	GR2.EuropeanFilmAspectRatio = 1.66;
	GR2.USDigitalTelevisionAspectRatio = 1.78;
	GR2.USAcademyFlatPhysicalAspectRatio = 1.85;
	GR2.USPanavisionAspectRatio = 2.2;
	GR2.USAnamorphicScopePhysicalAspectRatio = 2.35;
	GR2.CurrentGRNStandardTag = 0x80000000 + 38;
	GR2.CurrentGRNFileVersion = 7;
	GR2.GRNExtraTagCount = 4;

	// GR2.CloseFileReader(Reader) if(Reader) {(*(Reader)->CloseFileReaderCallback)(__FILE__, __LINE__, Reader);};
	// GR2.ReadAtMost(Reader, Pos, Count, Buffer) (*(Reader).ReadAtMostCallback)(__FILE__, __LINE__, Reader, Pos, Count, Buffer);
	// GR2.ReadExactly(Reader, Pos, Count, Buffer) ((*(Reader).ReadAtMostCallback)(__FILE__, __LINE__, Reader, Pos, Count, Buffer) == Count);
	// GR2.DeleteFileWriter(Writer) (*(Writer)->DeleteFileWriterCallback)(__FILE__, __LINE__, Writer);
	// GR2.GetWriterPosition(Writer) (*(Writer).SeekWriterCallback)(__FILE__, __LINE__, Writer, 0, SeekCurrent);
	// GR2.SeekWriterFromStart(Writer, OffsetInUInt8s) (SeekWriterFromStartStub(__FILE__, __LINE__, Writer, OffsetInUInt8s));
	// GR2.SeekWriterFromEnd(Writer, OffsetInUInt8s) (SeekWriterFromEndStub(__FILE__, __LINE__, Writer, OffsetInUInt8s));
	// GR2.SeekWriterFromCurrentPosition(Writer, OffsetInUInt8s) (SeekWriterFromCurrentPositionStub(__FILE__, __LINE__, Writer, OffsetInUInt8s));
	// GR2.Write(Writer, UInt8Count, WritePointer) (*(Writer).WriteCallback)(__FILE__, __LINE__, Writer, UInt8Count, WritePointer);
	// GR2.BeginWriterCRC(Writer) (*(Writer).BeginCRCCallback)(__FILE__, __LINE__, Writer);
	// GR2.EndWriterCRC(Writer) (*(Writer).EndCRCCallback)(__FILE__, __LINE__, Writer);
	// GR2.WriterIsCRCing(Writer) ((Writer).CRCing);

	GR2.MaximumSystemFileNameSize = 1 << 9;
	GR2.MaximumTempFileNameSize = 1 << 9;
	GR2.MaximumMessageBufferSize = 1 << 15;
	GR2.MaximumLogFileNameSize = 1 << 9;
	GR2.MaximumAggregateCount = 1 << 6;
	GR2.MaximumNumberToStringBuffer = 1 << 8;
	GR2.MaximumIKLinkCount = 1 << 8;
	GR2.MaximumMIPLevelCount = 1 << 5;
	GR2.MaximumVertexNameLength = 1 << 6;
	GR2.MaximumUserData = 1 << 2;
	GR2.MaximumBoneNameLength = 1 << 9;
	GR2.MaximumChannelCount = 1 << 8;
	GR2.MaximumWeightCount = 1 << 8;
	GR2.MaximumChannelWidth = 1 << 2;
	GR2.MaximumBSplineDimension = 16;
	GR2.MaximumBSplineKnotPower = 16;
	GR2.DefaultAllocationAlignment = 4;
	GR2.MatrixBufferAlignment = 16;
	GR2.DefaultFixedAllocatorBlockAlignment = 16;
	GR2.BlockFileFixupCount = 1 << 8;
	GR2.ExpectedUsablePageSize = 4000;
	GR2.MinimumAllocationsPerFixedBlock = 1 << 6;
	GR2.FileCopyBufferSize = 1 << 16;
	GR2.CRCCheckBufferSize = 1 << 16;
	GR2.TrackWeightEpsilon = 0.001;
	GR2.PositionIdentityThreshold = 0.001;
	GR2.OrientationIdentityThreshold = 0.0001;
	GR2.ScaleShearIdentityThreshold = 0.001;
	GR2.BlendEffectivelyZero = 0.001;
	GR2.BlendEffectivelyOne = 0.999;
	GR2.TimeEffectivelyZero = 0.00001;
	GR2.DefaultLocalPoseFillThreshold = 0.2;
	GR2.NoSparseBone = -1;
	GR2.NoParentBone = -1;
	GR2.SPUTransformTrackNoCurve = 0xffffffff;
	GR2.TopologyNullIndex = 0xffffffff;
	GR2.ProductVersion = '2.7.0.30';
	GR2.ProductMajorVersion = 2;
	GR2.ProductMinorVersion = 7;
	GR2.ProductCustomization = 0;
	GR2.ProductBuildNumber = 30;
	GR2.VertexPositionName = 'Position';
	GR2.VertexNormalName = 'Normal';
	GR2.VertexTangentName = 'Tangent';
	GR2.VertexBinormalName = 'Binormal';
	GR2.VertexTangentBinormalCrossName = 'TangentBinormalCross';
	GR2.VertexBoneWeightsName = 'BoneWeights';
	GR2.VertexBoneIndicesName = 'BoneIndices';
	GR2.VertexDiffuseColorName = 'DiffuseColor';
	GR2.VertexSpecularColorName = 'SpecularColor';
	GR2.VertexTextureCoordinatesName = 'TextureCoordinates';
	GR2.VertexMorphCurvePrefix = 'VertexMorphCurve';

	GR2.GrannyVersionsMatch = function (
		GrannyProductMajorVersion,
		GrannyProductMinorVersion,
		GrannyProductCustomization,
		GrannyProductBuildNumber
	) {};

	GR2.File = function (input) {
		// GrannyReadEntireFile or GrannyReadEntireFileFromMemory
		// Check if input is buffer then from memory else from string
		//FileName
	};

	GR2.FileCRCIsValid = function (FileName) {
		return GR2.File(FileName).CRCIsVaild();
	};

	GR2.File.prototype.CRCIsVaild = function (FileName) {
		return true;
	};
	/**
	 * Model Shading type
	 */
	GR2.SHADING = {
		NONE: 0,
		FLAT: 1,
		SMOOTH: 2
	};

	/**
	 * Bounding Box
	 */
	GR2.Box = function BoundingBox() {
		this.max = vec3.fromValues(-Infinity, -Infinity, -Infinity);
		this.min = vec3.fromValues(Infinity, Infinity, Infinity);
		this.offset = vec3.create();
		this.range = vec3.create();
		this.center = vec3.create();
	};

	/**
	 * Loading GR2 file
	 *
	 * @param {ArrayBuffer} data
	 */
	GR2.prototype.load = function Load(data) {
		var fp, header, name;
		var i, count;
		var textures, nodes, posKeyframes, volumebox;

		// Read header.
		fp = new BinaryReader(data);
		// Standard Granny File structure distrbution.
		// 0 GrannyStandardMainSection             - All structures go here
		// 1 GrannyStandardRigidVertexSection      - All rigid vertices go here
		// 2 GrannyStandardRigidIndexSection       - All indices into rigid vertex arrays go here
		// 3 GrannyStandardDeformableVertexSection - All deformable vertices go here
		// 4 GrannyStandardDeformableIndexSection  - All indices into deformable vertex arrays go here
		// 5 GrannyStandardTextureSection          - All textures go here

		function Section(fp) {
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
		}

		Section.prototype.decompress = function (fp) {
			if (this.IsReady) {
				return true;
			}

			var data = new BinaryReader(fp.buffer, this.DataOffset, this.DataSize);
			// TODO Create an output buffer the size of ExpandedDataSize for copying uncompressed data into.

			switch (this.Format) {
				case GR2.COMPRESSION_TYPE.NoCompression:
					if (this.ExpandedDataSize != this.DataSize) {
						console.error('Expanded Data Size and DataSize do not match.');
					}
					this.data = data;
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

			// After decompression (if necessary), data from a granny_grn_section must be block marshalled, heterogenous objects must be marshalled, and pointers must be fixed up. Block marshalling is accomplished like this:
			// 			if (this.FileIsByteReversed) {
			// 				ReverseSection();
			// 			}

			return this.IsReady;
		};

		function Reference(fp) {
			this.SectionIndex = fp.readUInt();
			this.Offset = fp.readUInt();
		}

		function Header(fp) {
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

		function GrannyFileMagicValue(fp) {
			this.MagicValue = [fp.readUInt(), fp.readUInt(), fp.readUInt(), fp.readUInt()];
			this.HeaderSize = fp.readUInt();
			this.HeaderFormat = fp.readUInt();
			this.Reserved = [fp.readUInt(), fp.readUInt()];
		}

		// Not called with new as we return an array of 3 float.
		function Triple() {
			if (arguments.length === 1) {
				// Set from file pointer
				let fp = arguments[0];
				return [fp.readFloat(), fp.readFloat(), fp.readFloat()];
			} else if (arguments.length == 3) {
				// Set from X,Y,Z etc
				return [arguments[0], arguments[1], arguments[2]];
			}
			return [0, 0, 0];
		}

		function GrannyDataTypeDefinition() {
			//granny_member_type Type;
			//char const * Name;
			//this.ReferenceType = null;// GrannyDataTypeDefinition * ;
			//granny_int32 ArrayWidth;
			//granny_int32 Extra[3];
			//granny_uintaddrx Ignored__Ignored;
		}

		function GrannyVariant(fp) {
			this.Type = new GrannyDataTypeDefinition(fp);
			this.Object = null;
		}

		function GrannyArtToolInfo(fp) {
			this.FromArtToolName = fp.readString(30); // TODO Check how to read strings
			this.ArtToolMajorRevision = fp.readUInt();
			this.ArtToolMinorRevision = fp.readUInt();
			this.UnitsPerMeter = fp.readFloat();
			this.Origin = Triple(fp);
			this.RightVector = Triple(fp);
			this.UpVector = Triple(fp);
			this.BackVector = Triple(fp);
			this.ExtendedData = new GrannyVariant(fp);
		}

		function GrannyFileInfo(fp) {
			//granny_art_tool_info * ArtToolInfo;
			//granny_exporter_info * ExporterInfo;
			this.FromFileName = fp.readString(30); // TODO Check how to read strings.
			this.TextureCount = fp.readInt();
			this.Textures = null; //granny_texture ** Textures;
			this.MaterialCount = fp.readInt();
			this.Materials = null; //granny_material ** Materials;
			this.SkeletonCount = fp.readInt();
			this.Skeletons = null; //granny_skeleton ** Skeletons;
			this.VertexDataCount = fp.readInt();
			this.VertexDatas = null; //granny_vertex_data ** VertexDatas;
			this.TriTopologyCount = fp.readInt();
			this.TriTopologies = null; //granny_tri_topology ** TriTopologies;
			this.MeshCount = fp.readInt();
			this.Meshes = null; //granny_mesh ** Meshes;
			this.ModelCount = fp.readInt();
			this.Models = null; //granny_model ** Models;
			this.TrackGroupCount = fp.readInt();
			this.TrackGroups = null; //granny_track_group ** TrackGroups;
			this.AnimationCount = fp.readInt();
			//granny_animation ** Animations;
			//granny_variant ExtendedData;
		}
		//header  = fp.readBinaryString(2);
		// GrannyReverseSection

		//if (header.charAt(1) !== 'g') {
		//			throw new Error('GR2::load() - Incorrect header "' + header + '", must be "g"');
		//}
		// Read infos
		fp.seek(0x1f);
		this.IsByteReversed = fp.readByte(); // bool IsByteReversed;
		this.Header = new Header(fp);
		this.SourceMagicValue = new GrannyFileMagicValue(fp);
		this.SectionCount = fp.readInt();
		this.Sections = [];
		this.Marshalled = null;
		this.IsUserMemory = null;
		this.ConversionBuffer = null;
		var SectionArrayAddress = 0x20 + this.Header.SectionArrayOffset;
		var crc = fp.CRC32(SectionArrayAddress);

		console.error(crc == this.Header.CRC ? 'CRC Matches' : 'CRC Not Match');
		fp.seek(SectionArrayAddress);
		for (i = 0; i < this.Header.SectionArrayCount; i++) {
			let s = new Section(fp);
			if (s.Format == GR2.COMPRESSION_TYPE.NoCompression) {
				s.decompress(fp);
			}
			this.Sections.push(s);
		}

		//delete this.Header.SectionArrayCount; // Removing Header.SectionArrayCount count as it is no longer needed. Sections.length is it.
		console.log(this);
		return;
		// 		void ** Sections;
		// 		bool * Marshalled;
		// 		bool * IsUserMemory;
		// 		void * ConversionBuffer;
		/*		this.version    = fp.readByte() + fp.readByte()/10;
		this.animLen    = fp.readLong();
		this.shadeType  = fp.readLong();
		this.main_node  = null;

		this.alpha      =   ( this.version >= 1.4 ) ? fp.readUByte() / 255.0 : 1.0;
		fp.seek( 16, SEEK_CUR ); // reserved.


		// Read textures.
		count     = fp.readLong();
		textures  =  new Array(count);
		for (i = 0; i < count; ++i) {
			textures[i] = fp.readBinaryString(40);
		}

		// Read nodes.
		name   =  fp.readBinaryString(40);
		count  =  fp.readLong();
		nodes  =  new Array(count);

		for (i = 0; i < count; ++i) {
			nodes[i] =  new GR2.Node( this, fp, count === 1 );
			if (nodes[i].name === name) {
				this.main_node = nodes[i];
			}
		}

		// In some custom models, the default name don't match nodes name.
		// So by default, assume the main node is the first one.
		if (this.main_node === null) {
			this.main_node = nodes[0];
		}

		// Read poskeyframes
		if (this.version < 1.5) {
			count         = fp.readLong();
			posKeyframes  = new Array(count);

			for (i = 0; i < count; ++i) {
				posKeyframes[i] = {
					frame: fp.readLong(),
					px:    fp.readFloat(),
					py:    fp.readFloat(),
					pz:    fp.readFloat()
				};
			}

			this.posKeyframes = posKeyframes;
		}
		else {
			this.posKeyframes = [];
		}


		// read Volume box
		count       = fp.readLong();
		volumebox   = new Array(count);

		for (i = 0; i < count; ++i) {
			volumebox[i] = {
				size: [ fp.readFloat(), fp.readFloat(), fp.readFloat() ],
				pos:  [ fp.readFloat(), fp.readFloat(), fp.readFloat() ],
				rot:  [ fp.readFloat(), fp.readFloat(), fp.readFloat() ],
				flag: ( this.version >= 1.3 ) ? fp.readLong() : 0
			};
		}

		this.instances    = [];
		this.box          = new GR2.Box();
		this.textures     = textures;
		this.nodes        = nodes;
		this.volumebox    = volumebox;


		// Calculate bounding box
		this.calcBoundingBox();*/
	};

	/**
	 * Create a model instance
	 *
	 * @param {object} model
	 * @param {number} width
	 * @param {number} height
	 */
	GR2.prototype.createInstance = function CreateInstance(model, width, height) {
		var matrix = mat4.create();

		mat4.identity(matrix);
		mat4.translate(matrix, matrix, [model.position[0] + width, model.position[1], model.position[2] + height]);
		mat4.rotateZ(matrix, matrix, (model.rotation[2] / 180) * Math.PI);
		mat4.rotateX(matrix, matrix, (model.rotation[0] / 180) * Math.PI);
		mat4.rotateY(matrix, matrix, (model.rotation[1] / 180) * Math.PI);
		mat4.scale(matrix, matrix, model.scale);

		this.instances.push(matrix);
	};

	/**
	 * Calculate model bounding box
	 */
	GR2.prototype.calcBoundingBox = function CalcBoundingBox() {
		var i, j, count;
		var box = this.box;
		var matrix = mat4.create();
		var nodes = this.nodes;
		var min = Math.min,
			max = Math.max;
		count = nodes.length;

		mat4.identity(matrix);
		this.main_node.calcBoundingBox(matrix);

		for (i = 0; i < 3; ++i) {
			for (j = 0; j < count; ++j) {
				box.max[i] = max(box.max[i], nodes[j].box.max[i]);
				box.min[i] = min(box.min[i], nodes[j].box.min[i]);
			}
			box.offset[i] = (box.max[i] + box.min[i]) / 2.0;
			box.range[i] = (box.max[i] - box.min[i]) / 2.0;
			box.center[i] = box.min[i] + box.range[i];
		}
	};

	/**
	 * Compile Model
	 */
	GR2.prototype.compile = function Compile() {
		var nodes = this.nodes;
		var instances = this.instances;

		var node_count = nodes.length;
		var instance_count = instances.length;
		var i, j, k;

		var meshes = new Array(node_count * instance_count);

		// Generate Mesh
		for (i = 0, k = 0; i < node_count; ++i) {
			for (j = 0; j < instance_count; ++j, k++) {
				meshes[k] = nodes[i].compile(instances[j]);
			}
		}

		return {
			meshes: meshes,
			textures: this.textures
		};
	};

	/**
	 * Node Constructor
	 *
	 * @param {object} gr2
	 * @param {object} fp BinaryReader
	 * @param {boolean} only
	 */
	GR2.Node = function Node(gr2, fp, only) {
		var i,
			j,
			count,
			version = gr2.version;
		var textures, vertices, tvertices, faces, posKeyframes, rotKeyframes;

		// Read initialised
		this.main = gr2;
		this.is_only = only;

		// Read name
		this.name = fp.readBinaryString(40);
		this.parentname = fp.readBinaryString(40);

		// Read textures
		count = fp.readLong();
		textures = new Array(count);

		for (i = 0; i < count; ++i) {
			textures[i] = fp.readLong();
		}

		// Read options
		this.mat3 = [
			fp.readFloat(),
			fp.readFloat(),
			fp.readFloat(),
			fp.readFloat(),
			fp.readFloat(),
			fp.readFloat(),
			fp.readFloat(),
			fp.readFloat(),
			fp.readFloat()
		];
		this.offset = [fp.readFloat(), fp.readFloat(), fp.readFloat()];
		this.pos = [fp.readFloat(), fp.readFloat(), fp.readFloat()];
		this.rotangle = fp.readFloat();
		this.rotaxis = [fp.readFloat(), fp.readFloat(), fp.readFloat()];
		this.scale = [fp.readFloat(), fp.readFloat(), fp.readFloat()];

		// Read vertices
		count = fp.readLong();
		vertices = new Array(count);
		for (i = 0; i < count; ++i) {
			vertices[i] = [fp.readFloat(), fp.readFloat(), fp.readFloat()];
		}

		// Read textures vertices
		count = fp.readLong();
		tvertices = new Float32Array(count * 6);
		for (i = 0, j = 0; i < count; ++i, j += 6) {
			if (version >= 1.2) {
				tvertices[j + 0] = fp.readUByte() / 255;
				tvertices[j + 1] = fp.readUByte() / 255;
				tvertices[j + 2] = fp.readUByte() / 255;
				tvertices[j + 3] = fp.readUByte() / 255;
			}
			tvertices[j + 4] = fp.readFloat() * 0.98 + 0.01;
			tvertices[j + 5] = fp.readFloat() * 0.98 + 0.01;
		}

		// Read faces
		count = fp.readLong();
		faces = new Array(count);
		for (i = 0; i < count; ++i) {
			faces[i] = {
				vertidx: [fp.readUShort(), fp.readUShort(), fp.readUShort()],
				tvertidx: [fp.readUShort(), fp.readUShort(), fp.readUShort()],
				texid: fp.readUShort(),
				padding: fp.readUShort(),
				twoSide: fp.readLong(),
				smoothGroup: version >= 1.2 ? fp.readLong() : 0
			};
		}

		// Read poskeyframes
		if (version >= 1.5) {
			count = fp.readLong();
			posKeyframes = new Array(count);

			for (i = 0; i < count; ++i) {
				posKeyframes[i] = {
					frame: fp.readLong(),
					px: fp.readFloat(),
					py: fp.readFloat(),
					pz: fp.readFloat()
				};
			}
		}

		// Read rotkeyframes
		count = fp.readLong();
		rotKeyframes = new Array(count);

		for (i = 0; i < count; ++i) {
			rotKeyframes[i] = {
				frame: fp.readLong(),
				q: [fp.readFloat(), fp.readFloat(), fp.readFloat(), fp.readFloat()]
			};
		}

		this.box = new GR2.Box();
		this.matrix = mat4.create();
		this.textures = textures;
		this.vertices = vertices;
		this.tvertices = tvertices;
		this.faces = faces;
		this.rotKeyframes = rotKeyframes;
		this.posKeyframes = posKeyframes;
	};

	/**
	 * Calculate node bounding box
	 *
	 * @param {mat4} _matrix
	 */
	GR2.Node.prototype.calcBoundingBox = function NodeCalcBoundingBox(_matrix) {
		// Define variables
		var i, j, count;
		var v = vec3.create();
		var box = this.box;
		var nodes = this.main.nodes;
		var matrix = mat4.create();
		var vertices = this.vertices;
		var max = Math.max,
			min = Math.min;
		var x, y, z;

		// Find position
		mat4.copy(this.matrix, _matrix);
		mat4.translate(this.matrix, this.matrix, this.pos);

		// Dynamic or static model
		if (!this.rotKeyframes.length) {
			mat4.rotate(this.matrix, this.matrix, this.rotangle, this.rotaxis);
		} else {
			mat4.rotateQuat(this.matrix, this.matrix, this.rotKeyframes[0].q);
		}

		mat4.scale(this.matrix, this.matrix, this.scale);

		// Strat from here just modify a local matrix
		mat4.copy(matrix, this.matrix);

		if (!this.is_only) {
			mat4.translate(matrix, matrix, this.offset);
		}

		mat4.multiply(matrix, matrix, mat3.toMat4(this.mat3));

		for (i = 0, count = vertices.length; i < count; ++i) {
			//mat4.multiplyVec3( matrix, matrix, vertices[i], v );
			x = vertices[i][0];
			y = vertices[i][1];
			z = vertices[i][2];

			v[0] = matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12];
			v[1] = matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13];
			v[2] = matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14];

			for (j = 0; j < 3; j++) {
				box.min[j] = min(v[j], box.min[j]);
				box.max[j] = max(v[j], box.max[j]);
			}
		}

		for (i = 0; i < 3; i++) {
			box.offset[i] = (box.max[i] + box.min[i]) / 2.0;
			box.range[i] = (box.max[i] - box.min[i]) / 2.0;
			box.center[i] = box.min[i] + box.range[i];
		}

		for (i = 0, count = nodes.length; i < count; ++i) {
			if (nodes[i].parentname === this.name && this.name !== this.parentname) {
				nodes[i].calcBoundingBox(this.matrix);
			}
		}
	};

	/**
	 * Compile Node
	 *
	 * @param {mat4} instance_matrix
	 */
	GR2.Node.prototype.compile = function (instance_matrix) {
		var matrix;
		var modelViewMat = mat4.create();
		var normalMat = mat4.create();

		var textures = this.textures;
		var faces = this.faces;
		var vertices = this.vertices;

		var mesh = {};
		var mesh_size = [];

		var vert, face_normal;
		var shadeGroup = new Array(32);
		var shadeGroupUsed = new Array(32);
		var i, x, y, z, count;

		// Calculate matrix
		matrix = mat4.create();
		mat4.identity(matrix);
		mat4.translate(matrix, matrix, [-this.main.box.center[0], -this.main.box.max[1], -this.main.box.center[2]]);
		mat4.multiply(matrix, matrix, this.matrix);

		if (!this.is_only) {
			mat4.translate(matrix, matrix, this.offset);
		}

		mat4.multiply(matrix, matrix, mat3.toMat4(this.mat3));

		// Multiply with instance matrix (position/rotation/...)
		// Generate normal matrix
		mat4.multiply(modelViewMat, instance_matrix, matrix);
		mat4.extractRotation(normalMat, modelViewMat);

		// Generate new vertices
		count = vertices.length;
		vert = new Float32Array(count * 3);
		for (i = 0; i < count; ++i) {
			x = vertices[i][0];
			y = vertices[i][1];
			z = vertices[i][2];

			//(vec3)vert = (mat4)modelViewMat * (vec3)vertices[i];
			vert[i * 3 + 0] = modelViewMat[0] * x + modelViewMat[4] * y + modelViewMat[8] * z + modelViewMat[12];
			vert[i * 3 + 1] = modelViewMat[1] * x + modelViewMat[5] * y + modelViewMat[9] * z + modelViewMat[13];
			vert[i * 3 + 2] = modelViewMat[2] * x + modelViewMat[6] * y + modelViewMat[10] * z + modelViewMat[14];
		}

		// Generate face normals
		face_normal = new Float32Array(faces.length * 3);

		// Setup mesh slot array
		for (i = 0, count = textures.length; i < count; ++i) {
			mesh_size[textures[i]] = 0;
		}

		// Find mesh max face
		for (i = 0, count = faces.length; i < count; ++i) {
			mesh_size[textures[faces[i].texid]]++;
		}

		// Initialize buffer
		for (i = 0, count = textures.length; i < count; ++i) {
			mesh[textures[i]] = new Float32Array(mesh_size[textures[i]] * 9 * 3);
		}

		switch (this.main.shadeType) {
			default:

			case GR2.SHADING.NONE:
				this.calcNormal_NONE(face_normal);
				this.generate_mesh_FLAT(vert, face_normal, mesh);
				break;

			case GR2.SHADING.FLAT:
				this.calcNormal_FLAT(face_normal, normalMat, shadeGroupUsed);
				this.generate_mesh_FLAT(vert, face_normal, mesh);
				break;

			case GR2.SHADING.SMOOTH:
				this.calcNormal_FLAT(face_normal, normalMat, shadeGroupUsed);
				this.calcNormal_SMOOTH(face_normal, shadeGroupUsed, shadeGroup);
				this.generate_mesh_SMOOTH(vert, shadeGroup, mesh);
				break;
		}

		return mesh;
	};

	/**
	 * Generate default normals
	 *
	 * @param {Float32Array[]} out
	 */
	GR2.Node.prototype.calcNormal_NONE = function calcNormalNone(out) {
		var i, count;
		for (i = 1, count = out.length; i < count; i += 3) {
			out[i] = -1;
		}
	};

	/**
	 * Generate FLAT normals
	 *
	 * @param {Float32Array[]} out
	 * @param {mat4} normalMat
	 * @param {Array} groupUsed
	 */
	GR2.Node.prototype.calcNormal_FLAT = function calcNormalFlat(out, normalMat, groupUsed) {
		var i, j, count;
		var face;
		var temp_vec = vec3.create();
		var faces = this.faces;
		var vertices = this.vertices;

		for (i = 0, j = 0, count = faces.length; i < count; ++i, j += 3) {
			face = faces[i];

			vec3.calcNormal(vertices[face.vertidx[0]], vertices[face.vertidx[1]], vertices[face.vertidx[2]], temp_vec);

			// (vec3)out = (mat4)normalMat * (vec3)temp_vec:
			out[j] =
				normalMat[0] * temp_vec[0] + normalMat[4] * temp_vec[1] + normalMat[8] * temp_vec[2] + normalMat[12];
			out[j + 1] =
				normalMat[1] * temp_vec[0] + normalMat[5] * temp_vec[1] + normalMat[9] * temp_vec[2] + normalMat[13];
			out[j + 2] =
				normalMat[2] * temp_vec[0] + normalMat[6] * temp_vec[1] + normalMat[10] * temp_vec[2] + normalMat[14];

			groupUsed[face.smoothGroup] = true;
		}
	};

	/**
	 * Generate smooth normals
	 *
	 * @param {Float32Array[]} normal
	 * @param {Array} groupUsed
	 * @param {Array} group
	 */
	GR2.Node.prototype.calcNormal_SMOOTH = function calcNormalSmooth(normal, groupUsed, group) {
		var i, j, k, l, v, x, y, z, len;
		var size = this.vertices.length;
		var faces = this.faces;
		var face, norm;
		var count = faces.length;

		for (j = 0; j < 32; ++j) {
			// Group not used, skip it
			if (!groupUsed[j]) {
				continue;
			}

			group[j] = new Float32Array(size * 3);
			norm = group[j];

			for (v = 0, l = 0; v < size; ++v, l += 3) {
				x = 0;
				y = 0;
				z = 0;

				for (i = 0, k = 0; i < count; ++i, k += 3) {
					face = faces[i];
					if (
						face.smoothGroup === j &&
						(face.vertidx[0] === v || face.vertidx[1] === v || face.vertidx[2] === v)
					) {
						x += normal[k];
						y += normal[k + 1];
						z += normal[k + 2];
					}
				}

				// (vec3)norm = normalize( vec3(x,y,z) );
				len = 1 / Math.sqrt(x * x + y * y + z * z);
				norm[l] = x * len;
				norm[l + 1] = y * len;
				norm[l + 2] = z * len;
			}
		}
	};

	/**
	 * Generate Mesh (with normals type FLAT)
	 *
	 * @param {Float32Array[]} vert
	 * @param {Float32Array[]} norm
	 * @param {Array} mesh
	 */
	GR2.Node.prototype.generate_mesh_FLAT = function generateMeshFlat(vert, norm, mesh) {
		var a, b, o, i, j, k, t, count;
		var faces = this.faces;
		var textures = this.textures;
		var tver = this.tvertices;
		var alpha = this.main.alpha;
		var offset = [];
		var face, idx, tidx, out;

		// Setup mesh slot array
		for (i = 0, count = textures.length; i < count; ++i) {
			offset[textures[i]] = 0;
		}

		for (i = 0, o = 0, k = 0, count = faces.length; i < count; ++i, k += 3) {
			face = faces[i];
			idx = face.vertidx;
			tidx = face.tvertidx;
			t = textures[face.texid];
			out = mesh[t];
			o = offset[t];

			for (j = 0; j < 3; j++, o += 9) {
				a = idx[j] * 3;
				b = tidx[j] * 6;
				/* vec3 positions  */ out[o + 0] = vert[a + 0];
				out[o + 1] = vert[a + 1];
				out[o + 2] = vert[a + 2];
				/* vec3 normals    */ out[o + 3] = norm[k + 0];
				out[o + 4] = norm[k + 1];
				out[o + 5] = norm[k + 2];
				/* vec2 textCoords */ out[o + 6] = tver[b + 4];
				out[o + 7] = tver[b + 5];
				/* float alpha     */ out[o + 8] = alpha;
			}

			offset[t] = o;
		}
	};

	/**
	 * Generate Mesh (with normals type SMOOTH)
	 *
	 * @param {Float32Array[]} vert
	 * @param {Array} shadeGroup
	 * @param {Array} mesh
	 */
	GR2.Node.prototype.generate_mesh_SMOOTH = function generateMeshSmooth(vert, shadeGroup, mesh) {
		var a, b, o, i, j, t, count;
		var faces = this.faces;
		var textures = this.textures;
		var tver = this.tvertices;
		var alpha = this.main.alpha;
		var offset = [];
		var norm, face, idx, tidx, out;

		// Setup mesh slot array
		for (i = 0, count = textures.length; i < count; ++i) {
			offset[textures[i]] = 0;
		}

		for (i = 0, o = 0, count = faces.length; i < count; ++i) {
			face = faces[i];
			norm = shadeGroup[face.smoothGroup];
			idx = face.vertidx;
			tidx = face.tvertidx;

			t = textures[face.texid];
			out = mesh[t];
			o = offset[t];

			for (j = 0; j < 3; j++, o += 9) {
				a = idx[j] * 3;
				b = tidx[j] * 6;
				/* vec3 positions  */ out[o + 0] = vert[a + 0];
				out[o + 1] = vert[a + 1];
				out[o + 2] = vert[a + 2];
				/* vec3 normals    */ out[o + 3] = norm[a + 0];
				out[o + 4] = norm[a + 1];
				out[o + 5] = norm[a + 2];
				/* vec2 textCoords */ out[o + 6] = tver[b + 4];
				out[o + 7] = tver[b + 5];
				/* float alpha     */ out[o + 8] = alpha;
			}

			offset[t] = o;
		}
	};

	/**
	 * Export
	 */
	return GR2;
});
