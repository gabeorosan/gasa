self.addEventListener('fetch', (event) => {
    if (event.request.url.includes('kuromoji.min.js')) {
      event.respondWith(
        (async function() {
          const preloadResponse = await event.preloadResponse;
          if (preloadResponse) {
            return preloadResponse;
          }
  
          // If preloadResponse is not available, fetch the request manually
          return fetch(event.request);
        })()
      );
    }
  });
  
  self.addEventListener('message', (event) => {
    if (event.data.action === 'tokenize') {
      const text = event.data.text;
  
      importScripts('https://cdn.jsdelivr.net/npm/kuromoji@0.1.2/src/kuromoji.min.js');
  
      kuromoji.builder({ dicPath: 'https://cdn.jsdelivr.net/npm/kuromoji@0.1.2/src/kuromoji.min.js' }).build(function(err, tokenizer) {
        if (err) {
          console.error(err);
          return;
        }
  
        // Tokenize the text
        var tokens = tokenizer.tokenize(text);
  
        // Generate furigana
        var result_with_furigana = tokens.map(function(token) {
          var reading = token.reading || token.surface_form;
          var furigana = reading.replace(/[\u30A1-\u30F6]/g, function(match) {
            return String.fromCharCode(match.charCodeAt(0) - 0x60);
          });
          return token.surface_form + '(' + furigana + ')';
        }).join(' ');
  
        console.log(result_with_furigana); // Output with furigana
      });
    }
  });
  