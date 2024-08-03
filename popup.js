function populateTableHead() {
    let table = document.getElementById('stats-table')
    let tableHead = table.createTHead();
    tableHead.innerHTML = '';

    let row = tableHead.insertRow();
    row.insertCell(0).outerHTML = "<th>Date</th>";
    row.insertCell(1).outerHTML = "<th>Accuracy</th>";
    row.insertCell(2).outerHTML = "<th>WPM</th>";
    row.insertCell(3).outerHTML = "<th>Letter Tested</th>";
    row.insertCell(4).outerHTML = "<th>Session Data</th>";
}

function populateTable() {
    let table = document.getElementById('stats-table');
    let tableBody = table.createTBody();

    chrome.storage.local.get('typingSessions', result => {
        let typingSessions = result.typingSessions || [];
        if (typingSessions.length !== 0) populateTableHead();
        else document.getElementById('no-stats').textContent = "Check back here once you have completed a session.";

        tableBody.innerHTML = '';

        typingSessions.slice().reverse().forEach((session, i) => {
            let row = tableBody.insertRow();
            row.insertCell(0).textContent = session.date;
            row.insertCell(1).textContent = session.acc;
            row.insertCell(2).textContent = session.wpm;
            row.insertCell(3).textContent = session.letter;
            row.insertCell(4).outerHTML = '<td><button class="button" data-index="' + i + '">View Data</button></td>';

            const buttons = document.querySelectorAll(".button");
            const button = buttons[buttons.length-1];
            button.addEventListener("click", e => {
                displaySessionData(e.target.getAttribute("data-index"));
            });
        });
    });
}

function sortLetters(a, b) { //sorts based on the number of incorrect types
    if (a[3] - a[2] === b[3] - b[2]) return -1;
    else return (a[3] - a[2] < b[3] - b[2]) ? -1 : 1;
}

function displaySessionData(index) {
    let dataTab = document.getElementsByClassName("data")[0];
    dataTab.classList.remove("hidden");
    dataTab.click();
    document.getElementsByClassName(dataTab.classList[0])[0].classList.remove("hidden");

    let data = document.getElementById("data");
    data.innerHTML = '';
    let date = document.createElement('h2');
    chrome.storage.local.get('typingSessions', result => { date.innerText = result.typingSessions[result.typingSessions.length-index-1].date; });
    data.append(date);
    let acc = document.createElement('p');
    chrome.storage.local.get('typingSessions', result => { acc.innerText += "Accuracy: " + result.typingSessions[result.typingSessions.length-index-1].acc; });
    data.append(acc);
    let wpm = document.createElement('p');
    chrome.storage.local.get('typingSessions', result => { wpm.innerText += "WPM: " + result.typingSessions[result.typingSessions.length-index-1].wpm; });
    data.append(wpm);
    let letterTested = document.createElement('p');
    chrome.storage.local.get('typingSessions', result => { letterTested.innerText += "Letter Tested: " + result.typingSessions[result.typingSessions.length-index-1].letter; });
    data.append(letterTested);
    let table = document.createElement('table');
    table.setAttribute("id", "session-stats");
    data.append(table);
    let tableHead = table.createTHead();
    let row = tableHead.insertRow();
    row.insertCell(0).outerHTML = "<th>Letter</th>";
    row.insertCell(1).outerHTML = "<th>Accuracy</th>";
    row.insertCell(2).outerHTML = "<th>Correct/Total</th>";

    let tableBody = table.createTBody();

    chrome.storage.local.get('typingSessions', result => {
        let typingSessions = result.typingSessions;
        typingSessions[typingSessions.length-index-1].data.sort(sortLetters).reverse().forEach(letterStats => {
            row = tableBody.insertRow();
            row.insertCell(0).textContent = letterStats[0];
            row.insertCell(1).textContent = letterStats[1] === null ? '' : letterStats[1] + "%";
            row.insertCell(2).textContent = letterStats[2] + "/" + letterStats[3];
        });
    });
}


function slider(section) {
    const active = document.getElementsByClassName("active")[0];
    if (active === section) return;
    let dataTab = document.getElementsByClassName("data")[0];
    if (dataTab.classList.contains("active") && !dataTab.classList.contains("hidden")) dataTab.classList.add("hidden");
    active.classList.remove("active");
    document.getElementById(active.classList[0]).classList.add("hidden");
    section.classList.add("active");
    document.getElementById(section.classList[0]).classList.remove("hidden");
}

function settingsInit(settings) {
    chrome.storage.local.get("checkboxes", result => {
        let checkboxes = result.checkboxes || [false, false];
        for (let i = 0; i < checkboxes.length; i++) {
            if (checkboxes[i]) settings[i].setAttribute("checked", '');
        }
    });
}

function settingClicked(checkbox, index) {
    let checked = checkbox.checked ? true : false;
    chrome.storage.local.get("checkboxes", result => {
        let checkboxes = result.checkboxes || [false, false];
        checkboxes[index] = checked;
        chrome.storage.local.set({ checkboxes: checkboxes });
    });
}

function parseDate(dateStr) {
    const parts = dateStr.split('/');
    return new Date(parts[2], parts[0] - 1, parts[1]);
}

function streak() {
    chrome.storage.local.get('typingSessions', result => {
        let typingSessions = result.typingSessions || [];
        let lastDate = parseDate("4/1/2020");
        const oneDayInMs = 24 * 60 * 60 * 1000;
        let streak = 0;
        let maxStreak = 0;
        typingSessions.forEach(typingSession => {
            let date = parseDate(typingSession.date);
            if (date.getTime() - lastDate.getTime() === oneDayInMs) streak++;
            else if (date.getTime() - lastDate.getTime() > oneDayInMs) streak = 1;
            maxStreak = Math.max(maxStreak, streak);
            lastDate = date;
        });
        let today = new Date();
        let month = today.getMonth() + 1;
        let day = today.getDate();
        let year = today.getFullYear();
        today = month + "/" + day + "/" + year;
        today = parseDate(today);
        if (today.getTime() - parseDate(typingSessions[typingSessions.length-1].date).getTime() > oneDayInMs) streak = 0;
        document.getElementById("streak").innerHTML += streak + " days";
        document.getElementById("max-streak").innerHTML += maxStreak + " days";
    });
}


populateTable();
streak();

const info = document.getElementsByClassName("info")[0];
const stats = document.getElementsByClassName("stats")[0];
const faqs = document.getElementsByClassName("faqs")[0];
const settings = document.getElementsByClassName("settings")[0];
const data = document.getElementsByClassName("data")[0];
info.addEventListener("click", () => { slider(info) });
stats.addEventListener("click", () => { slider(stats) });
faqs.addEventListener("click", () => { slider(faqs) });
settings.addEventListener("click", () => { slider(settings) });
data.addEventListener("click", () => { slider(data) });

const off = document.getElementById("off");
off.addEventListener("click", () => { settingClicked(off, 0); });
const timing = document.getElementById("timing");
timing.addEventListener("click", () => { settingClicked(timing, 1); });
settingsInit([off, timing]);

let dataTab = document.getElementsByClassName("data")[0];
if (!dataTab.classList.contains("active") && !dataTab.classList.contains("hidden")) dataTab.classList.add("hidden");

chrome.storage.local.get("checkboxes", result => {
    if (result.checkboxes == null) chrome.storage.local.set({checkboxes: [false, false]}); // one false for each setting created
});