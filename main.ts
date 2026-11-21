// news-image-20261121 — deliver Saturday's front page.
//
// The finished front page for Saturday 21 November 2026 already sits in
// this repository at asset/entry.png: a newspaper page drawn for this day
// alone. This program does nothing but place that finished image at
// <output>/entry.png, after proving it fits the competition's limits.
// It reaches for no network, reads no clock and rolls no dice, so a
// second run writes exactly the same bytes as the first.
//
// Run it locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const BYTE_CAP = 1024 * 1024; // the image must stay under 1 MiB
const SIDE_CAP = 1024; // and under 1024 pixels on either side

const repoRoot = new URL(".", import.meta.url).pathname;
const bundledImage = join(repoRoot, "asset", "entry.png");

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const destination = join(outDir, "entry.png");

function reject(message: string): never {
  throw new Error(message);
}

// Width and height of a PNG come from its IHDR chunk, which sits at a
// fixed offset right after the 8-byte signature.
function pngDimensions(bytes: Buffer): [number, number] {
  if (bytes.length < 33) {
    reject("asset/entry.png is too short to hold a PNG header");
  }
  if (bytes.subarray(12, 16).toString("ascii") !== "IHDR") {
    reject("asset/entry.png has no IHDR chunk after its signature");
  }
  return [bytes.readUInt32BE(16), bytes.readUInt32BE(20)];
}

// Width and height of a JPEG hide in its first frame header (SOF0, SOF1
// or SOF2). Walk the marker segments until one shows up; every segment
// carries its own length, so the walk stays inside the file.
function jpegDimensions(bytes: Buffer): [number, number] {
  let cursor = 2; // past the SOI marker (FF D8)
  while (cursor + 9 < bytes.length) {
    if (bytes[cursor] !== 0xff) {
      reject("asset/entry.png has a broken JPEG marker stream");
    }
    const marker = bytes[cursor + 1];
    // Standalone markers carry no length field; skip them one byte at a
    // time instead of reading a length that is not there.
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd9)) {
      cursor += 2;
      continue;
    }
    const segmentLength = bytes.readUInt16BE(cursor + 2);
    if (segmentLength < 2 || cursor + segmentLength > bytes.length) {
      reject("asset/entry.png has a JPEG segment running past the file");
    }
    if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
      const height = bytes.readUInt16BE(cursor + 5);
      const width = bytes.readUInt16BE(cursor + 7);
      return [width, height];
    }
    cursor += 2 + segmentLength;
  }
  reject("asset/entry.png has no JPEG frame header");
}

// The gate tells PNG and JPEG apart by their first bytes, and the file
// keeps the name entry.png either way, so accept both and check the one
// we actually hold: a whole file, dimensions inside the cap. Returns the
// dimensions plus which format was found, so the run log names it.
function checkImage(bytes: Buffer): [number, number, string] {
  if (bytes.length === 0) {
    reject("asset/entry.png is empty");
  }
  if (bytes.length > BYTE_CAP) {
    reject(
      `asset/entry.png is ${bytes.length} bytes, above the 1 MiB cap`,
    );
  }
  const pngMagic = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  ]);
  const jpegMagic = Buffer.from([0xff, 0xd8, 0xff]);
  if (bytes.subarray(0, 8).equals(pngMagic)) {
    const tail = bytes.subarray(bytes.length - 12);
    if (
      tail.readUInt32BE(0) !== 0 ||
      tail.subarray(4, 8).toString("ascii") !== "IEND"
    ) {
      reject("asset/entry.png is missing its IEND trailer");
    }
    return [...pngDimensions(bytes), "PNG"];
  }
  if (bytes.subarray(0, 3).equals(jpegMagic)) {
    if (bytes[bytes.length - 2] !== 0xff || bytes[bytes.length - 1] !== 0xd9) {
      reject("asset/entry.png is missing its JPEG end marker");
    }
    return [...jpegDimensions(bytes), "JPEG"];
  }
  reject("asset/entry.png is neither a PNG nor a JPEG");
}

const image = readFileSync(bundledImage);
const [width, height, format] = checkImage(image);
if (width > SIDE_CAP || height > SIDE_CAP) {
  reject(
    `asset/entry.png is ${width}x${height}, above the 1024x1024 cap`,
  );
}

// The grader mounts the output directory, so create it only when it is
// missing and never delete anything that is already there.
if (!existsSync(outDir)) {
  mkdirSync(outDir, { recursive: true });
}
copyFileSync(bundledImage, destination);

// Read the copy back: the run only counts if the file on disk is the
// exact image this program checked a moment ago.
const written = readFileSync(destination);
if (!written.equals(image)) {
  reject("the copy at entry.png differs from asset/entry.png");
}
console.log(
  `wrote ${destination} (${format} ${width}x${height}, ${image.length} bytes)`,
);
