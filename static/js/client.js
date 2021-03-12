var commentsElement = document.querySelectorAll('#comments-field > div > div.box');
for (var i = 0; i < commentsElement.length; i += 1) {
    commentsElement[i].setAttribute('id', `comment${i + 1}`);
}
document.querySelector(window.location.hash).scrollIntoView({ behavior: 'smooth' });

function openModal(id) {
    var element = document.getElementById(id);
    element.setAttribute('class', 'modal is-active');
}

function closeModal(id) {
    var element = document.getElementById(id);
    element.setAttribute('class', 'modal');
}
