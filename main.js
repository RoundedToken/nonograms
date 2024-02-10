import data from './data.json';
import './style.css';
import './normalise.css';
import './grid/grid.css';
import './header/header.css';
import './menu/menu.css';
import './modal/modal.css';
import { Menu } from './menu/menu';

let callback = [];

export function startMenu() {
    window.removeEventListener('resize', callback[0]);
    const bodyElem = document.body;
    const menu = new Menu(data);

    bodyElem.innerText = '';

    menu.createHomeLayout(callback);
}

startMenu();
