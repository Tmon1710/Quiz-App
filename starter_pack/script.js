// // TODO(you): Write the JavaScript necessary to complete the assignment.

//get the DOM elements
const btnStart = document.querySelector(".start")
const btnSubmit = document.querySelector(".submit")
const btnAgain = document.querySelector(".try-again")
const startPage = document.querySelector("#introduction")
const attemptPage = document.querySelector("#attempt-quiz")
const reviewPage = document.querySelector("#review-quiz")
const btnSubmitContainer = document.querySelector(".submit-container")
async function callAPI(){
    let response = await fetch(" https://wpr-quiz-api.herokuapp.com/attempts",
    {
        method: "POST"
    })
    return response.json();
}
async function submitAPI(answerPack, packId){
    let response =  await fetch(`https://wpr-quiz-api.herokuapp.com/attempts/${packId}/submit`,
    {
        method: "POST",
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify(answerPack)
    })
    return await response.json();
}
function renderQuestionList(){
    callAPI().then((res) => {
        questionContainer = createNewTag("div",["question-container"],res._id,"")
        for(question of res.questions){
            questionContainer.appendChild(createQuestion(res.questions.indexOf(question),question))
        }
        attemptPage.prepend(questionContainer);
    })
}

function createQuestion(qIndex, question){
    questionBox = createNewTag("div", ["question"], question._id)
    questionNo = createNewTag("h2")
    questionNo.innerHTML = `Question ${qIndex + 1} of 10`
    questionTxt = createNewTag("p", [],"",question.text)
    answerList = createNewTag("div", ["answer-list"])
    for(answer of question.answers){
        label = createNewTag("label", ["answer"])
        input = createNewTag("input")
        input.name = question._id;
        input.type = "radio"
        input.id = question.answers.indexOf(answer)
        // input.addEventListener("change", highlight(this.event));
        span = createNewTag("span")
        content = document.createTextNode(answer);
        label.appendChild(input)
        label.appendChild(span)
        label.appendChild(content)
        answerList.appendChild(label)
    }
    questionBox.appendChild(questionNo)
    questionBox.appendChild(questionTxt)
    questionBox.appendChild(answerList)
    return questionBox;
}
function createNewTag(tagName, classes = [], id = "", content=""){
    let newTag = document.createElement(tagName);
    for(cls of classes){
        newTag.setAttribute("class", cls)
    }
    newTag.id = id;
    newTag.innerHTML = content
    return newTag
}
function getUserAnswer(){
    let answerPack ={
        "answers":{
            
        }
    }
    const answerList = document.querySelectorAll(".answer")
    answerList.forEach(e => {
        inp = e.querySelector("input")
        if(inp.checked == true){
            answerPack["answers"][inp.name] = inp.id;
        }
    })
    return answerPack
}
function renderResult(res){

    //hight correct and incorrect answer
    for(const [key, value] of Object.entries(res.correctAnswers)){
        inps = document.getElementsByName(key)
        inps[value].nextSibling.classList.add("selected")
        inps[value].parentNode.appendChild(assginLabel(true))
        for(inp of inps){
            if(inp.checked === true && parseInt(inp.id) === value){
                inp.nextSibling.classList.add("isCorrect")
            }else if(inp.checked === true && inp.id != value){
                inp.parentNode.appendChild(assginLabel(false))
                inp.nextSibling.classList.add("isWrong")
            }
        }
        //display result
        document.querySelector(".score").innerHTML = `${res.score}/10`
        document.querySelector(".percent").innerHTML = `${res.score == 0 ? '' : res.score}0%`
        document.querySelector(".score-text").innerHTML = res.scoreText
    }   
}
function assginLabel(isCorrect){
    return createNewTag("p", [], "", isCorrect ? "Correct answer" : "Your answer")

}
function disableInput(){
    document.querySelectorAll("input").forEach(e => e.disabled = true)
}
btnStart.addEventListener("click", () => {
    renderQuestionList();
    startPage.classList.add("hidden")
    attemptPage.classList.remove("hidden")
})
btnSubmit.addEventListener("click", () => {
    if(confirm("Do you want to submit your asnwer")){
        disableInput()
        answerPack = getUserAnswer();
        packId = document.querySelector(".question-container").id;
        console.log(answerPack)
        submitAPI(answerPack, packId).then(res => {
            renderResult(res);
            cloneResult = document.querySelector(".question-container").cloneNode(true)
            reviewPage.prepend(cloneResult)
        })
    }
    attemptPage.classList.add("hidden")
    reviewPage.classList.remove("hidden")
})
btnAgain.addEventListener("click", () => {
    startPage.classList.remove("hidden")
    btnSubmitContainer.classList.remove("hidden")
    reviewPage.classList.add("hidden")
    attemptPage.querySelector(".question-container").remove()
    reviewPage.querySelector(".question-container").remove()
})