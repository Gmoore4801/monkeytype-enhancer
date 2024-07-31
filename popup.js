function populateTableHead() {
    let table = document.getElementById('stats')
    let tableHead = table.createTHead();
    tableHead.innerHTML = '';

    let row = tableHead.insertRow();
    row.insertCell(0).outerHTML = "<th>Date</th>";
    row.insertCell(1).outerHTML = "<th>Accuracy</th>";
    row.insertCell(2).outerHTML = "<th>WPM</th>";
}

function populateTable() {
    let table = document.getElementById('stats')
    let tableBody = table.createTBody();

    chrome.storage.local.get('typingSessions', result => {
        let typingSessions = result.typingSessions || [];
        if (typingSessions.length !== 0) populateTableHead();
        else document.getElementById('no-stats').textContent = "Check back here later once you have completed a session.";

        tableBody.innerHTML = '';

        typingSessions.slice().reverse().forEach(session => {
            let row = tableBody.insertRow();
            row.insertCell(0).textContent = session.date;
            row.insertCell(1).textContent = session.acc;
            row.insertCell(2).textContent = session.wpm;
        });
    });
}

populateTable();  