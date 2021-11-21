/*----- constants -----*/
const startingCardsNumber = 5;
const round_time = 30;
const lang = 'ro';
const suits = ['ability', 'passion', 'profession', 'challenge'];
const values_ability = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
];

const values_challenge = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19',
  '20',
  '21',
  '22',
  '23',
  '24',
  '25',
  '26',
  '27',
  '28',
  '29',
  '30',
  '31',
];
const values_passion = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19',
  '20',
  '21',
  '22',
  '23',
  '24',
  '25',
  '26',
  '27',
  '28',
  '29',
  '30',
  '31',
  '32',
  '33',
  '34',
  '35',
  '36',
];

const values_profession = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19',
  '20',
  '21',
  '22',
  '23',
  '24',
  '25',
  '26',
  '27',
  '28',
  '29',
  '30',
  '31',
  '32',
  '33',
  '34',
  '35',
  '36',
  '37',
  '38',
  '39',
  '40',
  '41',
  '42',
  '43',
  '44',
  '45',
  '46',
  '47',
  '48',
  '49',
  '50',
  '51',
  '52',
  '53',
  '54',
  '55',
  '56',
  '57',
  '58',
  '59',
  '60',
  '61',
  '62',
  '63',
  '64',
];

/*----- app's state (variables) -----*/

let draw,
  clickedCard,
  firstClickDest,
  firstStackId,
  cardArr,
  secondsPlayed,
  counter,
  drawCycles,
  clickCount;

let deck_ability, deck_profession, deck_passion, deck_challenge;
let pile_ability, pile_profession, pile_passion, pile_challenge;
/* decks */
let decks = [deck_ability, deck_profession, deck_passion, deck_challenge];
/* draw region */
let drawRegion = 'draw';
/* move variables */
let hasDrawn = false;
let hasDropped = false;
let gameState = false;

//TODO Timer:  const timerEl = document.getElementById("timer");
/*----- cached element references -----*/
const boardEls = {
  pile_ability: document.getElementById('pile_ability'),
  pile_profession: document.getElementById('pile_profession'),
  pile_passion: document.getElementById('pile_passion'),
  pile_challenge: document.getElementById('pile_challenge'),
};

// Maps
//  - suites to pile
const pileMap = new Map();
pileMap.set(pile_ability, 'ability');
pileMap.set(pile_passion, 'passion');
pileMap.set(pile_profession, 'profession');
pileMap.set(pile_challenge, 'challenge');

// - deck to pile
const deckMap = new Map();
deckMap.set(deck_ability, pile_ability);
deckMap.set(deck_passion, pile_passion);
deckMap.set(deck_profession, pile_profession);
deckMap.set(deck_challenge, pile_challenge);

// - suite to deck
const suiteMap = new Map();
suiteMap.set('ability', deck_ability);
suiteMap.set('passion', deck_passion);
suiteMap.set('profession', deck_profession);
suiteMap.set('challenge', deck_challenge);

/* Subscribe to SSE */
let source = new EventSource(getBaseURL() + '/v1/api/notif/game');
source.onmessage = function (event) {
  // document.getElementById("messages").innerHTML += event.data + "<br>";
  let notif = JSON.parse(event.data);
  switch (notif['0']['eventType']) {
    case 'SYSTEM_HEARTBEAT':
      document.getElementById('messages').innerHTML += '_|_';
      break;
    case 'GAME_STARTED':
      if (!isGameStarted()) {
        console.log('Received GAME_STARTED event');
        document.getElementById('messages').innerHTML +=
          '\nGame Started!\nPlay On!\n';
        startGame();
      }
      break;
    case 'START_ROUND':
      console.log('Received START_ROUND');
      if (!isPlayerTurn()) {
        console.log('User is not playing an active round, starting one');
        startRound();
      }
      break;
    default:
      console.log('Unknown event received:' + JSON.stringify(notif));
  }
};

source.onerror = function (event) {
  alert(
    'Error connecting to the server, please use Synchronize when connection is restored'
  );
};

function getBaseURL() {
  return 'https://careerbus-game.escoaladevalori.ro:6060';
}

document.querySelector('body').addEventListener('click', handleClick);

setPiles();

