const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
ctx.translate(canvas.width / 2, canvas.height / 2);
ctx.scale(1, -1);

function drawFigure(r) {
    ctx.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);

    r = 37 * (Math.log10(r) + 2);

    //фигруа
    ctx.fillStyle = "#d158b3";
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.lineTo(-r/2, 0);
    ctx.lineTo(-r/2,r);
    ctx.lineTo(0,r);
    ctx.arc(0,0,r,Math.PI /2,0, true);
    ctx.lineTo(0, -r/2);
    ctx.lineTo(0,0);
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
drawFigure(5);

//////////////
function isInRectangle(x,y,r) {
    return x >= -r/2 && x <= 0 && y >=0 && y <= r;
}
function isInCircle(x,y,r) {
    return x >=0 && x*x + y*y <= r*r && y >= 0;
}
function isInTriangle(x,y,r) {
    return x <= r && x >= 0 && y <= 0 && y >= -r/2 && y >= x/2 - r/2;
}

function isInFigure(x, y, r) {
    return isInRectangle(x, y, r) || isInCircle(x, y, r) || isInTriangle(x, y, r);
}

function addResultRow(x, y, r, hit, dateText) {
    const tbody = document.querySelector("#resultsTable tbody");
    const row = document.createElement("tr");
    row.className = hit ? "row-hit" : "row-not-hit";

    const xCell = document.createElement("td");
    xCell.textContent = x;
    row.appendChild(xCell);

    const yCell = document.createElement("td");
    yCell.textContent = y;
    row.appendChild(yCell);

    const rCell = document.createElement("td");
    rCell.textContent = r;
    row.appendChild(rCell);

    const hitCell = document.createElement("td");
    hitCell.textContent = hit ? "Входит" : "Не входит";
    row.appendChild(hitCell);

    const dataCell = document.createElement("td");
    dataCell.textContent = dateText;
    row.appendChild(dataCell);
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
let results = [];

const saved = localStorage.getItem("catlab-s501985-results");
if (saved !== null) {
    results = JSON.parse(saved);
    for (const item of results) {
        addResultRow(item.x, item.y, item.r, item.hit, item.dateText);
    }
}

//////////////
const xCheckboxes = document.querySelectorAll('input[name="x"]');
let selectedCheckbox = '';
xCheckboxes.forEach(function (checkbox) {
    checkbox.addEventListener("change", function () {
        xCheckboxes.forEach(function (other) {
            if (checkbox.checked) {
                selectedCheckbox = checkbox.value;
            } else {
                selectedCheckbox = '';
            }

            if (other !== checkbox) {
                other.checked = false;
            }
        });

    });
});

const yInput = document.getElementById("y-input");

let selectedR = '';
const rButtons = document.querySelectorAll('.r-btn');
rButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        rButtons.forEach(function (other) {
            other.classList.remove("selected");
        });
        button.classList.add("selected");

        selectedR = button.dataset.value;
        updateSubmitState(selectedR);
    });
});

//////////////
const form = document.getElementById("pointForm");
form.addEventListener("submit", function (event) {
    event.preventDefault();

    const x = Number(selectedCheckbox);
    const y = Number(yInput.value);
    const r = Number(selectedR);

    if (selectedCheckbox === '') {
        alert("Отметь икс пожалуста");
        return
    }

    if (y < -3 || y > 5) {
        alert("Привет игрик должен быть от -3 до 5");
        return;
    }

    if (isNaN(x) || isNaN(y) || isNaN(r)) {
        console.log("Ошибка: введены некорректные данные");
        return;

    }
    ctx.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
    drawFigure(r);


    const hit = isInFigure(x, y, r);
    console.log("Точка попала в фигуру:", hit);

    const now = new Date();
    const formatter = new Intl.DateTimeFormat("ru-RU",{
        dateStyle: "medium",
        timeStyle: "medium",
    });
    const formatted = formatter.format(now);

    addResultRow(x, y, r,hit, formatted);

    const resultObj = {x: x, y: y, r: r, hit: hit, dateText: formatted};
    results.push(resultObj);
    localStorage.setItem("catlab-s501985-results", JSON.stringify(results));
})