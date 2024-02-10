import { getTime } from '../header/header';
import { startMenu } from '../main';

export function modal({ time, name }) {
    const bodyElem = document.body;
    const modalWrapperElem = document.createElement('div');
    const modalElem = document.createElement('div');
    const toMenuElem = document.querySelector('.to-menu').cloneNode(true);
    const winResultElem = document.createElement('div');
    const winTitleElem = document.createElement('div');
    const beforeElem = document.createElement('div');
    const afterElem = document.createElement('div');
    const pyroElem = document.createElement('div');

    toMenuElem.className = 'to-menu hov';
    beforeElem.className = 'before';
    afterElem.className = 'after';
    pyroElem.className = 'pyro';
    pyroElem.append(afterElem, beforeElem);

    toMenuElem.addEventListener('click', startMenu);

    modalWrapperElem.className = 'modal-wrapper';
    modalElem.className = 'modal';
    winResultElem.className = 'win-result';
    winTitleElem.className = 'win-title';

    winTitleElem.innerText = 'You win!';
    winResultElem.innerText = `Great! You have solved the ${name}  nonogram in ${time} seconds!`;

    bodyElem.appendChild(modalWrapperElem);
    modalWrapperElem.append(modalElem, pyroElem);
    modalElem.append(winTitleElem, winResultElem, toMenuElem);
}
