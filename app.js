const choice = document.querySelector('.choice');
const Board = document.querySelector('.game-container');
const winner = document.querySelector('.winner');
const winnerVideo = document.getElementById('winner-video'); 
const winnerGif = document.getElementById('winner-gif'); 

function toggleMusic() {
    var music = document.getElementById("back-music");
    var speaker = document.getElementById("speaker");

    if (music.paused) {
        music.play(); // Start playing the music
        speaker.classList.remove("active"); 
    } else {
        music.pause(); // Pause the music
        speaker.classList.add("active");
    }
}

let gameBoard, user = 'X', computer = 'O';
const cells = document.querySelectorAll('.cell');
const winCombos = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 4, 8], [6, 4, 2], [2, 5, 8], [1, 4, 7], [0, 3, 6]];

const playerSelect = player => {
    user = player;
    computer = (player === 'X') ? 'O' : 'X';

    gameBoard = Array.from(Array(9).keys());

    cells.forEach(cell => {
        cell.addEventListener('click', handleClick, false);
    });

    if (computer === 'X') {
        turn(bestSpot(), computer);
    }

    choice.classList.add('fadeOut');
    setTimeout(() => { choice.style.display = 'none'; }, 300);

    Board.classList.remove('fadeOut');
    Board.classList.add('fadeIn');
    setTimeout(() => { Board.style.display = 'flex'; }, 300);
}

const startGame = () => {
    winner.classList.remove('fadeIn');
    winner.classList.add('fadeOut');
    setTimeout(() => { winner.style.display = 'none'; }, 300);

    Board.classList.remove('fadeIn');
    Board.classList.add('fadeOut');
    setTimeout(() => { Board.style.display = 'none'; }, 300);

    choice.classList.remove('fadeOut');
    choice.classList.add('fadeIn');
    setTimeout(() => { choice.style.display = 'block'; }, 300);

    cells.forEach(cell => {
        cell.innerHTML = '';
        cell.style.color = '#000';
        cell.style.background = '#adbce6';
    });

    winnerVideo.style.display = 'none';
    winnerGif.style.display = 'none'; 

const handleClick = gameSpace => {
    if (typeof gameBoard[gameSpace.target.id] === 'number') {
        turn(gameSpace.target.id, user);
        if (!checkWin(gameBoard, user) && !checkTie()) {
            setTimeout(() => { turn(bestSpot(), computer); }, 500);
        }
    }
}

const turn = (spaceId, player) => {
    gameBoard[spaceId] = player;
    document.getElementById(spaceId).innerHTML = player;

    let gameWon = checkWin(gameBoard, player);
    if (gameWon) {
        gameOver(gameWon);
    } else {
        checkTie();
    }
}

const checkWin = (board, player) => {
    let spaces = board.reduce((acc, ele, idx) => (ele === player) ? acc.concat(idx) : acc, []);
    let gameWon = null;

    for (let [index, winComboSpaces] of winCombos.entries()) {
        if(winComboSpaces.every(elem => spaces.indexOf(elem) > -1)) {
            gameWon = { index: index, player: player };
            break;
        }
    }

    return gameWon;
}

const gameOver = gameWon => {
    for (let index of winCombos[gameWon.index]) {
        document.getElementById(index).style.color = '#FFF';
        document.getElementById(index).style.backgroundColor = '#84c6d9';
    }

    cells.forEach(cell => {
        cell.removeEventListener('click', handleClick, false);
    });

    declareWinner(gameWon.player === user ? "You Won The Game!" : "Computer Won The Game!");
}

const declareWinner = message => {
    winner.querySelector('h3').innerHTML = message;

    if (message === "Computer Won The Game!") {
        winnerVideo.style.display = 'none'; 
        winnerGif.style.display = 'block';
        winnerGif.play(); // Ensure video starts playing
    } else if (message === "The Game Is Tie!") {
        winnerGif.style.display = 'none'; 
        winnerVideo.style.display = 'block'; 
        winnerVideo.play();
    } else {
        winnerGif.style.display = 'none'; 
        winnerVideo.style.display = 'none'; 
    }

    setTimeout(() => {
        Board.classList.remove('fadeIn');
        Board.classList.add('fadeOut');
        setTimeout(() => { Board.style.display = 'none'; }, 300);

        winner.classList.remove('fadeOut');
        winner.classList.add('fadeIn');
        setTimeout(() => { winner.style.display = 'block'; }, 300);
    }, 1500);
}

const bestSpot = () => {
    return minMax(gameBoard, computer).index;
}

const emptySquares = (board = gameBoard) => {
    return board.reduce((acc, el, i) => {
        if (typeof el === 'number') acc.push(i);
        return acc;
    }, []);
}

const checkTie = () => {
    if (emptySquares().length === 0) {
        choice.classList.remove('fadeOut');
        choice.classList.add('fadeIn');

        cells.forEach(cell => {
            cell.style.backgroundColor = "#84c6d9";
            cell.removeEventListener('click', handleClick, false);
        });

        declareWinner("The Game Is Tie!");
        return true;
    }
    return false;
}

const minMax = (testBoard, player) => {
    let openSpaces = emptySquares(testBoard);

    if (checkWin(testBoard, user)) {
        return { score: -10 };
    } else if (checkWin(testBoard, computer)) {
        return { score: 10 };
    } else if (openSpaces.length === 0) {
        return { score: 0 };
    }

    let moves = [];

    for (let i = 0; i < openSpaces.length; i++) {
        let move = {};
        move.index = openSpaces[i];
        testBoard[openSpaces[i]] = player;

        if (player === computer) {
            move.score = minMax(testBoard, user).score;
        } else {
            move.score = minMax(testBoard, computer).score;
        }

        testBoard[openSpaces[i]] = move.index;

        if ((player === computer && move.score === 10) || (player === user && move.score === -10)) {
            return move;
        } else {
            moves.push(move);
        }
    }

    let bestMove, bestScore;

    if (player === computer) {
        bestScore = -1000;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        bestScore = 1000;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }

    return moves[bestMove] || {};
}

