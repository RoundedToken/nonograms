import { startTimer } from '../header/header';
import eraseSound from '../assets/erase.mp3';
import drawSound from '../assets/draw.mp3';
import crossSound from '../assets/cross.mp3';
import { modal } from '../modal/modal';
import winSound from '../assets/win.mp3';
import { startGame } from '../menu/menu';
import saveImg from '../assets/save.svg';
import resetImg from '../assets/reset.svg';

export let audioCtx = new AudioContext();
export function newAudio() {
    audioCtx = new AudioContext();
}

export class Grid {
    constructor({ matrix, name, level }, isSave = false) {
        this.isSave = isSave;
        localStorage.setItem('currentSeconds', '0');
        this.data = { matrix, name, level };
        this.level = level || localStorage.getItem('level');
        this.isWin = false;
        this.timerId;
        this.totalPoints = 0;
        this.points = 0;
        this.isFirstClick = true;
        this.matrix = isSave ? JSON.parse(localStorage.getItem('originMatrix')) : matrix;
        this.size = this.matrix.length;
        this.name = isSave ? localStorage.getItem('name') : name;

        this.fieldCopy = isSave
            ? JSON.parse(localStorage.getItem('matrix'))
            : this.createEmptyMatrix();

        this.gridElem = document.createElement('div');
        this.gridElem.className = 'grid';
        this.gridElem.style.gridTemplateColumns = `repeat(${this.size / 5}, 1fr)`;

        this.previewElem = document.createElement('div');
        this.previewElem.className = 'preview';
        this.previewElem.style.gridTemplateColumns = `repeat(${this.size / 5}, 1fr)`;

        this.hintElem = document.createElement('button');
        this.hintElem.className = 'hint hov';
        this.hintElem.innerText = 'Show solution';

        let squareElems = this.createSquares('square');
        let previewSquareElems = this.createSquares('preview__square');

        squareElems.className = 'square';
        previewSquareElems.className = 'preview__square';

        this.gridElem.append(...squareElems);
        this.previewElem.append(...previewSquareElems);

        this.matrix.forEach((row, rowI) => {
            row.forEach((col, colI) => {
                const cellElem = document.createElement('div');
                const previewCellElem = document.createElement('div');
                const reverseInd = Math.floor(rowI / 5) * (this.size / 5) + Math.floor(colI / 5);

                cellElem.className = 'cell';
                previewCellElem.className = 'preview__cell';

                cellElem.id = `${rowI}:${colI}`;
                previewCellElem.id = `preview-cell-${rowI}:${colI}`;

                squareElems[reverseInd].appendChild(cellElem);
                previewSquareElems[reverseInd].appendChild(previewCellElem);

                if (col === 1) this.totalPoints++;
            });
        });

        if (!isSave) this.saveGameInit();
    }

    createSquares(className, size = (this.size / 5) ** 2) {
        return Array(size)
            .fill()
            .map(() => {
                const elem = document.createElement('div');
                elem.className = className;
                return elem;
            });
    }

    getGridElem() {
        return this.gridElem;
    }

    getPreviewElem() {
        return this.previewElem;
    }

