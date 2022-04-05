const open = document.getElementById('open');
const pop_up = document.getElementById('computer_vision_popup');
const close = document.getElementById('close');

open.addEventListener('click',()=>{
    pop_up.classList.add('show');
})

close.addEventListener('click',()=>{
    pop_up.classList.remove('show');
})