function setPiles() {
  // stopTimer();
  // initialize piles
  pile_ability = [];
  pile_profession = [];
  pile_passion = [];
  pile_challenge = [];
  // initialize decks
  deck_ability = [];
  deck_profession = [];
  deck_passion = [];
  deck_challenge = [];
  // set the cards
  makeDecks();
  shuffleDecks();
  dealCards();
  render();
}

function makeDecks() {
  suits.forEach((suit) => {
    switch (suit) {
      case 'ability':
        values_ability.forEach((value) => {
          let card = { value: value, suit: suit };
          deck_ability.push(card);
        });
        break;
      case 'passion':
        values_passion.forEach((value) => {
          let card = { value: value, suit: suit };
          deck_passion.push(card);
        });
        break;
      case 'profession':
        values_profession.forEach((value) => {
          let card = { value: value, suit: suit };
          deck_profession.push(card);
        });
        break;
      case 'challenge':
        values_challenge.forEach((value) => {
          let card = { value: value, suit: suit };
          deck_challenge.push(card);
        });
        break;
    }
  });
}

function shuffleDecks() {
  deck_ability = deck_ability.sort(() => Math.random() - 0.5);
  deck_passion = deck_passion.sort(() => Math.random() - 0.5);
  deck_profession = deck_profession.sort(() => Math.random() - 0.5);
  deck_challenge = deck_challenge.sort(() => Math.random() - 0.5);
}

function dealCards() {
  deck_ability.forEach((card) => {
    pile_ability.push(card);
  });
  deck_passion.forEach((card) => {
    pile_passion.push(card);
  });
  deck_profession.forEach((card) => {
    pile_profession.push(card);
  });
  deck_challenge.forEach((card) => {
    pile_challenge.push(card);
  });
}

function render() {
  clearAllDivs();
  renderPiles();
}

function renderPiles() {
  renderPile(pile_ability);
  renderPile(pile_passion);
  renderPile(pile_profession);
  renderPile(pile_challenge);
}

function renderPile(pile) {
  pile.forEach((card, cIdx) => {
    let cardEl = document.createElement('div');
    cardEl.className = `card backs ${lang} ${card.suit}`;
    cardEl.style = `position: absolute; left: -7px; top: ${
      -7 + cIdx * -0.5
    }px;`;
    switch (pile) {
      case pile_ability:
        boardEls.pile_ability.appendChild(cardEl);
        break;
      case pile_passion:
        boardEls.pile_passion.appendChild(cardEl);
        break;
      case pile_profession:
        boardEls.pile_profession.appendChild(cardEl);
        break;
      case pile_challenge:
        boardEls.pile_challenge.appendChild(cardEl);
        break;
    }
  });
}

// Clear the card piles
function clearAllDivs() {
  for (let boardEl in boardEls) {
    while (boardEls[boardEl].firstChild) {
      boardEls[boardEl].removeChild(boardEls[boardEl].firstChild);
    }
  }
}

function isFaceUpCard(element) {
  return (
    element.className.includes('card') &&
    !element.className.includes('back') &&
    !element.className.includes('outline')
  );
}

function isTheSameCard(cardEl, cardObj) {
  let card1 = getCardClassFromEl(cardEl);
  let card2 = getCardClassFromObj(cardObj);
  return card1 === card2;
}

function getCardClassFromEl(cardEl) {
  let cardClass = cardEl.className.replace('card ', '');
  cardClass = cardClass.replace(' highlight', '');
  return cardClass;
}

function getCardClassFromObj(cardObj) {
  return `${cardObj.suit}${cardObj.value}`;
}

function getCardObjFromClass(cardClass) {
  let cardObj = {};
  cardObj.suit = cardClass[0];
  cardObj.value = cardClass[1] + (cardClass[2] ? cardClass[2] : '');
  return cardObj;
}

function handleClick(evt) {
  alert('Click not handled yet for master');
}

function handlePileClick(pile) {
  alert('click not handled yet');
  /*
    if (!clickedCard && isPlayerTurn() && ! hasDrawn) {
        hasDrawn = drawCard(pile);
        checkMove();
    }
    */

  //TODO: if the pile is empty: show empty card?
  // renderEmpty(pile);
}

function isEmptyStack(element) {
  return !!element.id;
}
