import { Hashes, Items, SaveType, Versions } from "./data";

export const getSaveType = (
  buffer: ArrayBufferLike
): {
  type: SaveType;
  version: string;
} => {
  const header = new Uint8Array(buffer).slice(0, 4);
  const dv = new DataView(header.buffer);
  const getBytes = () => [dv.getUint16(0), dv.getUint16(2)];

  let [leftBytes, rightBytes] = getBytes();

  if (leftBytes === 0 && rightBytes in Versions) {
    return { type: SaveType.WiiU, version: Versions[rightBytes] };
  }

  header.reverse();
  [leftBytes, rightBytes] = getBytes();

  if (leftBytes === 0 && rightBytes in Versions) {
    return { type: SaveType.Switch, version: Versions[rightBytes] };
  }

  throw new TypeError("Provided input is not a BotW .sav file");
};

function* getBytes(
  buffer: ArrayBufferLike,
  step = 4
): Generator<[number, Uint8Array]> {
  let position = 0;
  const bytes = new Uint8Array(buffer);
  while (position < buffer.byteLength) {
    const slice = bytes.slice(position, position + step);
    yield [position, slice];
    position += step;
  }
}

export const convertSaveFile = (
  buffer: ArrayBufferLike,
  trackblock = false
): ArrayBufferLike => {
  const converted = new ArrayBuffer(buffer.byteLength);
  const convertedDataView = new DataView(converted);
  const textDecoder = new TextDecoder("utf-8");

  const write = (dv: DataView, position: number) => {
    convertedDataView.setUint32(position, dv.getUint32(0));
  };

  const reverseAndWrite = (
    dv: DataView,
    position: number,
    data: Uint8Array
  ) => {
    data.reverse();
    write(dv, position);
  };

  let dontReverseNext = trackblock;
  const reverseQueue: boolean[] = [];

  for (const [position, data] of getBytes(buffer)) {
    const dv = new DataView(data.buffer);

    // This block is used to write items data using the reverseQueue array
    if (reverseQueue.length > 0) {
      const dontReverse = reverseQueue.pop();
      if (dontReverse) {
        write(dv, position);
      } else {
        reverseAndWrite(dv, position, data);
      }
      continue;
    }

    // Specific logic for trackblock files
    if (trackblock && position === 4) {
      const reversed = new Uint8Array([
        dv.getUint8(1),
        dv.getUint8(0),
        dv.getUint8(3),
        dv.getUint8(2),
      ]);
      const reversedDv = new DataView(reversed.buffer);
      write(reversedDv, position);
      continue;
    }

    const dataUint32 = dv.getUint32(0);

    // Conditional used when this 4 bytes shouldn't be reversed
    if (dontReverseNext) {
      dontReverseNext = false;
      write(dv, position);
      continue;
    }

    // When a specific hash is found, the next 4 bytes are written as is
    if (Hashes.includes(dataUint32)) {
      reverseAndWrite(dv, position, data);
      dontReverseNext = true;
      continue;
    }

    const str = textDecoder.decode(data);

    if (!Items.includes(str)) {
      reverseAndWrite(dv, position, data);
      continue;
    } else {
      // When an item is found, the next data blocks should be treated specially using the reverse queue
      write(dv, position);
      reverseQueue.push(...Array.from({ length: 16 }, (_, i) => i % 2 === 0));
    }
  }

  return converted;
};

export const getPrettySaveType = (type: SaveType) => {
  switch (type) {
    case SaveType.WiiU:
      return "Wii U";
    case SaveType.Switch: {
      return "Switch";
    }
    default:
      return "Unknown";
  }
};
