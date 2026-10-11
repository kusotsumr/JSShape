const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
ctx.translate(canvas.width / 2, canvas.height / 2);
ctx.scale(1, -1);

async function loadResults() {
    const response = await fetch("/fcgi-bin/hello-world.jar", {
        method: "GET",
    });
    if (!response.ok) {
        console.log("Ошибка" + response.status);
        return
    }
    const data = await response.json();

    document.querySelector("#resultsTable tbody").innerHTML = "";
    for (const item of data.results) {
        const parts = item.split(",");

        const x = Number(parts[0]);
        const y = Number(parts[1]);
        const r = Number(parts[2]);
        const hit = parts[3] === "true";
        const serverTime = new Date(Number(parts[4])).toLocaleString("ru-RU");
        const execMs = Number(parts[5]).toFixed(3);

        addResultRow(x, y, r, hit, serverTime, execMs);
    }
}

function drawFigure(r) {
    ctx.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);

    r = 37 * (Math.log10(r) + 2);

    //фигруа
    ctx.fillStyle = "#d158b3";
    ctx.beginPath();
    ctx.moveTo(0,-r/2);
    ctx.lineTo(-r, -r/2);
    ctx.lineTo(-r,0);
    ctx.lineTo(0,0);
    ctx.lineTo(0,r);
    ctx.arc(0,0,r,Math.PI /2,0, true);
    ctx.lineTo(r/2, 0)
    ctx.lineTo(0, -r);
    ctx.lineTo(0,-r/2);
    ctx.fill();

    //координаты
    const axisEnd =  Math.min(canvas.width, canvas.height) / 2 * 0.9;
    ctx.fillStyle = "#000000";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-axisEnd, 0);
    ctx.lineTo(axisEnd, 0);
    ctx.moveTo(0, -axisEnd);
    ctx.lineTo(0, axisEnd);
    ctx.stroke();


    //стрелки
    ctx.beginPath();
    ctx.moveTo(axisEnd, 0);
    ctx.lineTo(axisEnd - 8, -4);
    ctx.lineTo(axisEnd - 8, 4);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, axisEnd);
    ctx.lineTo(-4, axisEnd - 8);
    ctx.lineTo(4, axisEnd - 8);
    ctx.closePath();
    ctx.fill();

    //gпалки
    function drawTickX(x) {
        ctx.beginPath();
        ctx.moveTo(x, -5);
        ctx.lineTo(x, 5);
        ctx.stroke();
    }
    function drawTickY(y) {
        ctx.beginPath();
        ctx.moveTo(-5, y);
        ctx.lineTo(5, y);
        ctx.stroke();
    }
    drawTickX(r); drawTickX(r/2); drawTickX(-r); drawTickX(-r/2);
    drawTickY(r); drawTickY(r/2); drawTickY(-r); drawTickY(-r/2);

    ctx.save();
    ctx.scale(1, -1);
    ctx.font = "12px sans-serif";
    ctx.fillText("R", r - 5, 15);
    ctx.fillText("R/2", r/2 - 8, 15);
    ctx.fillText("-R", -r - 12, 15);
    ctx.fillText("-R/2", -r/2 - 14, 15);
    ctx.fillText("R", 8, -r);
    ctx.fillText("R/2", 8, -r/2);
    ctx.fillText("-R", 8, r + 12);
    ctx.fillText("-R/2", 8, r/2 + 12);
    ctx.restore();
}

//////////////
function addResultRow(x, y, r, hit, serverTime, execMs) {
    const tbody = document.querySelector("#resultsTable tbody");
    const row = document.createElement("tr");
    row.className = hit ? "row-hit" : "row-not-hit";

    const values = [x, y, r, hit ? "Входит" : "Не входит", serverTime, execMs];
    for (const value of values) {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.appendChild(cell);
    }
    tbody.appendChild(row);
}

function updateSubmitState() {
    const submitButton = document.getElementById("Change");
    const rHint = document.getElementById("r-hint");
    if (selectedR === '') {
        submitButton.disabled = true;
        rHint.style.display = "inline";
    } else {
        rHint.style.display = "none";
        submitButton.disabled = false;
    }
}
///////////
drawFigure(5);
loadResults();
//////////////
let selectedX = '';
const xButtons = document.querySelectorAll('.x-btn');
xButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        xButtons.forEach(function (other) {
            other.classList.remove("selected");
        });
        button.classList.add("selected");

        selectedX = button.dataset.value;
    });
});

const yInput = document.getElementById("y-input");

const rCheckboxes = document.querySelectorAll('input[name="r"]');
let selectedR = '';
rCheckboxes.forEach(function (checkbox) {
    checkbox.addEventListener("change", function () {
        rCheckboxes.forEach(function (other) {
            if (checkbox.checked) {
                selectedR = checkbox.value;
            } else {
                selectedR = '';
            }

            if (other !== checkbox) {
                other.checked = false;
            }
        });
        updateSubmitState();
    });
});

//////////////
const form = document.getElementById("pointForm");
form.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (selectedX === '') {
        alert("Отметь икс пожалуста");
        return;
    }

    if (selectedR === '') {
        alert("Отметь R пожалуста");
        return;
    }

    const yText = yInput.value.trim();
    if (yText === "" || isNaN(Number(yText))) {
        alert("Y должен быть числом");
        return;
    }
    const x = Number(selectedX);
    const y = Number(yText);
    const r = Number(selectedR);

    if (y < -3 || y > 3) {
        alert("Привет игрик должен быть от -3 до 3");
        return;
    }

    if (isNaN(x) || isNaN(y) || isNaN(r)) {
        console.log("Ошибка: введены некорректные данные");
        return;

    }

    const response = await fetch("/fcgi-bin/hello-world.jar", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            x: x,
            y: y,
            r: r
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        alert("Ошибка сервера: " + errorText);
        return;
    }

    ctx.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
    drawFigure(r);

    await loadResults();
})