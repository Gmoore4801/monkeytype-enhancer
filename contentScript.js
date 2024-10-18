var correct = new Map();
var incorrect = new Map();
var spaces = 0;

var delayMultiplier = 1;
var off = false;
var postStats = false;

chrome.storage.local.get("checkboxes", result => {
    if (result.checkboxes[0]) off = true;
    if (result.checkboxes[1]) delayMultiplier = 2;
});

window.addEventListener('keypress', e => {
    if (off) return;
    let time = document.querySelector('.timeToday');
    let timeMinutes = time.innerText === null ? 0 : time.innerText.substr(3,2);
    let timeSeconds = time.innerText === null ? 0 : time.innerText.substr(6,2);
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

    const delay = ms => new Promise(res => setTimeout(res, ms * delayMultiplier));

    async function setCustomMode(language) {
        let letter = "a";
        if (!postStats) {
            let max = 0;
            let totalCorrect = 0;
            let totalIncorrect = 0;
            let data = [];
            for (let i = 0; i < 26; i++) {
                let l = String.fromCharCode(97 + i);
                let c = correct.get(l) == null ? 0 : correct.get(l);
                totalCorrect += c;
                let w = incorrect.get(l) == null ? 0 : incorrect.get(l);
                totalIncorrect += w;
                let percent = c + w == 0 ? null : Math.round(100 * c / (c + w));
                let total = c + w;
                let letterData = [l, percent, c, total];
                data.push(letterData);
                if (incorrect.get(l) > max) { letter = l; max = incorrect.get(l); }
            }
            
            let acc = Math.round(10000 * totalCorrect / (totalCorrect + totalIncorrect)) / 100;
            let date = new Date();
            let day = date.getDate();
            let month = date.getMonth() + 1;
            let year = date.getFullYear();
            let wpm = (totalCorrect + spaces) / (timeMinutes + timeSeconds / 60) * 2;
            let typingSessions;
            chrome.storage.local.get('typingSessions', result => {
                typingSessions = result.typingSessions || [];
                let newSession = {
                    date: `${month}/${day}/${year}`,
                    acc: acc,
                    wpm: wpm,
                    letter: letter,
                    data: data
                };
                typingSessions.push(newSession);
                chrome.storage.local.set({ typingSessions: typingSessions });
            });
            postStats = true;
        }
        document.querySelector('.textButton[mode="custom"]').click();
        document.querySelector('.customText .textButton').click();
        document.querySelector('.button.wordfilter').click();
        await delay(500);
        let list = document.querySelectorAll('.ss-list div');
        list.forEach(item => { if (item.innerText === language) item.click(); });
        document.querySelector('.wordIncludeInput').value = letter;
        document.querySelector('.wordExcludeInput').value = '-';
        document.querySelector('.setButton').click();
        await delay(200);
        document.querySelector('.buttonGroup [value="random"]').click();
        document.querySelector('.textarea').remove();
        document.querySelector('.buttonsTop').remove();
        document.querySelector('.challengeWarning').insertAdjacentHTML("afterend", `<h2>Select the test length (15 is recommended)</h2>`);
        
        document.querySelector('.group[data-id="fancy"]').remove();
        document.querySelector('.group[data-id="control"]').remove();
        document.querySelector('.group[data-id="delimiter"]').remove();
        document.querySelector('.group[data-id="newlines"]').remove();
        document.querySelector('.group[data-id="mode"]').remove();
        document.querySelector('.group[data-id="zeroWidth"]').remove();
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
        await delay(500);
        document.querySelector('.textButton[mode="time"]').click();
        await delay(500);
        document.querySelector('.view-settings').click();
        await delay(600);
        try {
            document.querySelector('.inputs [value="' + language + '"]').setAttribute("selected", "");
        }
        catch (error) {
            console.log(error);
        }
        document.querySelector('#startTestButton').click();
    }

    if (timeMinutes < 5) { setEnglish("english_5k"); }
    else if (timeMinutes < 10) { setCustomMode("english 5k"); }
    else if (timeMinutes < 13) { setEnglish("english_1k"); }
    else if (timeMinutes < 15) { setEnglish("english"); }
});


window.addEventListener('keypress', e => {
    if (off || e.key === "Enter") return;
    if (!document.getElementById("result").classList.contains("hidden")) return;
    if (document.querySelector('#customTextModal') !== null) return;
    if (e.key === " ") { spaces++; return; }

    const delay = ms => new Promise(res => setTimeout(res, ms * delayMultiplier));

    async function checkLetter() {
        let word = document.querySelector('.word.active');
        if (word === null) return;
        let lastLetterPos = word.querySelectorAll(".correct, .incorrect").length;
        await delay(1);
        let letter = word.children[lastLetterPos];
        if (letter === null) return;
        try {
            if (letter.classList.contains("correct")) {
                let last = correct.get(letter.innerText) == null ? 0 : correct.get(letter.innerText);
                correct.set(letter.innerText, last + 1);
            }
            else {
                let last = incorrect.get(letter.innerText) == null ? 0 : incorrect.get(letter.innerText);
                incorrect.set(letter.innerText, last + 1);
            }
        }
        catch (error) {
            console.log(error);
        }
    }
    
    checkLetter();
});