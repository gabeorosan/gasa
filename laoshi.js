var ids = ['iFWsUUSNoe8',
 'FtLj8WUcqow',
 'ii1fTxhD_D0',
 '3TgmqH7YbcY',
 '3hIqEis4d9I',
 'y5coTWUm39M',
 'g_fSistU3MQ',
 'VhunpYlc2Eo',
 'NeoDdnSlRjk',
 'PXseMoyGKzY',
 'zSX0YYSmiT0',
 'E9KZ9ijFMqc',
 'uLUmFYPugEE',
 'gtFSBftabeU',
 'eaLWMHtK8gc',
 'pbAVauYsqP0',
 'tVBwxHQKO14',
 'Go-NplqS05A',
 'OpQo58RuByI',
 '4vbcC4TcMGc']

var n;
var lyricsFile;
var lyrics, pinyin, currentSentence, words
var sentenceElement = document.getElementById("sentence");
var pinyinElement = document.getElementById("pinyin");

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
  sentenceWords = sentenceWords.map(word => word.replace(/[.,!?;:-]/g, ''));
  pinyinWords = pinWords.map(word => word.replace(/[.,!?;:-]/g, ''));

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
    var allWords = lyricsText.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '').split(/\s+/);
  
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
  var id = ids[Math.floor(Math.random() * ids.length)];

  lyricsFile = 'laoshi/' + id + '.json';
  fetch(lyricsFile)
  .then((response) => response.json())
  .then((data) => {
    lyrics = data.captions.filter((_, index) => index % 2 === 0);
    pinyin = data.captions.filter((_, index) => index % 2 === 1);
    videoId = data.video_id;

    
    player.loadVideoById(videoId);

    currentSentence = -1;
    createWords();
    nextQuestion();
  });
}






