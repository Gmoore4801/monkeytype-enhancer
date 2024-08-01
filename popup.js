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

function displaySessionData(index) {
    let dataTab = document.getElementsByClassName("data")[0];
    dataTab.classList.remove("hidden");
    dataTab.click();
    document.getElementsByClassName(dataTab.classList[0])[0].classList.remove("hidden");

    document.getElementById("data").innerHTML = '';
    let table = document.createElement('table');
    table.setAttribute("id", "session-stats");
    document.getElementById("data").append(table);
    let tableHead = table.createTHead();
    let row = tableHead.insertRow();
    row.insertCell(0).outerHTML = "<th>Letter</th>";
    row.insertCell(1).outerHTML = "<th>Accuracy</th>";
    row.insertCell(2).outerHTML = "<th>Correct/Total</th>";

    let tableBody = table.createTBody();

    chrome.storage.local.get('typingSessions', result => {
        let typingSessions = result.typingSessions;
        typingSessions[typingSessions.length-index-1].data.forEach(letterStats => {
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

const info = document.getElementsByClassName("info")[0];
const stats = document.getElementsByClassName("stats")[0];
const faqs = document.getElementsByClassName("faqs")[0];

document.addEventListener("DOMContentLoaded", () => {
    populateTable();
    
    const info = document.getElementsByClassName("info")[0];
    const stats = document.getElementsByClassName("stats")[0];
    const faqs = document.getElementsByClassName("faqs")[0];
    const data = document.getElementsByClassName("data")[0];
    info.addEventListener("click", () => { slider(info) });
    stats.addEventListener("click", () => { slider(stats) });
    faqs.addEventListener("click", () => { slider(faqs) });
    data.addEventListener("click", () => { slider(data) });

    let dataTab = document.getElementsByClassName("data")[0];
    if (!dataTab.classList.contains("active") && !dataTab.classList.contains("hidden")) dataTab.classList.add("hidden");
});