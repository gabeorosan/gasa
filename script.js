var n_songs;  
var n;
var lyricsFile;
var lyrics, currentSentence, words, wordLines
const sentenceElement = document.getElementById("sentence");
const playScreen = document.getElementById("playScreen");

const config = {
  lang: 'jp' // Default language
};

function setPlayerHeight(newHeight) {
  const iframe = player.getIframe();
  iframe.style.height = newHeight + 'px';
}

function changeLanguage(langCode) {
  config.lang = langCode;
  console.log(`Language changed to ${langCode}`);
  newSong();
}

// Attach click event listeners to the buttons
document.querySelectorAll('nav button').forEach(button => {
  button.addEventListener('click', (event) => {
    const langCode = event.target.getAttribute('data-lang');
    changeLanguage(langCode);
  });
});

/*
document.getElementById('title').addEventListener('click', function() {
  var url = "https://www.google.com/search?q=" + encodeURIComponent(this.innerText + ' lyrics');
  window.open(url, '_blank');
});


*/
function replaceRandomOccurrence(str, substring, replacement = '___') {
  const indices = [];
  let index = str.indexOf(substring);
  
  while (index !== -1) {
    indices.push(index);
    index = str.indexOf(substring, index + 1);
  }

  if (indices.length === 0) return str;

  const randomIndex = indices[Math.floor(Math.random() * indices.length)];
  const newText = str.substring(0, randomIndex) + replacement + str.substring(randomIndex + substring.length);

  return { newText, randomIndex };
}

function replacePunctuation(str, replacement) {
  // Regular expression matching Japanese punctuation characters
  const regex = /[.,\/#!$?%\^&\*;:{}="'\-_`~()「」！？！!-\/:-@\\"'[\]-`{-~\u3000-\u303F\uFF00-\uFFEF\u2010\u2013\u2014\u2026\u30FB\u30FC\u3001\u3002\u3008-\u3011\u3014-\u301F\uFF01-\uFF60\uFF61-\uFF65、。〃〈〉《》「」『』【】〔〕〖〗〘〙〚〛〜〝〞〟]/g;
  return str.replace(regex, replacement);
}

function removePunctuation(str) {
  // Regular expression matching Japanese punctuation characters
  const regex = /[.,\/#!$?%\^&\*;:{}="'\-_`~()「」！？！!-\/:-@\\"'[\]-`{-~\u3000-\u303F\uFF00-\uFFEF\u2010\u2013\u2014\u2026\u30FB\u30FC\u3001\u3002\u3008-\u3011\u3014-\u301F\uFF01-\uFF60\uFF61-\uFF65、。〃〈〉《》「」『』【】〔〕〖〗〘〙〚〛〜〝〞〟]/g;

  return str.replace(regex, '');
}

function nextQuestion() {
  if (currentSentence >= lyrics.length - 1) {
    currentSentence = 0;
  } else {
    currentSentence++;
  }

  var sentence = lyrics[currentSentence];
  var sentenceWords = config.lang == 'jp' ? wordLines[currentSentence] : sentence;
  console.log(sentenceWords);
  sentenceWords = replacePunctuation(sentenceWords, ' ').split(/\s+/).filter(word => word.length > 0);
  console.log(sentenceWords);
  
  var blankIndex = Math.floor(Math.random() * sentenceWords.length);
  var blankWord = sentenceWords[blankIndex];
  if (config.lang == 'jp') {
    sentence = removePunctuation(sentence);
    const result = replaceRandomOccurrence(sentence, blankWord);
    sentence = result.newText;
    blankIndex = result.randomIndex;
  } else {
    sentenceWords[blankIndex] = "_____";
    sentence = sentenceWords.join(" ");
  }
    // set the innerText of the sentence element to the new sentence
  sentenceElement.innerText = sentence;
  
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

function replaceOccurrence(str, substring, i, replacement) {
  let occurrenceCount = 0;
  let index = 0;

  while ((index = str.indexOf(substring, index)) !== -1) {
    occurrenceCount++;
    if (occurrenceCount === i) {
      return str.substring(0, index) + replacement + str.substring(index + substring.length);
    }
    index += substring.length; // Move past the current occurrence to find the next one
  }

  return str; // Return original string if the i-th occurrence is not found
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
        sentence = lyrics[currentSentence]
        var newString = "<span style='color:green'>" + corr + "</span>"
        if (config.lang == 'jp') {
          sentenceElement.innerHTML = replaceOccurrence(sentence, corr, corrIndex, newString)
        } else {
        // Replace the blank with the correct answer in green
          sentenceList = replacePunctuation(sentenceWords, ' ').split(/\s+/).filter(word => word.length > 0)
          sentenceList[corrIndex] = newString;
          sentenceElement.innerHTML = sentenceList.join(" ");
        }
      // Disable all options
      var optionsDiv = document.getElementById("options");
      for (var i = 0; i < optionsDiv.children.length; i++) {
        optionsDiv.children[i].onclick = null;
      }
  }

  function createWords() {
    //join together all the lyrics into one big string
    var lyricsText = config.lang == 'jp' ? wordLines.join(' ') : lyrics.join(' ');

    // Split the lyrics text into words, removing any punctuation
    var allWords = replacePunctuation(lyricsText, ' ').split(/\s+/).filter(word => word.length > 0);
  
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

function newSong() {
  if (config.lang == 'zh') {
    n_songs = 126;
  } else if (config.lang == 'jp') {
    n_songs = 108;
  } else {
    n_songs = 234;
  }
  n = Math.floor(Math.random() * n_songs);
  lyricsFile = 'lyrics/' + config.lang + '/' +  n + '.json';
  fetch(lyricsFile)
  .then((response) => response.json())
  .then((data) => {
    lyrics = data.lyrics;
    if (config.lang == 'jp') {
      wordLines = data.words;
    }
    videoId = data.video_id;
    player.loadVideoById(videoId);
    /*
    title = data.title;
    document.getElementById("title").innerText = title;
    */
    currentSentence = -1;
    createWords();
    nextQuestion();
  });
}






