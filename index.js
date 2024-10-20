async function fetchJsonData(path) {
    let object
    await fetch(path)
        .then((res) => {
            if (!res.ok) throw new Error(`JSON Error! Status: " ${res.status}`)
            else return res.json()
        })
        .then((data) => {
            console.log(data);
            object = data;
        })
    return object;
}

async function getRandomQuestion() {

    let quizJsonUrlObject = await fetchJsonData("data/paths.json")

    console.log("here is the object" + quizJsonUrlObject)

    const quizJsonURL = quizJsonUrlObject["paths"][Math.floor(Math.random() * quizJsonUrlObject["paths"].length)]

    //"./data/Auto/Aborder des lieux particuliers/1 - un carrefour/comment-s-approcher-d-un-carrefour-1.json",
    let UrlParts = quizJsonURL.split("/")
    let course = UrlParts[2];
    let chapter = UrlParts[3];
    let topic = UrlParts[4];
    let lesson = UrlParts[5].substring(0,UrlParts[5].length-4);

    let quizData = await fetchJsonData(quizJsonURL);

    let randomQuestion = quizData.pageProps.quiz.exerciseListData[Math.floor(Math.random() * quizData.pageProps.quiz.exerciseListData.length)].questionsData[0];

    let randomQuestionAssets = randomQuestion.okulusAssets;
    let randomQuestionImageSrc = null;
    for (let asset of randomQuestionAssets) {
        let filetype = asset.mime;
        if (filetype.startsWith("image")) randomQuestionImageSrc = asset.s3swhUrl;
    }

    let question = {};
    question.chapter = chapter;
    question.topic = topic;
    question.text = randomQuestion.text;

    question.explanation = randomQuestion.explanation.text.substring(3, randomQuestion.explanation.text.length - 4);
    question.imageSRC = randomQuestionImageSrc;
    let questionPossibleAnswers = [];
    let questionIndex
    for (let i = 0; i < randomQuestion.possibleAnswers.length; i++) {
        questionPossibleAnswers[i] = {};
        questionPossibleAnswers[i].text = randomQuestion.possibleAnswers[i].text;
        questionPossibleAnswers[i].isCorrect = randomQuestion.possibleAnswers[i].isCorrect;
    }
    question.possibleAnswers = questionPossibleAnswers;

    return question;
}


async function generateQuestion() {
    const container = document.getElementById("questionContainer");
    container.innerHTML = "<div id=\"imageContainer\" class='d-flex flex-column align-items-center mb-3'>" +
        "<h5 id=\"chapter\"></h5>" +
        "    <img id=\"image\" src=\"\" alt=\"questionImage\" class='col-sm-12'>" +
        "</div>" +
        "<div id=\"answersContainer\">" +
        "    <h3 id=\"questionText\"></h3>\n" +
        "    <div id=\"answers\"></div>\n" +
        "    <span id=\"explanation\" hidden=\"hidden\"></span>" +
        "</div>"


    // Fetch data from the Node.js server
    await getRandomQuestion()
        .then(data => {
            console.log(data);
            const chapterText = document.getElementById("chapter");
            chapterText.innerText = data.chapter + " : " + data.topic;

            const questionText = document.getElementById("questionText");
            questionText.innerText = data.text;

            const image = document.getElementById("image");
            image.src = data.imageSRC;

            const explanation = document.getElementById("explanation");
            explanation.innerText = data.explanation;

            let answerCount = 1;
            const answers = document.getElementById("answers");
            for (const answer of data.possibleAnswers) {

                let letter;
                switch (answerCount) {
                    case 1:
                        letter = "A";
                        break;
                    case 2:
                        letter = "B";
                        break;
                    case 3:
                        letter = "C";
                        break;
                }

                let button = document.createElement("button");
                button.classList.add("answer");
                button.classList.add("btn");
                button.classList.add("btn-light");
                button.classList.add("border-secondary")
                button.classList.add("col-sm-12");
                button.classList.add("col-lg-12");
                button.classList.add("p-4")
                button.classList.add((answer.isCorrect) ? "correct" : "wrong")

                button.onclick = () => {
                    if (button.classList.contains("wrong")) {
                        explanation.hidden = false;
                        button.classList.add("red");
                    } else {
                        button.classList.add("green");
                    }
                }

                let answerButtonLabel = document.createElement("label");
                button.innerHTML = "<strong translate=\"no\">" + letter + ".</strong>" + " " + answer.text;
                answers.appendChild(button);
                answerCount++;
            }

        })
        .catch(error => console.error('Error fetching data:', error));


}

generateQuestion();

const nextQuestionButton = document.getElementById("nextQuestionButton");
nextQuestionButton.onclick = () => {
    generateQuestion();
}
