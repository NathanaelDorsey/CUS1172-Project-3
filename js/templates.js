function getQuestionTemplate() {
    console.log(document.getElementById('question-template'));
    let templateScript = document.getElementById('question-template').innerHTML;
    console.log(templateScript);
    return Handlebars.compile(templateScript);
}
