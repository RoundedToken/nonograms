import backArrowSrc from '../assets/back-arrow.svg';
import playIconSrc from '../assets/play-icon.svg';
import { startMenu } from '../main';
import { startGame } from '../menu/menu';
import { getThemeSwitcherElem } from '../theme/theme';
import randomImg from '../assets/random.svg';
import soundOffSrc from '../assets/sound-off.svg';
import soundOnSrc from '../assets/sound-on.svg';
import { audioCtx, newAudio } from '../grid/grid';

export function createHeader(
    container,
    sec,
    timerId,
    name = localStorage.getItem('name'),
    isMenu = true
) {
    const headerElem = document.createElement('header');
    const headerTitleElem = document.createElement('h1');
    const timerElem = document.createElement('div');
    const toMenuElem = document.createElement('button');
    const backArrow = document.createElement('img');
    const toMenuTextElem = document.createElement('span');
    const continuePlayElem = document.createElement('button');
    const playIconElem = document.createElement('img');
    const playTextElem = document.createElement('span');
    const themeSwitcherElem = getThemeSwitcherElem();
    const gameBarElem = document.createElement('div');
    const randomGameElem = document.createElement('button');
    const time = localStorage.getItem('seconds');
    const hasLocalStorage = !!localStorage.getItem('matrix');
    const randomTextElem = document.createElement('div');
    const randomImgElem = document.createElement('img');
    const soundOnElement = document.createElement('img');
    const soundOffElement = document.createElement('img');
    const soundContainerElement = document.createElement('div');
    let isSound = localStorage.getItem('isSound') === 'true' ?? true;

    if (isSound) {
        newAudio();
    } else {
        audioCtx.close();
    }

    soundOnElement.src = soundOnSrc;
    soundOffElement.src = soundOffSrc;
    soundOffElement.className = 'icon hov';
    soundOnElement.className = 'icon hov';
    soundOnElement.style.display = isSound ? 'block' : 'none';
    soundOffElement.style.display = isSound ? 'none' : 'block';
    soundContainerElement.className = 'sound-container';

    randomGameElem.className = 'random-game hov ';
    randomTextElem.innerText = 'Random game';
    randomImgElem.src = randomImg;
    randomImgElem.className = 'icon';
    randomGameElem.append(randomImgElem, randomTextElem);

    headerElem.className = 'header';
    container.appendChild(headerElem);

    headerTitleElem.className = 'header__title';
    headerTitleElem.innerText = isMenu ? 'Nonograms' : name;

    timerElem.className = 'timer';
    timerElem.id = 'timer';
    timerElem.innerText = getTime(sec);

    backArrow.className = 'back-arrow icon';
    backArrow.src = backArrowSrc;

    playIconElem.className = 'play-icon icon';
    playIconElem.src = playIconSrc;

    playTextElem.innerText = 'Continue game';
    continuePlayElem.className = 'continue-play hov';
    continuePlayElem.setAttribute('data-tooltip', `${name} ${getTime(time)}`);
    continuePlayElem.setAttribute('data-position', 'bottom');
    continuePlayElem.append(playTextElem, playIconElem);

    toMenuTextElem.innerText = 'Back to menu';
    toMenuElem.className = 'to-menu hov button';
    toMenuElem.append(backArrow, toMenuTextElem);
    toMenuElem.addEventListener('click', () => {
        clearInterval(timerId[0]);
        startMenu();
    });

    gameBarElem.className = 'game-bar';

    if (!isMenu) {
        gameBarElem.append(timerElem, themeSwitcherElem, soundContainerElement);
        headerElem.appendChild(toMenuElem);
        headerElem.appendChild(headerTitleElem);
        headerElem.appendChild(gameBarElem);
        soundContainerElement.append(soundOnElement, soundOffElement);

        soundOnElement.addEventListener('click', () => {
            localStorage.setItem('isSound', 'false');
            soundOnElement.style.display = 'none';
            soundOffElement.style.display = 'block';
            audioCtx.close();
        });

        soundOffElement.addEventListener('click', () => {
            localStorage.setItem('isSound', 'true');
            soundOffElement.style.display = 'none';
            soundOnElement.style.display = 'block';
            newAudio();
        });
    } else {
        gameBarElem.appendChild(randomGameElem);
        hasLocalStorage && gameBarElem.appendChild(continuePlayElem);
        headerElem.appendChild(themeSwitcherElem);
        headerElem.appendChild(headerTitleElem);
        headerElem.appendChild(gameBarElem);

        continuePlayElem.addEventListener('click', () => {
            startGame('', true);
        });

        randomGameElem.addEventListener('click', () => {
            startGame('', false, true);
        });
    }

    return gameBarElem;
}

export function getTime(seconds) {
    const min = String(Math.floor(seconds / 60)).padStart(2, '0');
    const sec = String(seconds % 60).padStart(2, '0');

    return `${min} m : ${sec} s`;
}

export function startTimer(isSave = true) {
    const timerElem = document.getElementById('timer');
    let seconds = isSave ? localStorage.getItem('seconds') : 0;

    return setInterval(() => {
        seconds++;
        const time = getTime(seconds);
        timerElem.innerText = time;
        localStorage.setItem('currentSeconds', String(seconds));
    }, 1000);
}
