const letters = document.querySelectorAll('.scoreboard-letter');
const loadingDiv = document.querySelector('.info-bar');
const ANSWER_LENGTH = 5;
const ROUNDS =6;

function isLetter(letter) {
    return /^[a-zA-Z]$/.test(letter)};

function setLoading(isLoading) {
    loadingDiv.classList.toggle('show', isLoading);
}

function makeMap (array) {
    const obj = {};
    for (let i = 0; i < array.length; i++) {
        const letter = array[i];
        if (obj[letter]) {
            obj[letter]++;
        } else {
            obj[letter] = 1;
        }
    }

    return obj;
}

async function init() {

    let currentGuess = '';
    let currentRow = 0;
    let isLoading = true;

    const res = await fetch("https://words.dev-apis.com/word-of-the-day");
    const resObj = await res.json();
    const word = resObj.word.toUpperCase();
    const wordParts = word.split('');
    let done = false;
    setLoading(false);
    isLoading = false;



    function addLetter (letter) {
        if (currentGuess.length < ANSWER_LENGTH) {
            currentGuess += letter;
        } else {
            currentGuess = currentGuess.substring(0, currentGuess.length - 1) + letter;
        }

        letters[ANSWER_LENGTH * currentRow + currentGuess.length - 1].innerText = letter;
    }

    async function commit() {
        if (currentGuess.length !== ANSWER_LENGTH) {
            // do nothing
            return
        } 

        isLoading = true;
        setLoading(true);
        const res = await fetch("https://words.dev-apis.com/validate-word", {
            method : "POST",
            body : JSON.stringify({word : currentGuess})
        })

        const resObj = await res.json();
        const validWord = resObj.validWord;

        isLoading = false;
        setLoading(false);

        if (!validWord) {
            markInvalidWord();
            return;
        }
        
        const guessParts = currentGuess.split('');
        const map = makeMap(wordParts);


        for (let i = 0; i < ANSWER_LENGTH; i ++) {
            // mark as correct
            if (guessParts[i] === wordParts[i]) {
                letters[currentRow * ANSWER_LENGTH + i].classList.add('correct');
                map[guessParts[i]]--;
            }
        }

        for (let i = 0; i < ANSWER_LENGTH; i ++) {
            if (guessParts[i] === wordParts[i]) {
                // don't nothing, it was done before
            } else if (wordParts.includes(guessParts[i]) && map[guessParts[i]] > 0) {
                // mark as close
                letters[currentRow * ANSWER_LENGTH + i].classList.add('close');
                map[guessParts[i]]--;
            } else {
                letters[currentRow * ANSWER_LENGTH + i].classList.add('wrong');
            }
        }

        currentRow ++;
        ;

        if (currentGuess === word) {
            // win
            alert("You Win!");
            document.querySelector('.brand').classList.add('.winner');
            done = true;
            return;
        }else if (currentRow === ROUNDS) {
            // lose
            alert(`You lose!, the word is ${word}`);
            done = true;
        }

        currentGuess = ''
    }

    function markInvalidWord () {
        // alert("Not a valid word!");

        for (let i = 0; i < ANSWER_LENGTH; i++) {
            letters[currentRow * ANSWER_LENGTH + i].classList.remove('invalid');
            
            setTimeout(function () {
                letters[currentRow * ANSWER_LENGTH + i].classList.add('invalid');
        }, 10);
        }
    }

    function clear() {
        currentGuess = currentGuess.substring(0, currentGuess.length - 1);
        letters[ANSWER_LENGTH * currentRow + currentGuess.length].innerText = "";
    }

    document.addEventListener('keydown', function handleKeyPress (event) {

        if (done || isLoading){
            // do nothing
            return;
        }

        const action = event.key;

        if (action === 'Enter') {
            commit();
        } else if (action === 'Backspace') {
            clear();
        } else if (isLetter(action)) {
            addLetter(action.toUpperCase());
        } else {
            // do nothing
        };
    })
}

init();