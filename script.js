n_songs = 168;

var apiKey = "AIzaSyA1TBlg96OMN6k5trM6Ks3gFsH0yjxfvdk"

var n = Math.floor(Math.random() * n_songs);
var lyricsFile = 'lyrics/' + n + '.json';
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
        sentenceElement.innerHTML = sentenceElement.innerText.replace("_____", "<span style='color:green'>" + corr + "</span>");

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

function newSong() {
  n = Math.floor(Math.random() * n_songs);
  lyricsFile = 'lyrics/' + n + '.json';
  fetch(lyricsFile)
  .then((response) => response.json())
  .then((data) => {
    lyrics = data.lyrics;
    title = data.title;
    searchYouTube(title);
    document.getElementById("title").innerText = title;
    currentSentence = -1;
    createWords();
    nextQuestion();
  });
}


function searchYouTube(title) {
  var url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${title}&type=video&key=${apiKey}`;  
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      var videoId = data.items[0].id.videoId;
      playVideo(videoId);
    });
}



var player;

function playVideo(videoId) {
  if (!player) {
    player = new YT.Player('player', {
      height: '360',
      width: '640',
      videoId: videoId,
    });
  } else {
    player.loadVideoById(videoId);
  }
}


function onYouTubeIframeAPIReady() {
  

    fetch(lyricsFile)
    .then((response) => response.json())
    .then((data) => {
      lyrics = data.lyrics;
      title = data.title;
      searchYouTube(title);
      document.getElementById("title").innerText = title;
      currentSentence = -1;
      createWords();
      nextQuestion();
    });
}



