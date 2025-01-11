let editor;

document.addEventListener("DOMContentLoaded", function () {
  const codeMirrorWrapper = document.getElementById("codemirror-wrapper"); //Initialize CodeMirror with basic setup and JavaScript mode
  editor = CodeMirror(codeMirrorWrapper, {
    mode: "javascript", // JavaScript mode
    lineNumbers: true, // Show line numbers
    autoCloseBrackets: true, // Auto close brackets
    matchBrackets: true, // Match brackets
    lineWrapping: true, // Enable line wrapping
    placeholder: "Écrivez votre solution ici…", // Placeholder text
  });
});

// Challenge loading
let challengeIndex;
let levelNum;
let levelName;
let languageMode;

let answer;

let jsonData;

// Populate interface
fetchJSON(document.baseURI + "data/challenges/challenges.json?v=2").then(
  (data) => {
    populate(data);
  }
);

function populate(data) {
  jsonData = data;
  if (!localStorage.getItem("progress-model")) {
    // Storage reset
    localStorage.setItem("ch-index", "0");
    localStorage.setItem("lv-num", "1");
    localStorage.setItem("lang-mode", "js");
    // Choose challenge variations and create default progress model object
    let progressModel = {
      L1: [],
      L2: [],
      L3: [],
    };
    let challengeModel = {
      pasteEvents: 0,
      exitEvents: 0,
      code: "",
      attempts: 0,
      solved: false,
    };
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < data[`L${i + 1}`].length; j++) {
        // Choose variation
        let thisChallengeModel = structuredClone(challengeModel);
        thisChallengeModel["variation"] = Math.floor(
          Math.random() * data[`L${i + 1}`][j]["prompts"].length
        );
        progressModel[`L${i + 1}`].push(thisChallengeModel);
      }
    }
    localStorage.setItem("progress-model", JSON.stringify(progressModel));
    localStorage.setItem(
      "progress-model-unmodified",
      JSON.stringify(progressModel)
    );
    window.location.reload();
  } else {
    // Show help if no progress has been made
    if (
      localStorage.getItem("progress-model") ===
      localStorage.getItem("progress-model-unmodified")
    ) {
      document.getElementById("help").showModal();
    }
    // Load the current challenge
    challengeIndex = parseInt(localStorage.getItem("ch-index"), 10);
    levelNum = parseInt(localStorage.getItem("lv-num"), 10);
    switch (levelNum) {
      case 1:
        levelName = "L1";
        break;
      case 2:
        levelName = "L2";
        break;
      case 3:
        levelName = "L3";
        break;
      default:
        throw new Error("Invalid level index");
    }
    languageMode = localStorage.getItem("lang-mode");
  }
  let progress = JSON.parse(localStorage.getItem("progress-model"));
  // Set answer
  answer =
    data[levelName][challengeIndex]["answers"][
      progress[levelName][challengeIndex]["variation"]
    ];
  // Show question in question box
  document.getElementById("question-text").innerHTML = data[levelName][
    challengeIndex
  ]["prompts"][progress[levelName][challengeIndex]["variation"]].replace(
    "\n",
    "<br>"
  );
  // Show code in CodeMirror
  editor.setValue(progress[levelName][challengeIndex]["code"]);
  // Show progress
  document.getElementById("level-stat").textContent = `Niveau ${levelNum}/3`;
  document.getElementById("challenge-stat").textContent = `Défi ${
    challengeIndex + 1
  }/${data[levelName].length}`;
  // Calculate progress bar value
  let solvedCount = 0;
  let totalCount = 0;
  for (let challenge of progress["L1"]
    .concat(progress["L2"])
    .concat(progress["L3"])) {
    if (challenge["solved"]) {
      solvedCount += 1;
    }
    totalCount += 1;
  }
  document.getElementById("progress-bar").value = solvedCount / totalCount;
  // Set language mode
  document.getElementById("language-selector").value =
    localStorage.getItem("lang-mode");
  // Generate level picker
  let L1Optgroup = document.createElement("optgroup");
  L1Optgroup.label = "Niveau 1";
  for (challenge of data["L1"]) {
    let optionElement = document.createElement("option");
    let emoji = progress["L1"][data["L1"].indexOf(challenge)]["solved"]
      ? "✅"
      : "❌";
    optionElement.textContent = `${emoji} Défi ${
      data["L1"].indexOf(challenge) + 1
    }`;
    optionElement.value = `L1,${data["L1"].indexOf(challenge)}`;
    L1Optgroup.appendChild(optionElement);
  }
  let L2Optgroup = document.createElement("optgroup");
  L2Optgroup.label = "Niveau 2";
  for (challenge of data["L2"]) {
    let optionElement = document.createElement("option");
    let emoji = progress["L2"][data["L2"].indexOf(challenge)]["solved"]
      ? "✅"
      : "❌";
    optionElement.textContent = `${emoji} Défi ${
      data["L2"].indexOf(challenge) + 1
    }`;
    optionElement.value = `L2,${data["L2"].indexOf(challenge)}`;
    L2Optgroup.appendChild(optionElement);
  }
  let L3Optgroup = document.createElement("optgroup");
  L3Optgroup.label = "Niveau 3";
  for (challenge of data["L3"]) {
    let optionElement = document.createElement("option");
    let emoji = progress["L3"][data["L3"].indexOf(challenge)]["solved"]
      ? "✅"
      : "❌";
    optionElement.textContent = `${emoji} Défi ${
      data["L3"].indexOf(challenge) + 1
    }`;
    optionElement.value = `L3,${data["L3"].indexOf(challenge)}`;
    L3Optgroup.appendChild(optionElement);
  }
  document.getElementById("challenge-picker").appendChild(L1Optgroup);
  document.getElementById("challenge-picker").appendChild(L2Optgroup);
  document.getElementById("challenge-picker").appendChild(L3Optgroup);
  // Choose corresponding option
  document.getElementById(
    "challenge-picker"
  ).value = `${levelName},${challengeIndex}`;
}

