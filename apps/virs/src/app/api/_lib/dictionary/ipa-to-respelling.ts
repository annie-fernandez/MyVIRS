// Turns Wiktionary's American IPA into a respelling a K-12 reader can sound out, in the style of
// Wikipedia's pronunciation respelling key: /ˈfoʊ.təˌɡɹæf/ → FOH-tuh-graf. The stressed syllable is in
// capitals. Anything it doesn't recognize returns null, so a wrong respelling is never shown.

// Longest first. The vowel+ɚ pairs are how Wiktionary writes some r-sounds: sphere /sfɪɚ/, fire /faɪɚ/.
const MULTI = ["aɪɚ", "aʊɚ", "ɪɚ", "ɛɚ", "ʊɚ", "ɔɚ", "ɑɚ", "tʃ", "dʒ", "eɪ", "aɪ", "aʊ", "oʊ", "əʊ", "ɔɪ"];
const CONSONANTS = new Set(["p", "b", "t", "d", "k", "ɡ", "f", "v", "θ", "ð", "s", "z", "ʃ", "ʒ", "h", "m", "n", "ŋ", "l", "ɹ", "w", "j", "ʍ", "x", "ɾ", "ʔ", "tʃ", "dʒ"]);
const VOWELS = new Set(["i", "ɪ", "e", "ɛ", "æ", "a", "ɑ", "ɔ", "o", "ʊ", "u", "ʌ", "ə", "ɚ", "ɝ", "eɪ", "aɪ", "aʊ", "oʊ", "əʊ", "ɔɪ", "aɪɚ", "aʊɚ", "ɪɚ", "ɛɚ", "ʊɚ", "ɔɚ", "ɑɚ"]);
// Lax vowels can't end a stressed syllable in English, so they take the next consonant (a-NAL, not A-nal).
const LAX = new Set(["ɪ", "ɛ", "æ", "ʊ", "ʌ"]);
// Consonant clusters English allows at the start of a syllable (maximal onset).
const ONSETS = new Set(
  "pl pɹ pj bl bɹ bj tɹ tw tj dɹ dw dj kl kɹ kw kj ɡl ɡɹ ɡw ɡj fl fɹ fj vj θɹ θw ʃɹ sp st sk sm sn sl sw sf mj nj hj lj spl spɹ spj stɹ skɹ skw skl skj"
    .split(" "),
);

const CONSONANT_SPELLING: Record<string, string> = {
  ɡ: "g", θ: "th", ð: "th", ʃ: "sh", ʒ: "zh", ŋ: "ng", ɹ: "r", j: "y", ʍ: "wh", x: "kh", ɾ: "d", ʔ: "t", tʃ: "ch", dʒ: "j",
};
const VOWEL_SPELLING: Record<string, [open: string, closed: string]> = {
  i: ["ee", "ee"], ɪ: ["ih", "i"], e: ["eh", "e"], ɛ: ["eh", "e"], æ: ["a", "a"], a: ["ah", "ah"], ɑ: ["ah", "ah"], ɔ: ["aw", "aw"],
  o: ["oh", "oh"], oʊ: ["oh", "oh"], əʊ: ["oh", "oh"], ʊ: ["uu", "uu"], u: ["oo", "oo"], ʌ: ["uh", "u"], ə: ["uh", "uh"],
  ɚ: ["er", "er"], ɝ: ["ur", "ur"], eɪ: ["ay", "ay"], aʊ: ["ow", "ow"], ɔɪ: ["oy", "oy"], aɪ: ["eye", "eye"],
  aɪɚ: ["ire", "ire"], aʊɚ: ["our", "our"], ɪɚ: ["eer", "eer"], ɛɚ: ["air", "air"], ʊɚ: ["oor", "oor"], ɔɚ: ["or", "or"], ɑɚ: ["ar", "ar"],
};
// A vowel followed by r in the same syllable is spelled as one sound: car, more, air, here, tour.
const R_COLORED: Record<string, string> = {
  ɑ: "ar", a: "ar", æ: "arr", ɔ: "or", o: "or", oʊ: "or", ɛ: "air", e: "air", eɪ: "air", ɪ: "eer", i: "eer", ʊ: "oor", u: "oor",
  ʌ: "ur", ə: "er", aɪ: "ire", aʊ: "our",
};

type Stress = "primary" | "secondary" | null;
interface Phone {
  sound: string;
  /** A consonant acting as the vowel of its syllable, like the n in button /ˈbʌʔn̩/. */
  syllabic?: boolean;
}
interface Syllable {
  onset: Phone[];
  nucleus: Phone;
  coda: Phone[];
  stress: Stress;
}

const isNucleus = (phone: Phone) => phone.syllabic || VOWELS.has(phone.sound);

function normalize(ipa: string): string {
  return ipa
    .replace(/^[/[]|[/\]]$/g, "")
    .replace(/[()]/g, "")
    .replace(/[ːˑ͜͡]/g, "")
    .replace(/g/g, "ɡ")
    .replace(/r/g, "ɹ")
    .replace(/ɫ/g, "l")
    .replace(/ɐ/g, "ə")
    .replace(/ᵻ/g, "ɪ")
    .replace(/ᵿ/g, "ʊ")
    .replace(/ɒ/g, "ɑ")
    .replace(/ɜ/g, "ɝ");
}