    appendHintElem(container) {
        let isShown = false;
        const saveGameElem = document.createElement('button');
        const resetGameElem = document.createElement('button');
        const saveTextElem = document.createElement('div');
        const saveImgElem = document.createElement('img');
        const resetTextElem = document.createElement('div');
        const resetImgElem = document.createElement('img');

        resetTextElem.innerText = 'Reset';
        resetGameElem.className = 'reset-game button hov';
        saveGameElem.className = 'save-game button hov';
        saveTextElem.innerText = 'Save';
        resetImgElem.src = resetImg;
        saveImgElem.src = saveImg;
        resetImgElem.className = 'icon';
        saveImgElem.className = 'icon';

        container.append(resetGameElem, saveGameElem);
        resetGameElem.append(resetImgElem, resetTextElem);
        saveGameElem.append(saveImgElem, saveTextElem);

        resetGameElem.addEventListener('click', () => {
            clearInterval(this.timerId[0]);
            startGame(
                this.isSave
                    ? { matrix: this.matrix, name: this.name, level: localStorage.getItem('level') }
                    : this.data
            );
        });

        saveGameElem.addEventListener('click', () => {
            this.saveGame();
        });

        container.appendChild(this.hintElem);
        this.hintElem.addEventListener('click', () => {
            isShown = !isShown;

            this.matrix.forEach((row, rowI) => {
                row.forEach((col, colI) => {
                    const cellElem = document.getElementById(`${rowI}:${colI}`);
                    const previewCellElem = document.getElementById(`preview-cell-${rowI}:${colI}`);

                    if (isShown) {
                        this.hintElem.innerText = 'Hide solution';
                        if (col === 1) {
                            cellElem.classList.add('hint_active');
                            previewCellElem.classList.add('preview__hint_active');
                        }
                    } else {
                        this.hintElem.innerText = 'Show solution';
                        cellElem.classList.remove('hint_active');
                        previewCellElem.classList.remove('preview__hint_active');
                    }
                });
            });
        });
    }

    appendDigits(container) {
        const leftDigitsElem = document.createElement('div');
        const topDigitsElem = document.createElement('div');
        const { width, height } = document.querySelector('.cell').getBoundingClientRect();

        leftDigitsElem.className = 'left-digits';
        topDigitsElem.className = 'top-digits';
        leftDigitsElem.style.gridTemplateRows = `repeat(${this.size / 5}, 1fr);`;
        topDigitsElem.style.gridTemplateColumns = `repeat(${this.size / 5}, 1fr)`;

        const leftSquares = this.createSquares('digits-square', this.size / 5);
        leftSquares.forEach((sq) =>
            sq.append(
                ...Array(5)
                    .fill()
                    .map(() => {
                        const rowElem = document.createElement('div');

                        rowElem.className = 'square__row';
                        rowElem.style.gridTemplateColumns = `repeat(${Math.ceil(
                            this.size / 2
                        )}, auto)`;

                        return rowElem;
                    })
            )
        );
        const topSquares = this.createSquares('digits-square-top', this.size / 5);
        topSquares.forEach((sq) =>
            sq.append(
                ...Array(5)
                    .fill()
                    .map(() => {
                        const colElem = document.createElement('div');

                        colElem.className = 'square__col';
                        colElem.style.gridTemplateRows = `repeat(${Math.ceil(
                            this.size / 2
                        )}, auto)`;

                        return colElem;
                    })
            )
        );

        leftDigitsElem.append(...leftSquares);
        topDigitsElem.append(...topSquares);

        this.matrix.forEach((row, rowInd) => {
            const squareRowElem = leftSquares[Math.floor(rowInd / 5)].childNodes[rowInd % 5];
            let sum = 0;

            row.forEach((col, colI) => {
                if (col === 1) {
                    sum++;
                } else if (sum > 0) {
                    const cellElem = document.createElement('div');
                    cellElem.className = 'square__row__cell row';
                    cellElem.style.width = `${width - 2}px`;
                    cellElem.innerText = `${sum}`;
                    squareRowElem.appendChild(cellElem);

                    sum = 0;
                }
            });

            if (sum > 0) {
                const cellElem = document.createElement('div');
                cellElem.className = 'square__row__cell row';
                cellElem.style.width = `${width - 2}px`;
                cellElem.innerText = `${sum}`;
                squareRowElem.appendChild(cellElem);
            }
        });

        this.matrix.forEach((row, rowInd) => {
            const squareRowElem = topSquares[Math.floor(rowInd / 5)].childNodes[rowInd % 5];
            let sum = 0;

            row.forEach((col, colI) => {
                const value = this.matrix[colI][rowInd];
                if (value === 1) {
                    sum++;
                } else if (sum > 0) {
                    const cellElem = document.createElement('div');
                    cellElem.className = 'square__row__cell col';
                    cellElem.style.height = `${height - 2}px`;
                    cellElem.innerText = `${sum}`;
                    squareRowElem.appendChild(cellElem);

                    sum = 0;
                }
            });

            if (sum > 0) {
                const cellElem = document.createElement('div');
                cellElem.className = 'square__row__cell col';
                cellElem.style.height = `${height - 2}px`;
                cellElem.innerText = `${sum}`;
                squareRowElem.appendChild(cellElem);
            }
        });

        container.appendChild(leftDigitsElem);
        container.appendChild(topDigitsElem);

        const { width: leftW } = leftDigitsElem.getBoundingClientRect();
        const { height: topH } = topDigitsElem.getBoundingClientRect();
        const maxL = Math.max(leftW, topH);
        leftDigitsElem.style.width = `${maxL}px`;
        topDigitsElem.style.height = `${maxL}px`;

        window.addEventListener('resize', callback);

        function callback() {
            const { width, height } = document.querySelector('.cell').getBoundingClientRect();
            document.querySelectorAll('.row').forEach((el) => (el.style.width = `${width - 2}px`));
            document
                .querySelectorAll('.col')
                .forEach((el) => (el.style.height = `${height - 2}px`));
            leftDigitsElem.style.width = 'auto';
            topDigitsElem.style.height = 'auto';
            const { width: leftW } = leftDigitsElem.getBoundingClientRect();
            const { height: topH } = topDigitsElem.getBoundingClientRect();

            const maxL = Math.max(leftW, topH);
            leftDigitsElem.style.width = `${maxL}px`;
            topDigitsElem.style.height = `${maxL}px`;
        }

        return callback;
    }

