var n_songs;  
var n;
var lyricsFile;
var lyrics, currentSentence, words
const sentenceElement = document.getElementById("sentence");
const pinyinElement = document.getElementById("pinyin");
const playScreen = document.getElementById("playScreen");

const config = {
  lang: 'jp' // Default language
};

function changeLanguage(langCode) {
  config.lang = langCode;
  player.height: langCode == 'ko' ? '360' : '300'
  console.log(`Language changed to ${langCode}`);
  pinyinElement.style.display = config.lang === 'ko' ? 'none' : 'block';
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
function removePunctuation(str) {
  // Regular expression matching Japanese punctuation characters
  return str.replace(/[!-\/:-@\[-`{-~\u3000-\u303F\uFF00-\uFFEF\u2010\u2013\u2014\u2026\u30FB\u30FC\u3001\u3002、]/g, '');
}

function nextQuestion() {
  if (currentSentence >= lyrics.length - 1) {
    currentSentence = 0;
  } else {
    currentSentence++;
  }
  var sentence = lyrics[currentSentence];
  var sentenceWords = sentence.split(" ");
  //remove punctuation
  sentenceWords = sentenceWords.map(word => word.replace(/[.,!?;:-]/g, ''));

  var blankIndex = Math.floor(Math.random() * sentenceWords.length);
  var blankWord = sentenceWords[blankIndex];
  sentenceWords[blankIndex] = "_____";
  sentence = sentenceWords.join(" ");

  // set the innerText of the sentence element to the new sentence
  sentenceElement.innerText = sentence;
  
  if (config.lang !== 'ko') {
    pinyinLine = pinyin[currentSentence];
    pinWords = pinyinLine.split(" ");
    pinyinWords = pinWords.map(word => removePunctuation(word));
    pinyinWords[blankIndex] = "_____";
    pinyinLine = pinyinWords.join(" ");
    pinyinElement.innerText = pinyinLine;
  }
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

        if (config.lang !== 'ko') {
          pinyinLine = pinyin[currentSentence]
          pinyinList = pinyinLine.split(" ")
          pinyinList[corrIndex] = "<span style='color:green'>" + pinyinList[corrIndex] + "</span>";
          pinyinElement.innerHTML = pinyinList.join(" ")
        }
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
    var allWords = lyricsText.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '').split(/\s+/);
  
    // Create a Set to store unique words
    var uniqueWords = new Set(allWords);
  
    // Convert the Set to an array and store it in a global variable
    words = Array.from(uniqueWords);
  }

var player;

function onYouTubeIframeAPIReady() {

  player = new YT.Player('player', {
    height: '300',
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
  n_songs = config.lang == 'zh' ? 16 : 220, 
  n = Math.floor(Math.random() * n_songs);
  lyricsFile = 'lyrics/' + config.lang + '/' +  n + '.json';
  fetch(lyricsFile)
  .then((response) => response.json())
  .then((data) => {
    if (config.lang == 'ko') {
      lyrics = data.lyrics;
    } else {
      lyrics = data.lyrics.filter((_, index) => index % 2 === 0);
      pinyin = data.lyrics.filter((_, index) => index % 2 === 1);
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






