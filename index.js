const cvs = document.getElementById("tetris");
const ctx = cvs.getContext("2d");
const scoreElement = document.getElementById("score");
const startBtn = document.getElementById("start");
const restoreBtn = document.getElementById("restore");
const title = document.getElementById("title");

const ROW = 20;
const COL = 10;
const SQ = 20;
const VACANT = 'WHITE';
    
function drewSqare(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x*SQ, y*SQ, SQ, SQ);
    ctx.strokeStyle = "GREY";
    ctx.strokeRect(x*SQ, y*SQ, SQ, SQ);
}
    
let board = [];
for(let i = 0; i < ROW; i++) {  
    board[i] = [];
    for(let j = 0; j < COL; j++) {
        board[i][j] = VACANT;
    }
}
    
function drawBoard() {
    for(let i = 0; i < ROW; i++) {
        for(let j = 0; j < COL; j++) {
            drewSqare(j, i, board[i][j]);
        }
    }
}
drawBoard();

startBtn.addEventListener('click', () => {
    startBtn.setAttribute('disabled', true);
    
    const pieces = [
        [Z, '#ede115'],
        [S, '#2fd420'],
        [T, '#20d4ce'],
        [O, '#2062d4'],
        [L, '#5c20d4'],
        [I, '#aa20d4'],
        [J, '#d4203b'],
    ];
    
    function generateRandomPiecePattern() {
        let randomNumber = Math.floor(Math.random() * pieces.length);
        return new Piece(pieces[randomNumber][0], pieces[randomNumber][1])
    }
    
    let p = generateRandomPiecePattern()
    
    function Piece(tetromino, color) {
        this.tetromino = tetromino;
        this.color = color;
    
        this.tetrominoPattern = 0;
        this.activeTetromino = this.tetromino[this.tetrominoPattern];
    
        this.x = 3;
        this.y = -2;
    }
    
    Piece.prototype.fill = function(color) {
        for(let i = 0; i < this.activeTetromino.length; i++) {
            for(let j = 0; j < this.activeTetromino.length; j++) {
                if(this.activeTetromino[i][j]) {
                    drewSqare(this.x + j, this.y + i, color);
                }
            }
        }
    };
    
    Piece.prototype.draw = function() {
        this.fill(this.color);
    };
    
    Piece.prototype.undraw = function() {
        this.fill(VACANT);
    };
    
    Piece.prototype.moveDown = function() {
        if(!this.checkCollision(0, 1, this.activeTetromino)) {
            this.undraw();
            this.y++;
            this.draw();
        } 
        else {
            this.lock();
            p = generateRandomPiecePattern()
        }
    };
    
    Piece.prototype.moveRight = function() {
        if(!this.checkCollision(1, 0, this.activeTetromino)) {
            this.undraw(); 
            this.x++;
            this.draw();
        }
    };
    
    Piece.prototype.moveLeft = function() {
        if(!this.checkCollision(-1, 0, this.activeTetromino)) {
            this.undraw();
            this.x--;
            this.draw();
        }
    };
    
    Piece.prototype.rotate = function() {
        let nextPattern = this.tetromino[(this.tetrominoPattern + 1) % this.tetromino.length];
        let kickWall = 0;
    
        if(this.checkCollision(0, 0, nextPattern)) {
            if(this.x > COL/2) {
                kickWall = -1;
            }
            else {
                kickWall = 1;
            }
        }
        if(!this.checkCollision(kickWall, 0, nextPattern)) {
            this.undraw();
            this.x += kickWall;
            this.tetrominoPattern = (this.tetrominoPattern + 1) % this.tetromino.length;
            this.activeTetromino = this.tetromino[this.tetrominoPattern];
            this.draw();
        }
    };
    
    Piece.prototype.checkCollision = function(x, y, piece) {
        for(let i = 0; i < piece.length; i++) {
            for(let j = 0; j < piece.length; j++) {
                if(!piece[i][j]) {
                    continue;
                }
                let newX = this.x + j + x;
                let newY = this.y + i + y;
    
                if(newX < 0 || newX >= COL || newY >= ROW) {
                    return true;
                }
                if(newY < 0) {
                    continue;
                }
                if(board[newY][newX] != VACANT) {
                    return true;
                }
            }
        }
        return false;
    };
    
    let score = 0;
    
    Piece.prototype.lock = function() {
        for(let i = 0; i < this.activeTetromino.length; i++) {
            for(let j = 0; j < this.activeTetromino.length; j++) {
                if(!this.activeTetromino[i][j]) {
                   continue;
                }
                if(this.y + i < 0) {
                    title.classList.add("active");
                    gameOver = true;
                    break;
                }
                board[this.y + i][this.x + j] = this.color;
            }
        }
        for(let i = 0; i < ROW; i++) {
            let isRowFull = true;
            for(let j = 0; j < COL; j++) {
                isRowFull = isRowFull && (board[i][j] != VACANT);
            }
            if(isRowFull) {
                for(let y = i; y > 1; y--) {
                    for(let j = 0; j < COL; j++) {
                        board[y][j] = board[y-1][j];
                    }
                }
                for(let j = 0; j < COL; j++) {
                    board[0][j] = VACANT;
                }
                score += 10;
            }
        }
        drawBoard();
        scoreElement.innerHTML = score;
    }
    
    document.addEventListener("keydown", control);
    
    function control(event) {
        const keyCode = event.keyCode;
        switch(keyCode) {
            case 37: 
                p.moveLeft();
                break;
            case 38: 
                p.rotate();
                break;
            case 39:  
                p.moveRight();
                break;
            case 40: 
                p.moveDown();
                break;
        }
    }
    
    let dropStart = Date.now();
    let gameOver = false;
    
    function drop() {
        let now = Date.now();
        let delta = now - dropStart;
        if(delta > 1000) {
            p.moveDown();
            dropStart = Date.now();
        }
        if(!gameOver) {
            requestAnimationFrame(drop);
        }
    }
    
    drop();
    return
})

restoreBtn.addEventListener('click', () => {
    location.reload();
});
