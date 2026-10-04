// Reads an uploaded photo in the browser and posts only the text to /api/analyze/text.
// Returns the legacy result shape the Angular results pages already understand.
(function () {
  function legacyCategory(category) {
    if (!category) return "";
    return category.charAt(0) === "k" ? category.toUpperCase() : category;
  }

  function breakdown(source, total) {
    return {
      stem: source.stem,
      awl: source.awl,
      hi: source.hi,
      med: source.med,
      low: source.low,
      noCategory: source.offList,
      k1: source.k1,
      k2: source.k2,
      k3: source.k3,
      total: total,
    };
  }

  function toLegacyText(result) {
    var counts = result.statistics.wordCount;
    var percents = result.statistics.wordPercentage;
    return {
      words: result.words.map(function (word) {
        return {
          value: word.value || "",
          category: legacyCategory(word.category),
          initialValue: word.initialValue,
        };
      }),
      fleschReadingScore: result.fleschReadingScore,
      sentenceCount: result.sentenceCount,
      statistics: {
        wordCount: breakdown(counts, counts.total),
        wordPercentage: breakdown(percents, counts.total === 0 ? 0 : 1),
      },
    };
  }

  function readImage(file) {
    if (!window.Tesseract || !window.Tesseract.recognize) {
      return Promise.reject(new Error("tesseract missing"));
    }
    return window.Tesseract.recognize(file, "eng").then(function (result) {
      var extracted = result && result.data && result.data.text ? String(result.data.text).trim() : "";
      if (!extracted) throw new Error("empty");
      return fetch("/api/analyze/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: extracted }),
      }).then(function (response) {
        if (!response.ok) throw new Error("analyze failed");
        return response.json();
      }).then(toLegacyText);
    });
  }

  window.virsReadImage = readImage;
})();
