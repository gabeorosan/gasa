const kuromoji = require('kuromoji');
const fs = require('fs');

n_songs = 108;



function normalizeSpaces(str) {
    return str.replace(/[\s\u3000]+/g, ' ').trim();
  }

// Configure the Kuromoji tokenizer
kuromoji.builder({ dicPath: 'node_modules/kuromoji/dict' }).build((err, tokenizer) => {
  if (err) throw err;

  // Iterate through the JSON files
  for (let i = 0; i <= n_songs - 1; i++) {
    const path = `../lyrics/jp/${i}.json`;

    fs.readFile(path, 'utf8', (err, data) => {
      if (err) throw err;

      const jsonData = JSON.parse(data);
      const lyricsList = jsonData.lyrics;

      if (lyricsList) {
        const processedLyrics = [];

        // Process each lyric line
        for (let j = 0; j < lyricsList.length; j++) {
          const line = lyricsList[j];
          const tokens = tokenizer.tokenize(line);

          // Extract the surface forms and readings, spaced
          const surfaceForms = tokens.map(token => token.surface_form).join(' ');

          const normalizedSurfaceForms = normalizeSpaces(surfaceForms).replace(/\s+/g, ' ').trim();

          // Add the original line and its hiragana reading as unique items
          processedLyrics.push(normalizedSurfaceForms);
        }

        // Update the JSON data and save back to the file
        jsonData.words = processedLyrics;
        fs.writeFile(path, JSON.stringify(jsonData, null, 2), (err) => {
          if (err) throw err;
          console.log(`File ${path} has been processed and saved.`);
        });
      }
    });
  }
});
