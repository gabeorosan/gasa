n_songs = 174;

var n;
var lyricsFile;
var lyrics, currentSentence, words
var sentenceElement = document.getElementById("sentence");

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
  var sentenceWords = sentence.split(" ");
  //remove punctuation
  sentenceWords = sentenceWords.map(word => word.replace(/[.,!?;:]/g, ''));

  var blankIndex = Math.floor(Math.random() * sentenceWords.length);
  var blankWord = sentenceWords[blankIndex];
  sentenceWords[blankIndex] = "_____";
  sentence = sentenceWords.join(" ");

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
    optionDiv.onclick = function () { checkAnswer(option, blankWord, optionDiv); };
    optionsDiv.appendChild(optionDiv);
  });

  
  document.getElementById("progress").innerText = (currentSentence + 1) + "/" + lyrics.length;
}

function previousQuestion() {
  currentSentence = currentSentence === 0 ? lyrics.length - 2 : currentSentence - 2;
  nextQuestion();
}



function checkAnswer(selected, correct, optionDiv) {

    if (selected === correct) {
        optionDiv.style.backgroundColor = "#44b445";
      } else {
        optionDiv.style.backgroundColor = "red";
        // Highlight the correct answer
        document.getElementById("correct").style.backgroundColor = "#44b445";
      }
        var corr = document.getElementById("correct").innerHTML
  
        // Replace the blank with the correct answer in green
        sentenceElement.innerHTML = lyrics[currentSentence]
        sentenceElement.innerHTML = sentenceElement.innerText.replace(corr, "<span style='color:green'>" + corr + "</span>");

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
    var allWords = lyricsText.replace(/[.,!?;:]/g, '').split(/\s+/);
  
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
  n = Math.floor(Math.random() * n_songs);
  lyricsFile = 'lyrics/' + n + '.json';
  fetch(lyricsFile)
  .then((response) => response.json())
  .then((data) => {
    lyrics = data.lyrics;
    title = data.title;
    videoId = data.video_id;

    
    player.loadVideoById(videoId);

    document.getElementById("title").innerText = title;
    currentSentence = -1;
    createWords();
    nextQuestion();
  });
}






