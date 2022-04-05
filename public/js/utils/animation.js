const pop_up = document.getElementsByClassName('computer_vision_popup');
const close = document.getElementById('close');

close.addEventListener('click',()=>{
    pop_up[0].classList.remove('show');
})