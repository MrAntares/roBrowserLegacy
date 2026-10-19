/**
 * Encode pixel data as SPR RLE.
 * RLE rule: byte 0x00 followed by count means "repeat 0x00 count times".
 * Non-zero bytes are literal.
 */
function encodeRLE(pixelData) {
    const out = [];
    let i = 0;
    while (i < pixelData.length) {
        const c = pixelData[i];
        if (c === 0) {
            // Count consecutive zeros
            let count = 0;
            while (i < pixelData.length && pixelData[i] === 0 && count < 255) {
                count++;
                i++;
            }
            out.push(0, count);
        } else {
            out.push(c);
            i++;
        }
    }
    return new Uint8Array(out);
}


/**
 * Build a synthetic SPR v2.1 binary.
 * Based on real SPR structure: "SP"(2) + minor(1) + major(1) + indexed_count(2) + rgba_count(2)
 * Per indexed RLE frame: width(2) + height(2) + rleSize(2) + rleData
 * Palette: 1024 bytes at end of file.
 *
 * @param {Array<{w:number, h:number, pixels?:Uint8Array}>} frames - frame dimensions and optional pixel data
 */
export function buildMinimalSPR(frames) {
    // Build RLE data for each frame
    const rleFrames = frames.map(f => {
        let pixels;
        if (f.pixels) {
            pixels = f.pixels;
        } else {
            pixels = new Uint8Array(f.w * f.h);
            for (let j = 0; j < pixels.length; j++) {
                pixels[j] = (j % 254) + 1; // non-zero to avoid RLE runs (simple case)
            }
        }
        return { w: f.w, h: f.h, rle: encodeRLE(pixels) };
    });

    // Calculate total size
    let dataSize = 2 + 1 + 1 + 2 + 2; // header
    for (const f of rleFrames) {
        dataSize += 2 + 2 + 2 + f.rle.length; // width + height + rleSize + rleData
    }
    dataSize += 1024; // palette

    const buf = new ArrayBuffer(dataSize);
    const view = new DataView(buf);
    const bytes = new Uint8Array(buf);
    let off = 0;

    // "SP"
    view.setUint8(off++, 0x53); // 'S'
    view.setUint8(off++, 0x50); // 'P'
    view.setUint8(off++, 1);    // minor: version = 1/10 + 2 = 2.1
    view.setUint8(off++, 2);    // major
    view.setUint16(off, frames.length, true); off += 2; // indexed_count
    view.setUint16(off, 0, true); off += 2;             // rgba_count (v > 1.1)

    // Write RLE frames
    for (const f of rleFrames) {
        view.setUint16(off, f.w, true); off += 2;
        view.setUint16(off, f.h, true); off += 2;
        view.setUint16(off, f.rle.length, true); off += 2;
        bytes.set(f.rle, off); off += f.rle.length;
    }

    // Palette at end (256 RGBA entries = 1024 bytes)
    for (let i = 0; i < 256; i++) {
        bytes[dataSize - 1024 + i * 4 + 0] = i;       // R
        bytes[dataSize - 1024 + i * 4 + 1] = 255 - i;  // G
        bytes[dataSize - 1024 + i * 4 + 2] = 128;       // B
        bytes[dataSize - 1024 + i * 4 + 3] = 255;       // A
    }

    return buf;
}