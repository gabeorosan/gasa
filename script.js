

n_songs = 270;
var n = Math.floor(Math.random() * n_songs);
var lyricsFile = 'lyrics/' + n + '.json';
var lyrics, currentSentence, words
var sentenceElement = document.getElementById("sentence");

function nextQuestion() {

  if (currentSentence >= lyrics.length) {
    alert("End of lyrics!");
    return;
  }
  var sentence = lyrics[currentSentence];
  var sentenceWords = sentence.split(" ");
  var blankIndex = Math.floor(Math.random() * sentenceWords.length);
  var blankWord = sentenceWords[blankIndex];
  sentenceWords[blankIndex] = "_____";
  sentence = sentenceWords.join(" ");

  // set the innerText of the sentence element to the new sentence
  sentenceElement.innerText = sentence;
  // set the progress text
  document.getElementById("progress").innerText = "Progress: " + (currentSentence + 1) + "/" + lyrics.length;

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

  currentSentence++;
}



function checkAnswer(selected, correct, optionDiv) {

    if (selected === correct) {
        optionDiv.style.backgroundColor = "green";
      } else {
        optionDiv.style.backgroundColor = "red";
        // Highlight the correct answer
        document.getElementById("correct").style.backgroundColor = "green";
      }
        var corr = document.getElementById("correct").innerHTML
        //sentenceElement.innerText = sentenceElement.innerText.replace("_____", corr);

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
    document.getElementById("title").innerText = title;
    currentSentence = 0;
    createWords();
    nextQuestion();
  });
}

fetch(lyricsFile)
  .then((response) => response.json())
  .then((data) => {
    lyrics = data.lyrics;
    title = data.title;
    document.getElementById("title").innerText = title;
    currentSentence = 0;
    createWords();
    nextQuestion();
  });

