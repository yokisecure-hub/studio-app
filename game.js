// ゲーム設定
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 25;
const COLORS = [
    null,
    '#FF0D72', // I
    '#0DC2FF', // J
    '#0DFF72', // L
    '#F538FF', // O
    '#FF8E0D', // S
    '#FFE138', // T
    '#3877FF', // Z
];

// テトリミノの形状定義
const SHAPES = [
    [], // 空
    [[1, 1, 1, 1]], // I
    [[2, 0, 0], [2, 2, 2]], // J
    [[0, 0, 3], [3, 3, 3]], // L
    [[4, 4], [4, 4]], // O
    [[0, 5, 5], [5, 5, 0]], // S
    [[0, 6, 0], [6, 6, 6]], // T
    [[7, 7, 0], [0, 7, 7]], // Z
];

// ゲーム状態
let canvas, ctx, nextCanvas, nextCtx;
let board = [];
let currentPiece = null;
let nextPiece = null;
let score = 0;
let level = 1;
let lines = 0;
let gameLoop = null;
let isPaused = false;
let isGameOver = false;
let dropInterval = 1000;
let lastDropTime = 0;

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    nextCanvas = document.getElementById('next-canvas');
    nextCtx = nextCanvas.getContext('2d');

    canvas.width = COLS * BLOCK_SIZE;
    canvas.height = ROWS * BLOCK_SIZE;
    nextCanvas.width = 4 * BLOCK_SIZE;
    nextCanvas.height = 4 * BLOCK_SIZE;

    initBoard();
    setupEventListeners();
    draw();
});

// ボードの初期化
function initBoard() {
    board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
}

// イベントリスナーの設定
function setupEventListeners() {
    // ゲームコントロールボタン
    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('pause-btn').addEventListener('click', togglePause);
    document.getElementById('reset-btn').addEventListener('click', resetGame);

    // キーボード操作
    document.addEventListener('keydown', handleKeyPress);

    // タッチコントロール
    document.getElementById('left-btn').addEventListener('click', () => movePiece(-1, 0));
    document.getElementById('right-btn').addEventListener('click', () => movePiece(1, 0));
    document.getElementById('down-btn').addEventListener('click', () => movePiece(0, 1));
    document.getElementById('rotate-btn').addEventListener('click', rotatePiece);
    document.getElementById('drop-btn').addEventListener('click', hardDrop);

    // タッチボタンの連続操作対応
    let moveInterval;
    document.getElementById('left-btn').addEventListener('touchstart', (e) => {
        e.preventDefault();
        movePiece(-1, 0);
        moveInterval = setInterval(() => movePiece(-1, 0), 100);
    });
    document.getElementById('right-btn').addEventListener('touchstart', (e) => {
        e.preventDefault();
        movePiece(1, 0);
        moveInterval = setInterval(() => movePiece(1, 0), 100);
    });
    document.getElementById('down-btn').addEventListener('touchstart', (e) => {
        e.preventDefault();
        movePiece(0, 1);
        moveInterval = setInterval(() => movePiece(0, 1), 50);
    });

    document.addEventListener('touchend', () => {
        if (moveInterval) {
            clearInterval(moveInterval);
            moveInterval = null;
        }
    });
}

// キーボード操作
function handleKeyPress(e) {
    if (isGameOver || !currentPiece) return;

    switch(e.key) {
        case 'ArrowLeft':
            e.preventDefault();
            movePiece(-1, 0);
            break;
        case 'ArrowRight':
            e.preventDefault();
            movePiece(1, 0);
            break;
        case 'ArrowDown':
            e.preventDefault();
            movePiece(0, 1);
            break;
        case 'ArrowUp':
            e.preventDefault();
            rotatePiece();
            break;
        case ' ':
            e.preventDefault();
            hardDrop();
            break;
    }
}

// ゲーム開始
function startGame() {
    if (isGameOver) {
        resetGame();
    }

    score = 0;
    level = 1;
    lines = 0;
    initBoard();
    updateScore();

    nextPiece = createPiece();
    spawnPiece();

    document.getElementById('start-btn').disabled = true;
    document.getElementById('pause-btn').disabled = false;

    isPaused = false;
    isGameOver = false;
    lastDropTime = Date.now();

    if (gameLoop) cancelAnimationFrame(gameLoop);
    gameLoop = requestAnimationFrame(update);
}

// ゲームループ
function update(timestamp) {
    if (!isPaused && !isGameOver) {
        const currentTime = Date.now();
        if (currentTime - lastDropTime > dropInterval) {
            if (!movePiece(0, 1)) {
                lockPiece();
                clearLines();
                spawnPiece();
            }
            lastDropTime = currentTime;
        }
        draw();
    }
    gameLoop = requestAnimationFrame(update);
}

// ピースの生成
function createPiece() {
    const type = Math.floor(Math.random() * (SHAPES.length - 1)) + 1;
    return {
        shape: SHAPES[type],
        color: type,
        x: Math.floor(COLS / 2) - Math.floor(SHAPES[type][0].length / 2),
        y: 0
    };
}

// ピースのスポーン
function spawnPiece() {
    currentPiece = nextPiece;
    nextPiece = createPiece();

    if (!isValidMove(currentPiece.shape, currentPiece.x, currentPiece.y)) {
        gameOver();
    }
}

