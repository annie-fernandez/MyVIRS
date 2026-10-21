/** The first bytes of each file type, to check an upload is what its extension says. */
export const SIGNATURES = {
  pdf: [[0x25, 0x50, 0x44, 0x46, 0x2d]],
  doc: [[0xd0, 0xcf, 0x11, 0xe0]],
  docx: [[0x50, 0x4b, 0x03, 0x04]],
} satisfies Record<string, number[][]>;