    addListeners(timerId) {
        this.timerId = timerId;
        const cells = document.querySelectorAll('.cell');
        const grid = document.querySelector('.grid');
        let isMouseDown = false;
        let isDrawMode;
        let isEraseCross;
        let isEraseActive;
        let isLeftButton;
        let isRightButton;

        document.oncontextmenu = function () {
            return false;
        };

        cells.forEach((cell) => {
            cell.addEventListener('mousedown', (e) => {
                const elem = e.target;
                isMouseDown = true;
                isLeftButton = e.button === 0;
                isRightButton = e.button === 2;
                isDrawMode =
                    !elem.classList.contains('cell_active') &&
                    !elem.classList.contains('cell_cross');
                isEraseActive = elem.classList.contains('cell_active');
                isEraseCross = elem.classList.contains('cell_cross');

                if (isEraseActive || isEraseCross) {
                    grid.style.cursor = `url(/roundedtoken-JSFE2023Q4/nonograms/dist/erase-cursor.png), auto`;
                }

                draw(e);

                //Activate timer
                if (this.isFirstClick) {
                    this.isFirstClick = false;
                    timerId[0] = startTimer(this.isSave);
                }
            });

            cell.addEventListener('mousemove', (e) => {
                if (isMouseDown) {
                    draw(e);
                }
            });

            cell.addEventListener('mouseup', (e) => {
                isMouseDown = false;
                grid.style.cursor = `url(/roundedtoken-JSFE2023Q4/nonograms/dist/pencil-cursor.png), auto`;
            });
        });

        const draw = async (e) => {
            if (this.isWin) {
                e.stopImmediatePropagation();
                return;
            }

            const cellElem = e.target;
            const cellId = e.target.id;
            const [rowI, colI] = cellId.split(':');
            const previewCellElem = document.getElementById(`preview-cell-${cellId}`);
            const isActive = cellElem.classList.contains('cell_active');
            const isCross = cellElem.classList.contains('cell_cross');

            if (isDrawMode) {
                if (isLeftButton && !isCross) {
                    this.points++;
                    this.fieldCopy[rowI][colI] = 1;
                    cellElem.classList.add('cell_active');
                    previewCellElem.classList.add('preview__cell_active');
                    await playSound(drawSound);
                } else if (isRightButton && !isActive) {
                    this.fieldCopy[rowI][colI] = 2;
                    cellElem.classList.add('cell_cross');
                    await playSound(crossSound);
                }
            } else {
                if (isEraseActive && isLeftButton && !isCross) {
                    this.points--;

                    this.fieldCopy[rowI][colI] = 0;
                    cellElem.classList.remove('cell_active');
                    previewCellElem.classList.remove('preview__cell_active');
                    await playSound(eraseSound);
                } else if (isEraseCross && isRightButton && !isActive) {
                    this.fieldCopy[rowI][colI] = 0;
                    cellElem.classList.remove('cell_cross');
                    await playSound(eraseSound);
                }
            }

            if (this.isWin) {
                e.stopImmediatePropagation();
                return;
            }

            this.checkWinCondition();

            if (this.isWin) {
                e.stopImmediatePropagation();
                return;
            }
        };
    }