// ピースの移動
function movePiece(dx, dy) {
    if (!currentPiece || isPaused || isGameOver) return false;

    const newX = currentPiece.x + dx;
    const newY = currentPiece.y + dy;

    if (isValidMove(currentPiece.shape, newX, newY)) {
        currentPiece.x = newX;
        currentPiece.y = newY;
        return true;
    }
    return false;
}

// ピースの回転
function rotatePiece() {
    if (!currentPiece || isPaused || isGameOver) return;

    const rotated = currentPiece.shape[0].map((_, i) =>
        currentPiece.shape.map(row => row[i]).reverse()
    );

    if (isValidMove(rotated, currentPiece.x, currentPiece.y)) {
        currentPiece.shape = rotated;
    }
}

// ハードドロップ
function hardDrop() {
    if (!currentPiece || isPaused || isGameOver) return;

    while (movePiece(0, 1)) {}
    lockPiece();
    clearLines();
    spawnPiece();
    lastDropTime = Date.now();
}

// 有効な移動かチェック
function isValidMove(shape, x, y) {
    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col]) {
                const newX = x + col;
                const newY = y + row;

                if (newX < 0 || newX >= COLS || newY >= ROWS) {
                    return false;
                }

                if (newY >= 0 && board[newY][newX]) {
                    return false;
                }
            }
        }
    }
    return true;
}

// ピースの固定
function lockPiece() {
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                const boardY = currentPiece.y + y;
                const boardX = currentPiece.x + x;
                if (boardY >= 0) {
                    board[boardY][boardX] = currentPiece.color;
                }
            }
        });
    });
}

// ラインのクリア
function clearLines() {
    let linesCleared = 0;

    for (let row = ROWS - 1; row >= 0; row--) {
        if (board[row].every(cell => cell !== 0)) {
            board.splice(row, 1);
            board.unshift(Array(COLS).fill(0));
            linesCleared++;
            row++; // 同じ行を再チェック
        }
    }

    if (linesCleared > 0) {
        lines += linesCleared;
        score += [0, 100, 300, 500, 800][linesCleared] * level;
        level = Math.floor(lines / 10) + 1;
        dropInterval = Math.max(100, 1000 - (level - 1) * 100);
        updateScore();
    }
}

// スコアの更新
function updateScore() {
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    document.getElementById('lines').textContent = lines;
}

// 描画
function draw() {
    // メインキャンバスのクリア
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ボードの描画
    board.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                drawBlock(ctx, x, y, COLORS[value]);
            }
        });
    });

    // 現在のピースの描画
    if (currentPiece) {
        currentPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    drawBlock(ctx, currentPiece.x + x, currentPiece.y + y, COLORS[currentPiece.color]);
                }
            });
        });
    }

    // グリッドの描画
    ctx.strokeStyle = '#222';
    for (let x = 0; x <= COLS; x++) {
        ctx.beginPath();
        ctx.moveTo(x * BLOCK_SIZE, 0);
        ctx.lineTo(x * BLOCK_SIZE, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * BLOCK_SIZE);
        ctx.lineTo(canvas.width, y * BLOCK_SIZE);
        ctx.stroke();
    }

    // 次のピースの描画
    drawNextPiece();
}

// ブロックの描画
function drawBlock(context, x, y, color) {
    context.fillStyle = color;
    context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    context.strokeStyle = '#000';
    context.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);

    // ハイライト効果
    context.fillStyle = 'rgba(255, 255, 255, 0.3)';
    context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE / 2, BLOCK_SIZE / 2);
}

// 次のピースの描画
function drawNextPiece() {
    nextCtx.fillStyle = '#000';
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);

    if (nextPiece) {
        const offsetX = (4 - nextPiece.shape[0].length) / 2;
        const offsetY = (4 - nextPiece.shape.length) / 2;

        nextPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    drawBlock(nextCtx, offsetX + x, offsetY + y, COLORS[nextPiece.color]);
                }
            });
        });
    }
}

// ポーズの切り替え
function togglePause() {
    if (isGameOver) return;

    isPaused = !isPaused;
    document.getElementById('pause-btn').textContent = isPaused ? '再開' : 'ポーズ';

    if (!isPaused) {
        lastDropTime = Date.now();
    }
}

// ゲームのリセット
function resetGame() {
    if (gameLoop) {
        cancelAnimationFrame(gameLoop);
    }

    score = 0;
    level = 1;
    lines = 0;
    isPaused = false;
    isGameOver = false;
    currentPiece = null;
    nextPiece = null;

    initBoard();
    updateScore();
    draw();

    document.getElementById('start-btn').disabled = false;
    document.getElementById('pause-btn').disabled = true;
    document.getElementById('pause-btn').textContent = 'ポーズ';
}

// ゲームオーバー
function gameOver() {
    isGameOver = true;
    document.getElementById('start-btn').disabled = false;
    document.getElementById('pause-btn').disabled = true;

    // ゲームオーバー表示
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#FF0D72';
    ctx.font = 'bold 30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 20);

    ctx.fillStyle = '#FFF';
    ctx.font = '20px Arial';
    ctx.fillText(`スコア: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
}
