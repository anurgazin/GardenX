var burgerMenu = document.querySelector('.hamburger-menu');
var menu = document.querySelector('.menu');
var popUpBackground = document.querySelector('.pop-up-background');
var popUpMenu = document.querySelector('.pop-up-content');
var htmlBody = document.querySelector('body');
var menuLoginButton = document.querySelector('#menuLoginButton');
var closePopUp = document.querySelector('#closePopUp');


function unsetVisibilityMenu () {
    gsap.set(menu, {visibility: 'hidden',opacity: 1});
}
function unsetVisibilityPopUp () {
    gsap.set(popUpMenu, {visibility: 'hidden',opacity: 1});
}
function setVisibilityPopUp () {
    gsap.set(popUpMenu, {visibility: 'visible'});
}

burgerMenu.addEventListener('click', () => {
    var menuOpen = menu.style.visibility === 'hidden';
    //errorMessage.innerText = "";
    if(menuOpen) {
        gsap.from(menu, {
            y: -16,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.inOut'
        });
        gsap.set(menu, {visibility: 'visible'});
    } else {
        gsap.to(menu, {
            y: 0,
            opacity: 0,
            duration: 0.5,
            ease: 'power3.inOut',
            onComplete: unsetVisibilityMenu
        });
    }
})
if(menuLoginButton) {
    menuLoginButton.addEventListener('click', () => {
        console.log('menuLogin clicked!');
        var popUpClosed = popUpBackground.style.visibility == 'hidden' && popUpMenu.style.visibility == 'hidden';
        if(popUpClosed) {
            console.log('here');
            gsap.to(menu, {
                y: 0,
                opacity: 0,
                duration: 0.5,
                ease: 'power3.inOut',
                onComplete: unsetVisibilityMenu
            });
            gsap.to(popUpBackground, {
                visibility: 'visible'
            });
            gsap.set(popUpMenu, { visibility: 'visible', opacity: 1});
            gsap.from(popUpMenu, {
                delay: 0.3,
                y: 50,
                opacity: 0,
                duration: 1,
                ease: 'power3.inOut'
            })
            htmlBody.style.overflow = 'hidden';
        }
    });    
}

if(closePopUp) {
    closePopUp.addEventListener('click', () => {
        console.log('close clicked');
        var popUpOpen = popUpBackground.style.visibility == 'visible' && popUpMenu.style.visibility == 'visible';
        if(popUpOpen) {
            gsap.to(popUpMenu, {
                y: 50,
                opacity: 0,
                duration: 0.5,
                ease: 'power3.inOut',
                onComplete: unsetVisibilityPopUp
            });
            gsap.set(popUpBackground, {visibility: 'hidden'});
            htmlBody.style.overflow = 'visible';
        }
    })
}
