var n_songs = 220;
var n;
var lyricsFile;
var lyrics, pinyin, currentSentence, words
var sentenceElement = document.getElementById("sentence");
var pinyinElement = document.getElementById("pinyin");

const katakanaToHiragana = (str) => {
  return str.replace(/[\u30A1-\u30F6]/g, (match) => {
    const chr = match.charCodeAt(0) - 0x60;
    return String.fromCharCode(chr);
  });
};

const processLyrics = (lyrics, callback) => {
  const dicPath = "bower_components/kuromoji/dict";
  const tokenizedLines = [];
  const furiganaLines = [];

  kuromoji.builder({ dicPath: dicPath }).build((err, tokenizer) => {
    if (err) {
      console.error(err);
      return;
    }

    lyrics.forEach((line) => {
      const tokens = tokenizer.tokenize(line);
      let tokenizedString = "";
      let furiganaString = "";

      tokens.forEach((token) => {
        tokenizedString += token.surface_form + " ";
        if (token.reading) {
          furiganaString += katakanaToHiragana(token.reading) + " ";
        } else {
          furiganaString += token.surface_form + " ";
        }
      });

      tokenizedLines.push(tokenizedString.trim());
      furiganaLines.push(furiganaString.trim());
    });

    callback(tokenizedLines, furiganaLines);
  });
};




const tokenizeAndFurigana = (text, callback) => {
    const dicPath = "bower_components/kuromoji/dict";
  
    kuromoji.builder({ dicPath: dicPath }).build((err, tokenizer) => {
      if (err) {
        console.error(err);
        return;
      }
  
      // Tokenize the text
      const tokens = tokenizer.tokenize(text);
  
      // Create tokenized string and furigana
      let tokenizedString = "";
      let furiganaString = "";
  
      tokens.forEach((token) => {
        tokenizedString += token.surface_form + " ";
        if (token.reading) {
          furiganaString += token.reading + " ";
        } else {
          furiganaString += token.surface_form + " ";
        }
      });
  
      // Remove trailing spaces
      tokenizedString = tokenizedString.trim();
      furiganaString = furiganaString.trim();
  
      // Callback with tokenized string and furigana
      callback(tokenizedString, furiganaString);
    });
  };





document.getElementById('title').addEventListener('click', function() {
    var url = "https://www.google.com/search?q=" + encodeURIComponent(this.innerText + ' lyrics');
    window.open(url, '_blank');
  });

var n;
var lyricsFile;
var lyrics, pinyin, currentSentence, words
var sentenceElement = document.getElementById("sentence");
var pinyinElement = document.getElementById("pinyin");

document.getElementById('title').addEventListener('click', function() {
    var url = "https://www.google.com/search?q=" + encodeURIComponent(this.innerText + ' lyrics');
    window.open(url, '_blank');
    });

function nextQuestion() {
  if (currentSentence >= lyrics.length - 1) {
    currentSentence = 0;
  } else {
    currentSentence++;
  }
  var sentence = lyrics[currentSentence];
  pinyinLine = pinyin[currentSentence];
  var sentenceWords = sentence.split(" ");
  pinWords = pinyinLine.split(" ");
  //remove punctuation
  sentenceWords = sentenceWords.map(word => removePunctuation(word));
  pinyinWords = pinWords.map(word => removePunctuation(word));

  var blankIndex = Math.floor(Math.random() * sentenceWords.length);
  var blankWord = sentenceWords[blankIndex];
  sentenceWords[blankIndex] = "_____";
  pinyinWords[blankIndex] = "_____";
  sentence = sentenceWords.join(" ");
    pinyinLine = pinyinWords.join(" ");

  // set the innerText of the sentence element to the new sentence
  sentenceElement.innerText = sentence;
  pinyinElement.innerText = pinyinLine;

  var wordsCopy = words.slice();
  
  // Create options
  var options = [blankWord];
  while (options.length < 4) {
    var randomWord = wordsCopy.splice(Math.floor(Math.random() * wordsCopy.length), 1)[0];
    if (options.indexOf(randomWord) === -1) options.push(randomWord);
  }
  options.sort(() => Math.random() - 0.5);

  // Display options
  var optionsDiv = document.getElementById("options");
  optionsDiv.innerHTML = "";
  options.forEach((option, index) => {
    var optionDiv = document.createElement("div");
    if (option === blankWord) { optionDiv.id = "correct"; }
    optionDiv.className = "option";
    optionDiv.innerText = option;
    optionDiv.onclick = function () { checkAnswer(option, blankWord, blankIndex, optionDiv); };
    optionsDiv.appendChild(optionDiv);
  });

  
  document.getElementById("progress").innerText = (currentSentence + 1) + "/" + lyrics.length;
}

function previousQuestion() {
  currentSentence = currentSentence === 0 ? lyrics.length - 2 : currentSentence - 2;
  nextQuestion();
}

function checkAnswer(selected, correct, corrIndex, optionDiv) {

    if (selected === correct) {
        optionDiv.style.backgroundColor = "#44b445";
      } else {
        optionDiv.style.backgroundColor = "red";
        // Highlight the correct answer
        document.getElementById("correct").style.backgroundColor = "#44b445";
      }
        var corr = document.getElementById("correct").innerHTML
  
        // Replace the blank with the correct answer in green
        sentence = lyrics[currentSentence]
        sentenceList = sentence.split(" ")
        sentenceList[corrIndex] = "<span style='color:green'>" + corr + "</span>";
        sentenceElement.innerHTML = sentenceList.join(" ")
        pinyinLine = pinyin[currentSentence]
        pinyinList = pinyinLine.split(" ")
        pinyinList[corrIndex] = "<span style='color:green'>" + pinyinList[corrIndex] + "</span>";
        pinyinElement.innerHTML = pinyinList.join(" ")
      // Disable all options
      var optionsDiv = document.getElementById("options");
      for (var i = 0; i < optionsDiv.children.length; i++) {
        optionsDiv.children[i].onclick = null;
      }
  }

  function createWords() {
    //join together all the lyrics into one big string
    var lyricsText = lyrics.join(' ');

    // Split the lyrics text into words, removing any punctuation
    var allWords = removePunctuation(lyricsText).replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '').split(/\s+/);
    // Create a Set to store unique words
    var uniqueWords = new Set(allWords);
  
    // Convert the Set to an array and store it in a global variable
    words = Array.from(uniqueWords);
  }

var player;

function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '360',
    width: '640',
    events: {
      'onReady': onPlayerReady
    }
  });
}

function onPlayerReady() {
  newSong()
}

function removePunctuation(str) {
    // Regular expression matching Japanese punctuation characters
    const regex = /[!-\/:-@\[-`{-~\u3000-\u303F\uFF00-\uFFEF\u2010\u2013\u2014\u2026\u30FB\u30FC\u3001\u3002]/g;
    // Replace matching characters with an empty string
    return str.replace(regex, '');
  }

function newSong() {
  n = Math.floor(Math.random() * n_songs);
  lyricsFile = 'jp/' + n + '.json';
  fetch(lyricsFile)
  .then((response) => response.json())
  .then((data) => {
    processLyrics(data.lyrics, (tokenized, furigana) => {
        lyrics = tokenized;
        pinyin = furigana;
        videoId = data.video_id;
        title = data.title;
        videoId = data.video_id;
        player.loadVideoById(videoId);
        document.getElementById("title").innerText = title;
        currentSentence = -1;
        createWords();
        nextQuestion();
      });
  });
}





