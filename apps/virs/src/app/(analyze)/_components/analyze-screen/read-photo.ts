/** Reads the text in a photo with tesseract.js, in the browser, reporting progress from 0 to 1. */
export async function readPhoto(file: File, onProgress: (fraction: number) => void): Promise<string> {
  const { recognize } = await import("tesseract.js");
  const result = await recognize(file, "eng", {
    logger: (message) => {
      if (message.status === "recognizing text") onProgress(message.progress);
    },
  });
  return result.data.text.trim();
}
