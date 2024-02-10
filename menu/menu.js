import { Grid } from '../grid/grid';
import { createHeader, getTime } from '../header/header';
import allData from '../data.json';

let cb;
export class Menu {
    constructor(data) {
        this.data = data;
    }

    createHomeLayout(callback) {
        cb = callback;
        const bodyElem = document.body;
        const levels = Object.entries(this.data);
        const levelsContainerElem = document.createElement('div');
        const sizes = ['5 x 5', '10 x 10', '15 x 15'];
        const lastGamesElem = document.createElement('div');
        const isLastGames = !!JSON.parse(localStorage.getItem('games'));
        const lastGames = isLastGames
            ? JSON.parse(localStorage.getItem('games'))
            : [{ name: 'Here will be your results' }];
        const lastGamesTitleElem = document.createElement('span');

        lastGamesTitleElem.className = 'level';
        lastGamesTitleElem.innerText = 'Best of the last 5';
        lastGamesElem.className = 'level-wrapper';

        levelsContainerElem.className = 'levels';

        createHeader(bodyElem);
        bodyElem.appendChild(levelsContainerElem);

        levelsContainerElem.appendChild(lastGamesElem);
        lastGamesElem.appendChild(lastGamesTitleElem);

        lastGames
            .sort((a, b) => a.time - b.time)
            .forEach(({ name, time, level }) => {
                const gameResultElem = document.createElement('div');
                const timeElem = document.createElement('div');
                const levelElem = document.createElement('div');
                const nameElem = document.createElement('div');

                gameResultElem.className = 'game-result';
                levelElem.className = `level__${level}`;

                nameElem.innerText = name;
                if (isLastGames) {
                    timeElem.innerText = getTime(time);
                    levelElem.innerText = level.toUpperCase();
                }

                gameResultElem.append(nameElem);

                if (isLastGames) {
                    gameResultElem.append(levelElem, timeElem);
                }

                lastGamesElem.appendChild(gameResultElem);
            });

        levels.forEach((level, i) => {
            const [levelDiff, levelData] = level;
            const levelElem = document.createElement('div');
            const levelWrapperElem = document.createElement('div');

            levelWrapperElem.className = 'level-wrapper';
            levelElem.className = `level level__${levelDiff}`;
            levelElem.innerText = `${levelDiff.toUpperCase()} ${sizes[i]}`;
            levelsContainerElem.appendChild(levelWrapperElem);
            levelWrapperElem.appendChild(levelElem);

            for (const levelItem of levelData) {
                const levelItemElem = document.createElement('div');

                levelItemElem.className = 'level__item hov';
                levelItemElem.innerText = levelItem.name;
                levelWrapperElem.appendChild(levelItemElem);
                levelItemElem.addEventListener('click', () => startGame(levelItem));
            }
        });
    }
}

export function startGame(data, isSave = false, isRandom = false) {
    const seconds = isSave ? Number(localStorage.getItem('seconds')) || 0 : 0;
    let timerId = [];
    if (isRandom) data = randomPicture(allData);
    const grid = new Grid(data, isSave);
    const bodyElem = document.body;
    const gridElem = grid.getGridElem();
    const previewElem = grid.getPreviewElem();
    const container = document.createElement('div');
    const wrapper = document.createElement('div');
    const level = data.level || localStorage.getItem('level');
    wrapper.className = 'wrapper';
    container.className = `game-container game-container_${level}`;

    bodyElem.innerHTML = '';

    const gameBarElem = createHeader(bodyElem, seconds, timerId, data.name, false);

    bodyElem.append(wrapper);
    wrapper.append(container);

    container.append(previewElem, gridElem);

    cb[0] = grid.appendDigits(container);

    grid.appendHintElem(gameBarElem);

    if (isSave) {
        grid.restoreGame();
    }

    grid.addListeners(timerId);
}

function randomPicture(data) {
    const levels = Object.keys(data);
    const level = levels[Math.floor(Math.random() * levels.length)];
    const pictures = data[level];
    const picture = pictures[Math.floor(Math.random() * pictures.length)];

    return {
        name: picture.name,
        matrix: picture.matrix,
    };
}
