"use strict";

(function(){

  //VARIABLES

  var params = {
    playerName:         "",         //imie gracza
    rounds:             0,          //liczba rund podana przez gracza po wcisnieciu buttona start
    roundScore:         "",         //informuje o wyniku rundy oznacza wygraną gracza (true) lub komputera (false) badz remis (undefined)
    playerWinCounter:   "0",        //licznik zwyciestw gracza
    computerWinCounter: "0",        //licznik zwyciest komputera
    roundNumber:        "0",        //numer bieżącej rundy
    progress:           []         //tablica z informacjami opisujacymi przebieg rozgrywki
  },
	output =            document.querySelector('.js-output p'),
  winInfoOutput =     document.querySelector('.js-output p:nth-child(2)'),
	winConditionInfo =  document.querySelector('.js-result p:nth-child(2)'),
	resultInfoOutput =  document.querySelector('.js-result p:nth-child(1)'),
	controlButtons =    document.querySelectorAll('.js-player-move'),
	newGameButton =     document.querySelector('.js-new-game'),
  modalOverlay =      document.querySelector('.js-modal-overlay'),
  allModals =         document.querySelectorAll('.modal'),
	winInfoModal =      document.querySelector('.js-modal-gameover'),
  newGameModal =      document.querySelector('.js-modal-newgame'),
  inputName =         document.querySelector('.js-input-name'),
  inputRounds =       document.querySelector('.js-input-rounds'),
  closeModalButtons = document.querySelectorAll('.js-button-close'),
  startGameButton =   document.querySelector('.js-button-start');

  //FUNCTIONS

  function validateInputName() {  //waliduje zawartosc inputa
    var validatedObject = inputName;

    if (validatedObject.validity.patternMismatch) {
      validatedObject.setCustomValidity('Please use latin alphabet characters only!');
      validatedObject.nextElementSibling.innerHTML = validatedObject.validationMessage;

      return false;

    } else if(validatedObject.value === "") {
      validatedObject.nextElementSibling.innerHTML = "Field must not be empty!";

      return false;

    } else {
      validatedObject.nextElementSibling.innerHTML = '';

      return true;
    }
  }

  function validateInputRounds() {  //waliduje zawartosc inputa
    var validatedObject = inputRounds;

    if (validatedObject.validity.patternMismatch) {
      validatedObject.setCustomValidity('Please use numerical characters only!');
      validatedObject.nextElementSibling.innerHTML = validatedObject.validationMessage;

      return false;

    } else if(validatedObject.value === "") {
      validatedObject.nextElementSibling.innerHTML = "Field must not be empty!";

      return false;

    }
    else {
      validatedObject.nextElementSibling.innerHTML = '';

      return true;
    }

    return params.flagRounds
  }

	function newGame() {
		reset();							//resetuje zawartosc zmiennych uzywanych przez logike gry
		getRounds();					//pobiera liczbe rund
    getPlayerName();      //pobiera imie gracza
		printRounds(params.rounds);	//wyswietla podaną przez gracza liczbe rund na ekranie
		swapEvents(true);			//w zaleznosci od flagi (t/f) zmienia event podpiety pod buttony "kamien", "papier", "nozyce" pomiedzy playerMove() i gameOver()
	}

  function reset() { //resetuje zawartosc zmiennych uzywanych przez logike gry
    params.playerName = '';
    params.rounds = 0;
    params.roundScore = 0;
		params.playerWinCounter = 0;
		params.computerWinCounter = 0;
    params.roundNumber = 0;
    params.progress = [];
    inputRounds.classList.remove('valid');
    inputName.classList.remove('valid');
    inputRounds.nextElementSibling.innerHTML = "";
    inputName.nextElementSibling.innerHTML = "";
		output.innerHTML = '';
    winInfoOutput.innerHTML = '';
		resultInfoOutput.innerHTML = '';
    winConditionInfo.innerHTML = '';
    winInfoModal.children[0].innerHTML = '';
    winInfoModal.children[1].children[1].innerHTML = '';
	}

  function resetInputs() { //resetuje zawartosc inputow
    inputName.value = '';
    inputRounds.value = '';
  }

  function getRounds() { //pobiera liczbe rund
    params.rounds = parseInt(inputRounds.value);
	}

  function getPlayerName() { //pobiera imie gracza
    var name = inputName.value;
    var nameCapitalized = name.charAt(0).toUpperCase() + name.slice(1);
    params.playerName = nameCapitalized;
  }

  function printRounds(roundsNumber) { //wyswietla podaną przez gracza liczbe rund na ekranie
		winConditionInfo.innerHTML = ('Win ' + roundsNumber + (params.rounds > 1 ? ' rounds ' : ' round ') + 'to win entire game.');
	}

	function swapEvents(flag) {  //w zaleznosci od statusu gry przypina lub odpina eventlistenery dla controlButtons
		if(flag) {
			controlButtons.forEach(function(button) {
				button.removeEventListener('click', gameOver);
				button.addEventListener('click', playerMove);
			});
		} else {
			controlButtons.forEach(function(button) {
				button.removeEventListener('click', playerMove);
				button.addEventListener('click', gameOver);
			});
		}
	}

  function playerMove(event) {  //funkcja odpowiadajaca za rozgrywke
    params.roundNumber +=1; //wskazuje aktualna runde

		var humanMove = event.target.getAttribute('data-move');	//pobiera informace o ruchu gracza
		var computerMove = compMove();  //losuje ruch komputera

		params.roundScore = checkRoundScore(humanMove, computerMove); //porownuje ruch gracza i komputera, ustala wynik rundy i zapisuje go w zmiennej

		countWins(params.roundScore); //zlicza wygrane i odpowiada za wyswietlenie ich na ekranie

    params.progress[params.roundNumber - 1] = { //tablica z informacjami opisujacymi przebieg rundy
      roundNumber: params.roundNumber,
      playerMove: humanMove,
      cpuMove: computerMove,
      roundScore: printRoundScore(humanMove, computerMove),
      gameScore: printRoundResult()
    };

		if((params.playerWinCounter === params.rounds) || (params.computerWinCounter === params.rounds)) { //sprawdza czy spelniony jest win condition
			printWinInfo(); //jesli tak to wyswietla odpowiedni komunikat na ekranie
			swapEvents(false); // odpina od buttonow "kamien", "papier", "nozyce" event umozliwiajacy granie a w zamian przypina event wyswietlajacy komuniakt game over
		}
	}

  function compMove() { //losuje ruch komputera
		var result;
		switch (Math.round((Math.random()*2)+1)) { //konwertuje wylosowana liczbe na odpowiedniego stringa
			case 1: result = 'rock';
			break;
			case 2: result = 'paper';
			break;
			default: result = 'scissors';
		}

		return result;
	}

  function checkRoundScore(playerMove, computerMove) { //porownuje ruch gracza i komputera, nastepnie ustala wynik rundy
    // oneRoundScore = true - zwyciestwo gracza
    // oneRoundScore = false - zwyciestwo komputera
    // oneRoundScore = udefined - remis

		var oneRoundScore;

		if(playerMove === 'rock') {
			switch (computerMove) {
				case 'rock': oneRoundScore = undefined;
				break;
				case 'paper': oneRoundScore = false;
				break;
				default: oneRoundScore = true;
			}
		} else if (playerMove === 'paper') {
			switch (computerMove) {
				case 'rock': oneRoundScore = true;
				break;
				case 'paper': oneRoundScore = undefined;
				break;
				default: oneRoundScore = false;
			}
		} else if (playerMove === 'scissors') {
			switch (computerMove) {
				case 'rock': oneRoundScore = false;
				break;
				case 'paper': oneRoundScore = true;
				break;
				default: oneRoundScore = undefined;
			}
		}

		return oneRoundScore;
	}

  function printRoundScore(playerMove, computerMove) { //wyswietla komunikat kto wygral/remis i wyswietla kto zrobil jaki ruch w danej rundzie
    var roundScore;
		if(params.roundScore === undefined) {
			roundScore = ('draw');
      output.innerHTML = ('DRAW ' + params.playerName + ' played ' + playerMove + ', computer played ' + computerMove + ' too.');
		} else {
			roundScore = (params.playerName + ' ' + (params.roundScore ? 'won' : 'lost'));
      output.innerHTML = (params.playerName + ' played ' + playerMove + ', computer played ' + computerMove + '. '+ params.playerName + ' ' + (params.roundScore ? 'wins ' : 'loses ') + ' this round.');
		}

    return roundScore;
	}

	function countWins(roundScore) { //zlicza wygrane rundy
		if(roundScore) {
			params.playerWinCounter += 1;
		} else if(roundScore === false) {
			params.computerWinCounter += 1;
		}

		printRoundResult();	//i wyswietla biezacy wynik rozgrywki
	}

  function printRoundResult() { //wyswietla bieżący rezultat rozgrywki
		var score = (params.playerName + ' ' + params.playerWinCounter + ' vs ' + params.computerWinCounter + ' Computer' );
    resultInfoOutput.innerHTML = (params.playerName + ' ' + params.playerWinCounter + ' vs ' + params.computerWinCounter + ' Computer' );

    return score
	}

  function printWinInfo() { // wyswietla komunikat o zwyciestwie
		winInfoModal.children[0].innerHTML = params.playerName + ' ' + (params.roundScore ? 'WINS ' : 'LOSES ') + 'the entire game!';

    for(var i = 0; i < params.roundNumber; i++) {
      winInfoModal.children[1].children[1].innerHTML += '<tr><td>'  + params.progress[i].roundNumber +
                                                        '</td><td>' + params.progress[i].playerMove +
                                                        '</td><td>' + params.progress[i].cpuMove +
                                                        '</td><td>' + params.progress[i].roundScore +
                                                        '</td><td>' + params.progress[i].gameScore +
                                                        '</td></tr>';
    }
    showModalBackground();
    showModal(winInfoModal);
	}

  function showModalBackground() {
    modalOverlay.classList.add('show');
  }

  function hideModalBackground() {
    modalOverlay.classList.remove('show');
  }

  function showModal(modal) {
    modal.classList.add('show');
  }

  function hideModal(modal) {
    modal.classList.remove('show');
  }

  function gameOver() {  //wyswietla komunikat o zakonczeniu gry
		winInfoOutput.insertAdjacentHTML('beforeend', '<br><span>Game over, please press the new game button!</span>');
	}

  //EVENTS

  newGameButton.addEventListener('click', function() {
    showModalBackground();
    showModal(newGameModal);
    resetInputs()
  });

  startGameButton.addEventListener('click', function(e) {
    var flagName = validateInputName();
    var flagRounds = validateInputRounds();

    if(!flagName) {
      inputName.classList.remove('valid');
      inputName.classList.add('invalid');
    }
    else {
      inputName.classList.remove('invalid');
      inputName.classList.add('valid');
    }

    if(!flagRounds) {
      inputRounds.classList.remove('valid');
      inputRounds.classList.add('invalid');
    }
    else {
      inputRounds.classList.remove('invalid');
      inputRounds.classList.add('valid');
    }
    if(flagName === true && flagRounds === true) {
      hideModalBackground();
      hideModal(e.target.parentElement);
      newGame();
    }
  });

  closeModalButtons.forEach(function(button) {
    button.addEventListener('click', function(e) {
      hideModalBackground();
      hideModal(e.target.parentElement);
      reset();
    });
  });

  modalOverlay.addEventListener('click', function() {
    hideModalBackground();
    var showedModals = document.querySelectorAll('.show');
    showedModals.forEach(function(modal) {
      hideModal(modal);
    });
  });

  allModals.forEach(function(modal) {
    modal.addEventListener('click', function(e) {
      e.stopPropagation();
    });
  });

})();