    saveGame() {
        let seconds = localStorage.getItem('currentSeconds') || 0;
        localStorage.setItem('matrix', JSON.stringify(this.fieldCopy));
        localStorage.setItem('level', this.level);
        localStorage.setItem('originMatrix', JSON.stringify(this.matrix));
        localStorage.setItem('name', this.name);
        localStorage.setItem('seconds', String(seconds));
    }

    saveGameInit() {
        // localStorage.setItem('originMatrix', JSON.stringify(this.matrix));
        // localStorage.setItem('name', this.name);
        // localStorage.setItem('seconds', '0');
        // localStorage.setItem('matrix', JSON.stringify(this.createEmptyMatrix()));
    }

    restoreGame() {
        this.fieldCopy.forEach((row, rowI) => {
            row.forEach((col, colI) => {
                const cellElem = document.getElementById(`${rowI}:${colI}`);
                const previewCellElem = document.getElementById(`preview-cell-${rowI}:${colI}`);

                if (col === 1) {
                    this.points++;
                    cellElem.classList.add('cell_active');
                    previewCellElem.classList.add('preview__cell_active');
                } else if (col === 2) {
                    cellElem.classList.add('cell_cross');
                }
            });
        });
    }

    createEmptyMatrix() {
        return Array(this.size)
            .fill()
            .map(() => Array(this.size).fill(0));
    }

    checkWinCondition() {
        let isWin = true;

        for (let rowI in this.fieldCopy) {
            for (let colI in this.fieldCopy[+rowI]) {
                const originCell = this.matrix[+rowI][+colI];
                const actualCell = this.fieldCopy[+rowI][+colI];

                if (originCell === 1 && actualCell !== 1) {
                    isWin = false;
                    break;
                } else if (originCell === 0 && actualCell === 1) {
                    isWin = false;
                    break;
                }
            }
        }

        if (isWin) {
            this.isWin = true;
            this.winGame();
        }
    }

    async winGame() {
        const time = localStorage.getItem('currentSeconds');
        const name = this.name;
        const lastGames = JSON.parse(localStorage.getItem('games')) || [];

        lastGames.push({ time, name, level: this.level });

        if (lastGames.length > 5) {
            lastGames.shift();
        }

        localStorage.setItem('games', JSON.stringify(lastGames));

        clearInterval(this.timerId[0]);

        // localStorage.removeItem('matrix');
        // localStorage.removeItem('name');
        // localStorage.removeItem('seconds');
        // localStorage.removeItem('originMatrix');

        modal({ time, name });

        // await audioCtx.close();
        // audioCtx = new AudioContext();

        setTimeout(async () => {
            await playSound(winSound);
        }, 1000);
    }
}

let isFirstPlay = true;
let isPlaying = false;

async function playSound(audioPath) {
    if (isPlaying) {
        return;
    }

    isPlaying = true;

    try {
        if (!isFirstPlay) {
            await sleep(150);
        }

        const response = await fetch(audioPath);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

        // Создаем источник
        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;

        // Подключаем и запускаем
        source.connect(audioCtx.destination);
        source.start();
    } finally {
        isPlaying = false;
    }

    isFirstPlay = false;
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