async function main() {
  const pyodide = await loadPyodide();
  try {
    pyodide.runPython(editor.getValue());
  } catch (e) {
    console.error(e);
  }
}

function run(lang) {
  if (lang === "py") {
    main();
  } else if (lang === "js") {
    try {
      eval(editor.getValue());
    } catch (e) {
      console.error(e);
    }
  } else {
    throw new Error("Invalid language selection");
  }
}

document.getElementById("code-actions").onsubmit = (e) => {
  // Check answer
  if (
    document
      .getElementById("console")
      .textContent.replace("\n", "")
      .trim()
      .toLowerCase() === answer.replace("\n", "").trim().toLowerCase()
  ) {
    alert("Bonne réponse!");
    let progress = JSON.parse(localStorage.getItem("progress-model"));
    progress[levelName][challengeIndex]["solved"] = true;
    localStorage.setItem("progress-model", JSON.stringify(progress));
    window.location.reload();
  } else {
    alert("Mauvaise réponse…");
  }
};

document.getElementById("run").onclick = () => {
  saveEditorContents();
  document.getElementById("console").innerHTML = "";
  run(document.getElementById("language-selector").value);
};

document.getElementById("save").onclick = () => {
  saveEditorContents();
  alert("Sauvegarde effectuée!");
};

document.getElementById("language-selector").onchange = (e) => {
  let langName;
  switch (e.target.value) {
    case "js":
      langName = "javascript";
      break;
    case "py":
      langName = "python";
      break;
  }
  editor.setOption("mode", langName);
  localStorage.setItem("lang-mode", e.target.value);
};

document.getElementById("challenge-picker").onchange = (e) => {
  let lv_num = e.target.value[1];
  let ch_index = e.target.value.split(",")[1];
  localStorage.setItem("lv-num", lv_num);
  localStorage.setItem("ch-index", ch_index);
  window.location.reload();
};

document.getElementById("submit-report").onclick = (e) => {
  document.getElementById("report").showModal();
  document.getElementById("report-textarea").value =
    "-----BEGIN REPORT-----\n" +
    btoa(localStorage.getItem("progress-model")) +
    "\n-----END REPORT-----";
};

document.getElementById("get-help").onclick = () => {
  document.getElementById("help").showModal();
};

document.getElementById("get-about").onclick = () => {
  document.getElementById("about").showModal();
};

document.addEventListener("paste", function () {
  let progress = JSON.parse(localStorage.getItem("progress-model"));
  progress[levelName][challengeIndex]["pasteEvents"] += 1;
  localStorage.setItem("progress-model", JSON.stringify(progress));
});

document.addEventListener("blur", function () {
  let progress = JSON.parse(localStorage.getItem("progress-model"));
  progress[levelName][challengeIndex]["exitEvents"] += 1;
  localStorage.setItem("progress-model", JSON.stringify(progress));
});

async function fetchJSON(uri) {
  const response = await fetch(uri);
  return await response.json();
}

function saveEditorContents() {
  let progress = JSON.parse(localStorage.getItem("progress-model"));
  progress[levelName][challengeIndex]["code"] = editor.getValue();
  localStorage.setItem("progress-model", JSON.stringify(progress));
}
