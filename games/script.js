const statusEl = document.getElementById('status');
const boardEl = document.getElementById('board');
const resetBtn = document.getElementById('reset');

// 符號組合
const SYMBOL_SETS = {
  XO: ['X', 'O'],
  DOGCAT: ['🐕', '🐈'],
  SUNMOON: ['☀️', '🌙']
};

let symbols = SYMBOL_SETS.XO;
let currentPlayer = 0; // 0 or 1
let board = Array(9).fill('');
let gameActive = false;
let timer = null;
let timeLeft = 20; // 20秒計時器
let stats = {
  total: 0,
  wins: [0, 0]
};

function loadStats() {
  const s = localStorage.getItem('ttt_stats');
  if (s) stats = JSON.parse(s);
}

function saveStats() {
  localStorage.setItem('ttt_stats', JSON.stringify(stats));
}

function updateStatsDisplay() {
  const statsDiv = document.getElementById('statsContent');
  const winRate = stats.total ? [
    (stats.wins[0] / stats.total * 100).toFixed(1),
    (stats.wins[1] / stats.total * 100).toFixed(1)
  ] : [0, 0];
  statsDiv.innerHTML = `
    <p>${symbols[0]} 勝率：${winRate[0]}% (${stats.wins[0]}勝)</p>
    <p>${symbols[1]} 勝率：${winRate[1]}% (${stats.wins[1]}勝)</p>
    <p>總遊戲數：${stats.total}</p>
  `;
}

function setBoardSymbols() {
    document.querySelectorAll('.cell').forEach((cell, i) => {
        cell.textContent = board[i];
        cell.disabled = !gameActive || board[i];
    });
}

function updateStatus(msg) {
    document.getElementById('status').textContent = msg;
}

function startTurnTimer() {
  clearInterval(timer);
  timeLeft = 20;
  updateStatus(`目前玩家：${symbols[currentPlayer]}（剩餘 ${timeLeft} 秒）`);
  timer = setInterval(() => {
    timeLeft--;
    updateStatus(`目前玩家：${symbols[currentPlayer]}（剩餘 ${timeLeft} 秒）`);
    if (timeLeft <= 0) {
      clearInterval(timer);
      endGame((currentPlayer + 1) % 2, '超時');
    }
  }, 1000);
}

function startGame() {
    symbols = SYMBOL_SETS[document.getElementById('symbolSet').value];
    currentPlayer = 0;
    board = Array(9).fill('');
    gameActive = true;
    history = [];
    undoUsed = [false, false];
    setBoardSymbols();
    document.getElementById('stats').style.display = 'none';
    document.getElementById('undo').disabled = false;
    updateStatus(`目前玩家：${symbols[currentPlayer]}`);
    startTurnTimer();
}

function endGame(winner, reason) {
  gameActive = false;
  clearInterval(timer);
  document.querySelectorAll('.cell').forEach(cell => cell.disabled = true);
  stats.total++;
  if (winner !== null) stats.wins[winner]++;
  saveStats();
  document.getElementById('stats').style.display = 'block';
  updateStatsDisplay();
  if (winner === null) {
    updateStatus(`平手！`);
  } else {
    updateStatus(`${symbols[winner]} 勝利！${reason ? '（' + reason + '）' : ''}`);
  }
}

function checkWinner() {
  const lines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (const [a,b,c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return board.every(cell => cell) ? 'draw' : null;
}

// 綁定按鈕事件
document.getElementById('startGame').addEventListener('click', startGame);
document.getElementById('reset').addEventListener('click', startGame);

// 綁定棋盤點擊事件
document.querySelectorAll('.cell').forEach((cell, idx) => {
    cell.addEventListener('click', () => {
        if (!gameActive || board[idx]) return;
        board[idx] = symbols[currentPlayer];
        history.push({ board: [...board], player: currentPlayer });
        setBoardSymbols();
        const result = checkWinner();
        if (result) {
            endGame(currentPlayer);
        } else if (board.every(cell => cell)) {
            endGame(null); // 平手
        } else {
            currentPlayer = (currentPlayer + 1) % 2;
            startTurnTimer();
        }
    });
});

// 悔棋
document.getElementById('undo').addEventListener('click', () => {
  if (!gameActive || undoUsed[currentPlayer] || history.length < 2) return;
  // 回到上一個自己的回合
  for (let i = history.length - 2; i >= 0; i--) {
    if (history[i].player === currentPlayer) {
      board = [...history[i].board];
      undoUsed = [...history[i].undoUsed];
      undoUsed[currentPlayer] = true;
      history = history.slice(0, i + 1);
      setBoardSymbols();
      updateStatus(`悔棋成功！目前玩家：${symbols[currentPlayer]}`);
      startTurnTimer();
      document.getElementById('undo').disabled = true;
      setTimeout(() => {
        if (gameActive) document.getElementById('undo').disabled = false;
      }, 1000);
      return;
    }
  }
});

// 初始載入
loadStats();
updateStatsDisplay();
setBoardSymbols();
document.getElementById('undo').disabled = true;
document.getElementById('stats').style.display = 'block';
        if (gameActive) document.getElementById('undo').disabled = false;
      }, 1000);
      return;
    }
  }
});

// 初始載入
loadStats();
updateStatsDisplay();
setBoardSymbols();
document.getElementById('undo').disabled = true;
document.getElementById('stats').style.display = 'block';
