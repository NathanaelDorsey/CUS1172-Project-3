function getQuestionTemplate() {
    const templateScript = document.getElementById('question-template').innerHTML;
    return Handlebars.compile(templateScript);
}

window.getQuestionTemplate = getQuestionTemplate;