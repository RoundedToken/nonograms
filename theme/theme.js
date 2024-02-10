import sunSrc from '../assets/sun.svg';
import moonSrc from '../assets/moon.svg';

export function getThemeSwitcherElem() {
    const bodyElem = document.body;
    const sunElem = document.createElement('img');
    const moonElem = document.createElement('img');
    let theme = localStorage.getItem('theme') || 'app-light';

    bodyElem.id = theme;

    sunElem.className = 'icon icon-small';
    sunElem.src = sunSrc;
    moonElem.className = 'icon icon-small';
    moonElem.src = moonSrc;

    const themeSwitcherElem = document.createElement('button');
    themeSwitcherElem.className = 'theme-switcher hov';
    themeSwitcherElem.appendChild(theme === 'app-light' ? moonElem : sunElem);

    themeSwitcherElem.addEventListener('click', () => {
        const newTheme = theme === 'app-light' ? 'app-dark' : 'app-light';

        localStorage.setItem('theme', newTheme);
        themeSwitcherElem.innerText = '';
        themeSwitcherElem.appendChild(newTheme === 'app-light' ? moonElem : sunElem);
        bodyElem.id = newTheme;
        theme = newTheme;
    });

    return themeSwitcherElem;
}
