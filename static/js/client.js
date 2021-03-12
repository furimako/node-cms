var commentsElement = document.querySelectorAll('#comments-field > div > div.box');
if (commentsElement) {
    for (var i = 0; i < commentsElement.length; i += 1) {
        commentsElement[i].setAttribute('id', `comment${i + 1}`);
    }

    var hash = window.location.hash;
    var hashElement = false;
    if (hash) {
        hashElement = document.querySelector(hash);
    }
    if (hashElement) {
        hashElement.scrollIntoView();
    }
}

function openModal(id) {
    var element = document.getElementById(id);
    element.setAttribute('class', 'modal is-active');
}

function closeModal(id) {
    var element = document.getElementById(id);
    element.setAttribute('class', 'modal');
}
