var song = '', songButtons, songButton;
const scrollingContainer = document.getElementById('scrollingContainer');
var filter = '';
var lyrics, words, wordLines, currentSentence
const sentenceElement = document.getElementById("sentence");
var title_path = {};
var savedSongs = {};
var count;
var currentBlank;
var blankWords = []
var counter = document.getElementById('counter');
var player;
const config = {
    lang: '' // Default language
  };
scrollingContainer.addEventListener('mouseout', function () {
  if (song) {
    songButtons.forEach((otherButton) => {
        if (otherButton !== songButton) {
            otherButton.style.display = 'none';
        }
    });
    scrollingContainer.classList.add('collapsed');
  }
});

scrollingContainer.addEventListener('mouseover', function () {
    scrollingContainer.classList.remove('collapsed');
    var songButtons = document.querySelectorAll('.songButton');
    songButtons.forEach((button) => {
        var txtValue = button.textContent || button.innerText;
        if (txtValue.toLowerCase().indexOf(filter) > -1) {
            button.style.display = 'block';
        }
      });
})

function songActions() {
   songButtons = document.querySelectorAll('.songButton');
    songButtons.forEach((button) => {
        button.addEventListener('click', function () {
            songButton = button;
            studySong(button.innerText);
        });
    });
}
function loadSavedSongs() {
    savedSongs = Object.keys(title_path);
    /*
    savedSongs = JSON.parse(localStorage.getItem('savedSongs')) || {};
    */
    var list = document.getElementById('savedSongsList');
    for(i = 0; i < savedSongs.length; i++) {
        var s = savedSongs[i];
      var listItem = document.createElement('li');
      listItem.classList.add('songButton');
      listItem.textContent = s;
      list.appendChild(listItem);
    };
    
    songActions();
  }
  
  function searchSongs() {
    var input = document.getElementById('songSearch');
    filter = input.value.toLowerCase();
    var list = document.getElementById('savedSongsList').getElementsByTagName('li');
  
    song = '';
    scrollingContainer.classList.remove('collapsed');

    for (var i = 0; i < list.length; i++) {
      var txtValue = list[i].textContent || list[i].innerText;
      if (txtValue.toLowerCase().indexOf(filter) > -1) {
        list[i].style.display = "";
      } else {
        list[i].style.display = "none";
      }
    }
  }
  
  function studySong(songTitle) {
    song = songTitle;
    count = 1;
    if (song) {
        playScreen.style.display = 'block';
        lyricsFile = 'lyrics/' + title_path[song];
        config.lang = title_path[song].split('/')[0];
        console.log(lyricsFile);
        fetch(lyricsFile)
        .then((response) => response.json())
        .then((data) => {
            videoId = data.video_id;
            player.loadVideoById(videoId);
            lyrics = data.lyrics;
            if (config.lang !== 'ko') {
            wordLines = data.words;
            }
            currentSentence = -1;
            createWords();
            nextQuestion();
            changeCounter(0);
        });
    }
  }

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
  
  function replaceRandomOccurrence(str, substring, replacement = ' ____ ') {
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
  function getRandomInts(n, a, b) {
    if (n > (b - a + 1) || n < 1) {
      throw new Error(`Value of n must be between 1 and ${b - a + 1} (inclusive)`);
    }
  
    const numbers = Array.from({ length: b - a + 1 }, (_, i) => i + a); // Create an array [a, a + 1, ..., b]
    const result = [];
  
    for (let i = 0; i < n; i++) {
      const randomIndex = Math.floor(Math.random() * numbers.length);
      result.push(numbers[randomIndex]);
      numbers.splice(randomIndex, 1); // Remove the selected number from the array
    }
  
    return result;
  }


  function sortBlankedWords(bWords, iValues) {
    sentence = lyrics[currentSentence];
    // Create an array of objects representing the blanked words and their original positions
    var blanks = bWords.map((word, index) => {
      var occurrence = iValues[index];
      var position = -1;
      for (var i = 0; i <= occurrence; i++) {
        position = sentence.indexOf(word, position + 1);
      }
      return { word, position };
    });
  
    // Sort the array based on the original positions
    blanks.sort((a, b) => a.position - b.position);
  
    // Return the sorted words
    return blanks.map(item => item.word);
  }
  
  function nextQuestion() {
    if (currentSentence >= lyrics.length - 1) {
      currentSentence = 0;
    } else {
      currentSentence++;
    }
    if (count == 0) {
        sentenceElement.innerHTML = lyrics[currentSentence];
        document.getElementById("progress").innerText = (currentSentence + 1) + "/" + lyrics.length;
        return;
    }
  
    var sentence = lyrics[currentSentence];
    var sentenceLine = config.lang == 'ko' ? sentence : wordLines[currentSentence];
    var sentenceWords = replacePunctuation(sentenceLine, ' ').split(/\s+/).filter(word => containsOnlyCJK(word));
    
    var n_blanks = Math.min(count, sentenceWords.length);
    var indices = getRandomInts(n_blanks, 0, sentenceWords.length - 1);
    var blankVals = [];
    var blankIndices = [];
    for (var i = 0; i < indices.length; i++) {
        var ix = indices[i];
        var blankWord = sentenceWords[ix];
        blankVals.push(blankWord);
        console.log(blankWord);
        console.log(sentence);
        var result = replaceRandomOccurrence(sentence, blankWord);
        sentence = result.newText;
        blankIndices.push(result.iblank);
    }
    blankWords = sortBlankedWords(blankVals, blankIndices);

    sentenceElement.innerHTML = sentence;
    document.getElementById("progress").innerText = (currentSentence + 1) + "/" + lyrics.length;
    currentBlank = -1;
    nextBlank();
  }
  function nextBlank() {
    currentBlank++;
    var blankWord = blankWords[currentBlank];
    console.log(blankWords);
    console.log(blankWord);
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
        optionDiv.onclick = function () { checkAnswer(option, blankWord, optionDiv); };
        optionsDiv.appendChild(optionDiv);
    });
    
  }
  
  function previousQuestion() {
    currentSentence = currentSentence === 0 ? lyrics.length - 2 : currentSentence - 2;
    nextQuestion();
  }

  // Function to change the counter value
  function changeCounter(amount) {

    count += amount;
    if (count < 0) count = 0;
    //savedSongs[song]= count
    //localStorage.setItem('savedSongs', JSON.stringify(savedSongs));
    console.log(count);
    counter.innerHTML = count.toString();
    
  }
  

