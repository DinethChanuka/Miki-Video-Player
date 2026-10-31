const fs = require('fs');
const cp = require('child_process');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const srcLogo = path.join(projectRoot, 'public', 'logo.png');
const outIco = path.join(projectRoot, 'src-tauri', 'icons', 'icon.ico');

console.log('[ICO] Generating Windows 3.00 compliant DIB icon resource...');

const sizes = [16, 24, 32, 48, 64, 128];
const tmpDir = path.join(projectRoot, '.tmp_ico');
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

function createDIBEntry(size) {
  const tmpBmp = path.join(tmpDir, `icon_${size}.bmp`);
  cp.execSync(`sips -z ${size} ${size} "${srcLogo}" -s format bmp --out "${tmpBmp}" >/dev/null 2>&1`);
  
  const buf = fs.readFileSync(tmpBmp);
  const pixelOffset = buf.readUInt32LE(10);
  
  // Construct standard 40-byte BITMAPINFOHEADER (3.00 format)
  const dib = Buffer.alloc(40);
  dib.writeUInt32LE(40, 0); // biSize
  dib.writeInt32LE(size, 4); // biWidth
  dib.writeInt32LE(size * 2, 8); // biHeight (XOR image + 1-bit AND mask)
  dib.writeUInt16LE(1, 12); // biPlanes
  dib.writeUInt16LE(32, 14); // biBitCount (32-bit BGRA)
  dib.writeUInt32LE(0, 16); // biCompression (BI_RGB, uncompressed)
  dib.writeUInt32LE(size * size * 4, 20); // biSizeImage
  dib.writeInt32LE(0, 24); // biXPelsPerMeter
  dib.writeInt32LE(0, 28); // biYPelsPerMeter
  dib.writeUInt32LE(0, 32); // biClrUsed
  dib.writeUInt32LE(0, 36); // biClrImportant

  // Extract pixel data
  const pixelData = buf.subarray(pixelOffset, pixelOffset + size * size * 4);
  
  // 1-bit AND mask padded to 32-bit boundary per row
  const rowBytes = Math.ceil(size / 32) * 4;
  const andMask = Buffer.alloc(rowBytes * size, 0);

  const imageBuffer = Buffer.concat([dib, pixelData, andMask]);
  return { size, imageBuffer };
}

const entries = sizes.map(createDIBEntry);

// ICO Header
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // icon resource
header.writeUInt16LE(entries.length, 4); // count

let offset = 6 + entries.length * 16;
const dirEntries = [];
for (const entry of entries) {
  const dir = Buffer.alloc(16);
  dir.writeUInt8(entry.size === 256 ? 0 : entry.size, 0);
  dir.writeUInt8(entry.size === 256 ? 0 : entry.size, 1);
  dir.writeUInt8(0, 2); // color count
  dir.writeUInt8(0, 3); // reserved
  dir.writeUInt16LE(1, 4); // color planes
  dir.writeUInt16LE(32, 6); // bits per pixel
  dir.writeUInt32LE(entry.imageBuffer.length, 8); // image size
  dir.writeUInt32LE(offset, 12); // image offset
  dirEntries.push(dir);
  offset += entry.imageBuffer.length;
}

const ico = Buffer.concat([header, ...dirEntries, ...entries.map(e => e.imageBuffer)]);
fs.writeFileSync(outIco, ico);

// Cleanup tmpDir
fs.rmSync(tmpDir, { recursive: true, force: true });

console.log(`[ICO] Successfully wrote Windows 3.00 format icon to ${outIco} (${ico.length} bytes)`);
