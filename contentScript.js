var correct = new Map();
var incorrect = new Map();

window.addEventListener('keypress', e => {
    let time = document.querySelector('.timeToday');
    let timeMinutes = time.innerText === null ? 0 : time.innerText.substr(3,2);
    let wait = false;
    const currentLang = document.querySelector('#testModesNotice .textButton').textContent;
    const currentMode = document.querySelector('.textButton[mode="custom"]').classList.contains("active") ? true : false;
    switch (true) {
        case (timeMinutes < 5):
            if (currentLang === "english 5k") wait = true;
            break;
        case (timeMinutes < 10):
            if (currentMode || document.querySelector('#customTextModal') !== null) wait = true;
            break;
        case (timeMinutes < 13):
            if (currentLang === "english 1k") wait = true;
            break;
        case (timeMinutes < 20):
            if (currentLang === "english") wait = true;
            break;
    }
    if (e.key !== "Enter" || wait) return;

    const delay = ms => new Promise(res => setTimeout(res, ms));

    async function setCustomMode(language) {
        let letter = "a";
        let max = 0;
        console.log("Your accuracy for each letter:");
        for (let i = 0; i < 26; i++) {
            let l = String.fromCharCode(97 + i);
            let c = correct.get(l) == null ? 0 : correct.get(l);
            let w = incorrect.get(l) == null ? 0 : incorrect.get(l);
            let percent = c + w == 0 ? null : Math.round(100 * c / (c + w));
            let total = c + w;
            console.log(l + ": " + percent + "%    " + c + "/" + total);
            if (incorrect.get(l) > max) { letter = l; max = incorrect.get(l); }
        }
        console.log("Changing test to focus on: " + letter);
        document.querySelector('.textButton[mode="custom"]').click();
        document.querySelector('.customText .textButton').click();
        document.querySelector('.button.wordfilter').click();
        await delay(500);
        let list = document.querySelectorAll('.ss-list div');
        list.forEach(item => {
            if (item.innerText === language) item.click();
        });
        document.querySelector('.wordIncludeInput').value = letter;
        document.querySelector('.wordExcludeInput').value = '-';
        document.querySelector('.setButton').click();
        await delay(150);
        document.querySelector('.buttonGroup [value="random"]').click();
        document.querySelector('.textarea').remove();
        document.querySelector('.buttonsTop').remove();
        document.querySelector('.challengeWarning').insertAdjacentHTML("afterend", `<h2>Select the test length (15 is recommended)</h2>`);
        
        document.querySelector('.group[data-id="fancy"]').remove();
        document.querySelector('.group[data-id="control"]').remove();
        document.querySelector('.group[data-id="delimiter"]').remove();
        document.querySelector('.group[data-id="newlines"]').remove();
        document.querySelector('.group[data-id="mode"]').remove();
        document.querySelector('.words').remove()
        document.querySelector('.or').remove()
        document.querySelector('.sections').remove()
        document.querySelector('.group .sub').remove()
        document.querySelector('.group .title').remove()
        document.querySelector('#customTextModal .modal').style.display = 'block';
        document.querySelector('.button.apply').style.width = '100%';
        document.querySelector('.button.apply').style.marginTop = '15px';
        document.querySelector('#customTextModal .modal').style.width = '400px';
        document.querySelector('.time').placeholder += " (seconds)";
        document.querySelector('.inputs').style.gridTemplateColumns = '1fr';
        await delay(100);
        document.querySelector('.time').select();
    }
    
    async function setEnglish(language) {
        await delay(300);
        document.querySelector('.textButton[mode="time"]').click();
        document.querySelector('.view-settings').click();
        await delay(600);
        document.querySelector('.inputs [value="' + language + '"]').setAttribute("selected", "");
        document.querySelector('#startTestButton').click();
    }

    if (timeMinutes < 5) { setEnglish("english_5k"); }
    else if (timeMinutes < 10) { setCustomMode("english 5k"); }
    else if (timeMinutes < 13) { setEnglish("english_1k"); }
    else if (timeMinutes < 20) { setEnglish("english"); }
});


window.addEventListener('keypress', e => {
    if (e.key === " " || e.key === "Enter" || document.querySelector('.word.active') == null) return;

    const delay = ms => new Promise(res => setTimeout(res, ms));

    async function checkLetter() {
        let word = document.querySelector('.word.active');
        if (word === null) return;
        let lastLetterPos = word.querySelectorAll(".correct, .incorrect").length;
        await delay(1);
        let letter = word.children[lastLetterPos];
        if (letter.classList.contains("correct")) {
            let last = correct.get(letter.innerText) == null ? 0 : correct.get(letter.innerText);
            correct.set(letter.innerText, last + 1);
        }
        else {
            let last = incorrect.get(letter.innerText) == null ? 0 : incorrect.get(letter.innerText);
            incorrect.set(letter.innerText, last + 1);
        }
    }
    
    checkLetter();
});