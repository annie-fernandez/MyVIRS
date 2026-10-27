/**
 * Says a word in the browser's own American English voice, for words with no recording; stops
 * anything already being said. Prefers a voice installed on the device: with Chrome's default
 * online voice, a slower rate made no audible difference.
 */
export function speakWord(word: string, slow: boolean, onEnd: () => void) {
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = "en-US";
  const american = synth.getVoices().filter((voice) => voice.lang.replace("_", "-") === "en-US");
  utterance.voice = american.find((voice) => voice.localService) ?? american[0] ?? null;
  utterance.rate = slow ? 0.5 : 0.9;
  utterance.onend = onEnd;
  utterance.onerror = onEnd;
  synth.speak(utterance);
}
