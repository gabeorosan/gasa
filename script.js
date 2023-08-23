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
function replaceIthOccurrence(str, oldSubstring, i, newSubstring) {
  // print out the string, the substring to replace, the index of the occurrence to replace, and the new substring
  let occurrenceCount = 0;
  let index = 0;
  while ((index = str.indexOf(oldSubstring, index)) !== -1) {
    if (occurrenceCount === i) {
      return str.substring(0, index) + newSubstring + str.substring(index + oldSubstring.length);
    }
    occurrenceCount++;
    index += oldSubstring.length;
  }

  return str; // Return original string if the i-th occurrence is not found
}

function replaceRandomOccurrence(str, substring, replacement = '___') {
  const indices = [];
  let index = str.indexOf(substring);
  
  while (index !== -1) {
    indices.push(index);
    index = str.indexOf(substring, index + 1);
  }

  if (indices.length === 0) return str;

  var iblank = Math.floor(Math.random() * indices.length)
  const randomIndex = indices[iblank];
  const newText = str.substring(0, randomIndex) + replacement + str.substring(randomIndex + substring.length);

  return { newText, iblank };
}


function replacePunctuation(str, replacement) {
  const regex = /[.,\/#!$?%\^&\*;:{}="'\-\u201C\u201D_`~()「」！？！!-\/:-@\\"'[\]-`{-~\u3000-\u303F\uFF00-\uFFEF\u2010\u2013\u2014\u2026\u30FB\u3001\u3002\u3008-\u3011\u3014-\u301F\uFF01-\uFF60\uFF61-\uFF65、。〃〈〉《》「」『』【】〔〕〖〗〘〙〚〛〜〝〞〟]/g;
  return str.replace(regex, replacement);
}

function nextQuestion() {
  if (currentSentence >= lyrics.length - 1) {
    currentSentence = 0;
  } else {
    currentSentence++;
  }

  var sentence = lyrics[currentSentence];
  var sentenceLine = config.lang == 'ko' ? sentence : wordLines[currentSentence];
  var sentenceWords = replacePunctuation(sentenceLine, ' ').split(/\s+/).filter(word => containsOnlyCJK(word));
  var blankIndex = Math.floor(Math.random() * sentenceWords.length);
  var blankWord = sentenceWords[blankIndex];
  const result = replaceRandomOccurrence(sentence, blankWord);
  sentence = result.newText;
  blankIndex = result.iblank;
  sentenceElement.innerHTML = sentence;
  
  var wordsCopy = words.slice();
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

function replaceIndex(str, index, oldSubstring, newSubstring) {
  // Check if the substring exists at the specified index
  if (str.substr(index, oldSubstring.length) === oldSubstring) {
    // Concatenate the parts of the string before the index, the new substring, and after the old substring
    return str.substr(0, index) + newSubstring + str.substr(index + oldSubstring.length);
  }
  // Return the original string if the old substring is not found at the specified index
  return str;
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
    // check if jp space in sentence
    
    var newString = "<span style='color:green'>" + corr + "</span>"
    sentenceElement.innerHTML = replaceIthOccurrence(sentence, corr, corrIndex, newString);
    
    // Disable all options
    var optionsDiv = document.getElementById("options");
    for (var i = 0; i < optionsDiv.children.length; i++) {
      optionsDiv.children[i].onclick = null;
      }
  }
  function containsOnlyCJK(str) {
    const regex = /^[\u3040-\u309F\u30A0-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\uFF66-\uFF9F\u20000-\u2A6DF\u2A700-\u2B73F\u2B740-\u2B81F\u2B820-\u2CEAF\u2CEB0-\u2EBEF]*$/;
    return regex.test(str);
  }

  function createWords() {
    //join together all the lyrics into one big string
    var lyricsText = config.lang == 'ko' ? lyrics.join(' ') : wordLines.join(' ');

    // Split the lyrics text into words, removing any punctuation
    var allWords = replacePunctuation(lyricsText, ' ').split(/\s+/).filter(word => containsOnlyCJK(word));
  
    // Create a Set to store unique words
    var uniqueWords = new Set(allWords);
  
    // Convert the Set to an array and store it in a global variable
    words = Array.from(uniqueWords);
  }

var player;

function onYouTubeIframeAPIReady() {

  player = new YT.Player('player', {
    height: '450',
    width: '800',
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
    if (config.lang !== 'ko') {
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






