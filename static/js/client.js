function openModal(id) {
    var element = document.getElementById(id);
    element.setAttribute('class', 'modal is-active');
}

function closeModal(id) {
    var element = document.getElementById(id);
    element.setAttribute('class', 'modal');
}