/** Phones and syllable marks ("." "ˈ" "ˌ"), or null at the first symbol it doesn't know. */
function tokenize(ipa: string): (Phone | string)[] | null {
  const tokens: (Phone | string)[] = [];
  let i = 0;
  while (i < ipa.length) {
    const char = ipa[i]!;
    if (char === "." || char === "ˈ" || char === "ˌ") {
      tokens.push(char);
      i += 1;
      continue;
    }
    // Syllabic mark under the previous consonant (n̩, l̩).
    if (char === "̩" || char === "̍") {
      const previous = tokens.at(-1);
      if (typeof previous !== "object" || !CONSONANTS.has(previous.sound)) return null;
      previous.syllabic = true;
      i += 1;
      continue;
    }
    // Other combining marks (dental, aspiration, nasalization…) don't change the respelling.
    if (/[̀-ͯʰ-˿]/.test(char)) {
      i += 1;
      continue;
    }
    const multi = MULTI.find((sound) => ipa.startsWith(sound, i));
    const sound = multi ?? char;
    if (!CONSONANTS.has(sound) && !VOWELS.has(sound)) return null;
    tokens.push({ sound });
    i += sound.length;
  }
  return tokens;
}

/** Splits phones between two vowels by maximal onset: as many as can start the next syllable. */
function splitCluster(cluster: Phone[]): [coda: Phone[], onset: Phone[]] {
  for (let start = 0; start < cluster.length; start++) {
    const onset = cluster.slice(start);
    const sounds = onset.map((phone) => phone.sound);
    const legal = sounds.length === 1 ? sounds[0] !== "ŋ" : ONSETS.has(sounds.join(""));
    if (legal) return [cluster.slice(0, start), onset];
  }
  return [cluster, []];
}

/** Syllables from Wiktionary's own breaks and stress marks, split further wherever it left them out. */
function syllabify(tokens: (Phone | string)[]): Syllable[] | null {
  const chunks: { phones: Phone[]; stress: Stress }[] = [{ phones: [], stress: null }];
  for (const token of tokens) {
    if (typeof token === "string") {
      const stress: Stress = token === "ˈ" ? "primary" : token === "ˌ" ? "secondary" : null;
      if (chunks.at(-1)!.phones.length) chunks.push({ phones: [], stress });
      else chunks.at(-1)!.stress = stress ?? chunks.at(-1)!.stress;
    } else chunks.at(-1)!.phones.push(token);
  }

  const syllables: Syllable[] = [];
  for (const chunk of chunks) {
    const nuclei = chunk.phones.flatMap((phone, index) => (isNucleus(phone) ? [index] : []));
    if (!nuclei.length) {
      // Stray consonants with no vowel belong to the end of the syllable before.
      if (!syllables.length) return null;
      syllables.at(-1)!.coda.push(...chunk.phones);
      continue;
    }
    let onsetStart = 0;
    nuclei.forEach((nucleusIndex, n) => {
      const next = nuclei[n + 1];
      const between = next === undefined ? chunk.phones.slice(nucleusIndex + 1) : chunk.phones.slice(nucleusIndex + 1, next);
      const [coda] = next === undefined ? [between] : splitCluster(between);
      syllables.push({
        onset: chunk.phones.slice(onsetStart, nucleusIndex),
        nucleus: chunk.phones[nucleusIndex]!,
        coda,
        // The stress mark comes before its syllable, so it belongs to the chunk's first one.
        stress: n === 0 ? chunk.stress : null,
      });
      onsetStart = nucleusIndex + 1 + coda.length;
    });
  }

  // A stressed lax vowel takes the next consonant: /əˈnælɪsɪs/ → uh-NAL-ih-sis, not uh-NA-lih-sis.
  syllables.forEach((syllable, index) => {
    const next = syllables[index + 1];
    if (syllable.stress && LAX.has(syllable.nucleus.sound) && !syllable.coda.length && next?.onset.length) {
      syllable.coda.push(next.onset.shift()!);
    }
  });
  return syllables;
}

function spellConsonant(phone: Phone): string {
  return CONSONANT_SPELLING[phone.sound] ?? phone.sound;
}

function spellSyllable(syllable: Syllable): string {
  const onset = syllable.onset.map(spellConsonant).join("");
  const coda = [...syllable.coda];
  let vowel: string;
  if (syllable.nucleus.syllabic) vowel = spellConsonant(syllable.nucleus);
  else if (coda[0]?.sound === "ɹ" && R_COLORED[syllable.nucleus.sound]) {
    coda.shift();
    vowel = R_COLORED[syllable.nucleus.sound]!;
  } else {
    const [open, closed] = VOWEL_SPELLING[syllable.nucleus.sound]!;
    vowel = coda.length ? closed : open;
    // "eye" on its own, "y" after a consonant: EYE-dee-uh, but VY-ruhs.
    if (syllable.nucleus.sound === "aɪ" && onset) vowel = "y";
  }
  return onset + vowel + coda.map(spellConsonant).join("");
}

/** FOH-tuh-graf for /ˈfoʊ.təˌɡɹæf/; null when the transcription has anything it can't read. */
export function ipaToRespelling(ipa: string): string | null {
  const tokens = tokenize(normalize(ipa.trim()));
  const syllables = tokens && syllabify(tokens);
  if (!syllables?.length) return null;
  const parts = syllables.map(spellSyllable);
  if (parts.length === 1) return parts[0]!;
  return parts.map((part, index) => (syllables[index]!.stress === "primary" ? part.toUpperCase() : part)).join("-");
}