function onYouTubeIframeAPIReady() {

  player = new YT.Player('player', {
    height: '420',
    width: '840',
    events: {
      'onReady': onPlayerReady
    }
  });
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
  
  function checkAnswer(selected, correct, optionDiv) {
    var color = selected === correct ? "#44b445" : "red";
    //optionDiv.style.backgroundColor = color;
        // Highlight the correct answer
    //document.getElementById("correct").style.backgroundColor = "#44b445";
      var corr = document.getElementById("correct").innerHTML
      var sentence = sentenceElement.innerHTML
      var newString = "<span style='color:" + color + "'>" + corr + "</span>"
      sentence = sentence.replace(' ____ ', newString);
      sentenceElement.innerHTML = sentence
      
      var optionsDiv = document.getElementById("options");
      for (var i = 0; i < optionsDiv.children.length; i++) {
        optionsDiv.children[i].onclick = null;
        }
        if (currentBlank < count - 1) {
            nextBlank(blankWords);
        }
    }
    function containsOnlyCJK(str) {
        const regex = /^[\u3040-\u309F\u30A0-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\uFF66-\uFF9F\u20000-\u2A6DF\u2A700-\u2B73F\u2B740-\u2B81F\u2B820-\u2CEAF\u2CEB0-\u2EBEF]+$/;
        return regex.test(str) && !/\d/.test(str);
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
    fetch('lyrics/title_path.json')
    .then(response => response.json())
    .then(mapping => {
        title_path = mapping;
        loadSavedSongs();
    })
    .catch(error => console.error('There was an error loading the mapping:', error));
    function onPlayerReady() {
        
        }

  



