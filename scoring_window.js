const numberOfCheckpoint = 10;
const allowSend = true;

var isOutlineA = false;
var isOutlineB = false;
var isDoneA = false;
var isDoneB = false;
var flagUpdateTeam = true;
var teamA = null;
var teamB = null;
var cp_indexA = 1;
var cp_indexB = 1;
var time = null;

winnerNoti.style.display = 'none';
winnerTeam.style.innerHTML = '';

teamA = {
	name: 'Team A',
	controller: "controllerA",
	school: "schoolA",
	score: 0,
	time: '00:00.000'
}

teamB = {
	name: 'Team B',
	controller: "controllerB",
	school: "schoolB",
	score: 0,
	time: '00:00.001'
}

// Window onload
/*
	Message: 	Time -> T|10.123
				CP -> C.A.02|10.123
				Outline -> O.A|10.123
*/
window.onload = function () {
	GetCurrentTeam();
	if (!allowSend) return;
	
	window.robotWindow = webots.window("scoring_window");
	window.robotWindow.receive = function (value, robot) {
		if (value.length == 0) return;
		let arr = value.split('|');
		let flag = arr[0];
		let time = arr[1];

		UpdateStopwatch(FormatTime(time));

		if ((isDoneB && isDoneA) || (isOutlineA && isOutlineB)) return;

		let newArr = flag.split('.');
		if (newArr[0] == "C") {
			updateCPindex(newArr[1], parseInt(newArr[2]));
			DemoPass(newArr[1]);
		}
		else if (newArr[0] == "O") {
			DemoOutline(newArr[1]);
		}
	}
}

// Auto generate check point
function GenerateCheckpoint(element, teamab) {
	for (var i = numberOfCheckpoint; i >= 1; i--) {
		var checkpoint = document.createElement("div");
		var cp_id = teamab + "cp" + i;

		checkpoint.setAttribute("class", "checkpoint not-pass");
		checkpoint.setAttribute("id", cp_id);

		var cp_name = document.createElement("h4");
		cp_name.innerHTML = "CP " + i;

		var cp_time = document.createElement("h4");
		var time_id = teamab + "cp-time" + i;
		cp_time.setAttribute("id", time_id);
		cp_time.innerHTML = "--:--.---";
		checkpoint.appendChild(cp_name);
		checkpoint.appendChild(cp_time);

		element.prepend(checkpoint);
	}
}
GenerateCheckpoint(newGenCP1, "A");
GenerateCheckpoint(newGenCP2, "B");

// Functions
function SendMessage(message) {
	if (allowSend == true) {
		window.robotWindow.send(message);
	}
}

function updateCPindex(teamab, index) {
	if (teamab == 'A') cp_indexA = index;
	else if (teamab == 'B') cp_indexB = index;
}

function FormatTime(strTime) {
	let arr = strTime.split(".");

	let min = (parseInt(arr[0]) / 60).toString().split('.')[0];
	let sec = (parseInt(arr[0]) % 60).toString();
	let miSec = arr[1].substring(0, 3);

	if (min.length < 2)
		min = "0" + min;
	if (sec.length < 2)
		sec = "0" + sec;

	let time = min + ":" + sec + "." + miSec;
	return time;
}

function UpdateStopwatch(time) {
	stopwatch_time.innerHTML = time;
}

function UpdateTeam(str) {
	if (flagUpdateTeam) {
		json = JSON.parse(str);
		teamA.name = json.teamA.name;
		teamA.controller = json.teamA.controller;
		teamA.school = json.teamA.school;
		
		teamB.name = json.teamB.name;
		teamB.controller = json.teamB.controller;
		teamB.school = json.teamB.school;

		teamName1.innerHTML = teamA.name;
		controller1.innerHTML = teamA.controller;
		school1.innerHTML = teamA.school;
		teamName2.innerHTML = teamB.name;
		controller2.innerHTML = teamB.controller;
		school2.innerHTML = teamB.school;

		SendMessage(teamA.controller + " " + teamB.controller);
		flagUpdateTeam = false;
	}
}

function GetCurrentTeam() {
	var xmlHttp = new XMLHttpRequest();
	var URL = `http://localhost:8081/currentteam`;
	xmlHttp.open("GET", URL);
	xmlHttp.send(null);
	flagUpdateTeam = true;
	xmlHttp.onreadystatechange = (e) => {
		var str = xmlHttp.responseText;
		if (str.length != 0) {
			UpdateTeam(str);
		}
	}
}

// Button click
function LoadPrevious() {
	var xmlHttp = new XMLHttpRequest();
	var URL = `http://localhost:8081/previousteam`;
	xmlHttp.open("GET", URL);
	xmlHttp.send(null);
	flagUpdateTeam = true;
	xmlHttp.onreadystatechange = (e) => {
		var str = xmlHttp.responseText;
		if (str.length != 0) {
			UpdateTeam(str);
		}
	}
}

function LoadNext() {
	var xmlHttp = new XMLHttpRequest();
	var URL = `http://localhost:8081/nextteam`;
	xmlHttp.open("GET", URL);
	xmlHttp.send(null);
	flagUpdateTeam = true;
	xmlHttp.onreadystatechange = (e) => {
		var str = xmlHttp.responseText;
		if (str.length != 0) {
			UpdateTeam(str);
		}
	}
}

function LoadSwap() {
	// var t = teamA;
	// teamA = teamB;
	// teamB = t;

	// teamName1.innerHTML = teamA.name;
	// controller1.innerHTML = teamA.controller;
	// teamName2.innerHTML = teamB.name;
	// controller2.innerHTML = teamB.controller;

	var xmlHttp = new XMLHttpRequest();
	var URL = `http://localhost:8081/swap`;
	xmlHttp.open("GET", URL);
	xmlHttp.send(null);
	flagUpdateTeam = true;
	xmlHttp.onreadystatechange = (e) => {
		var str = xmlHttp.responseText;
		if (str.length != 0) {
			UpdateTeam(str);
		}
	}
	// SendMessage(teamA.controller + " " + teamB.controller);
}

function LoadStart() {
	SendMessage("start");
	LoadReset();
}

function LoadReset() {
	// SendMessage("reset");

	ResetCheckpoint("A");
	ResetCheckpoint("B");

	resultScore1.innerHTML = 0;
	resultTime1.innerHTML = "--:--.---";
	resultScore2.innerHTML = 0;
	resultTime2.innerHTML = "--:--.---";
	winnerNoti.style.display = 'none';
	winnerTeam.style.innerHTML = '';
	saveDB.innerHTML = "Save"

	isOutlineA = false;
	isOutlineB = false;
	isDoneA = false;
	isDoneB = false;

	cp_indexA = 1;
	cp_indexB = 1;
	teamA.score = 0; teamA.time = '00:00.000';
	teamB.score = 0; teamB.time = '00:00.000';
}

function ResetCheckpoint(teamab) {
	for (var index = 1; index <= numberOfCheckpoint; index++) {
		// update status
		var id = teamab + "cp" + index;
		document.getElementById(id).setAttribute("class", "checkpoint not-pass");
		// update time
		var time = "--:--.---";
		var time_id = teamab + "cp-time" + index;
		document.getElementById(time_id).innerHTML = time;
	}
}

function SaveResult2DB() {
	saveDB.innerHTML = "Saved"
	var xmlHttp = new XMLHttpRequest();
	var URL = `http://localhost:8081/savedb?teamA=${JSON.stringify(teamA)}&teamB=${JSON.stringify(teamB)}`;
	xmlHttp.open("GET", URL);
	xmlHttp.send(null);
	xmlHttp.onreadystatechange = (e) => {
		console.log(xmlHttp.responseText);
	}
}

function SetCheckPointPassed(teamab, index) {
	if (index > numberOfCheckpoint) return;
	// update status
	var id = teamab + "cp" + index;
	document.getElementById(id).setAttribute("class", "checkpoint pass");
	// update time
	var time_id = teamab + "cp-time" + index;
	time = stopwatch_time.innerHTML;
	document.getElementById(time_id).innerHTML = time;
}

function DemoPass(req) {
	if (req == "A") {
		SetCheckPointPassed("A", cp_indexA);
		teamA.time = time;
		teamA.score = cp_indexA;
		if (cp_indexA == numberOfCheckpoint) isDoneA = true;
		cp_indexA++;
	}
	else if (req == "B") {
		SetCheckPointPassed("B", cp_indexB);
		teamB.time = time;
		teamB.score = cp_indexB;
		if (cp_indexB == numberOfCheckpoint) isDoneB = true;
		cp_indexB++;
	}

	console.log(isDoneA + "  "+ isDoneB);

	SetDone();
}

function Outline(teamab, current_cp) {
	for (var index = current_cp + 1; index <= numberOfCheckpoint; index++) {
		var id = teamab + "cp" + index;
		document.getElementById(id).setAttribute("class", "checkpoint outline");
	}

	if (teamab == "A") {
		resultScore1.innerHTML = teamA.score;
		resultTime1.innerHTML = teamA.time;
		isOutlineA = true;
	}
	else if (teamab == "B") {
		resultScore2.innerHTML = teamB.score;
		resultTime2.innerHTML = teamB.time;
		isOutlineB = true;
	}

}

function DemoOutline(req) {
	var cp_index = (req == "A" ? cp_indexA : cp_indexB);
	Outline(req, cp_index - 1);
	SetDone();
}

function SetDone() {
	if (isOutlineA || isDoneA) {
		resultScore1.innerHTML = teamA.score;
		resultTime1.innerHTML = teamA.time;
	}

	if (isOutlineB || isDoneB) {
		resultScore2.innerHTML = teamB.score;
		resultTime2.innerHTML = teamB.time;
	}

	if ( (isDoneA && isDoneB) || (isOutlineB && isOutlineA) || (isDoneA && isOutlineB) || (isDoneB && isOutlineA)) {
		if (teamA.score > teamB.score) {
			winnerTeam.innerHTML = teamA.name + " WIN";
		}
		else if (teamA.score < teamB.score) {
			winnerTeam.innerHTML = teamB.name + " WIN";
		}
		else {
			if (teamA.time < teamB.time) {
				winnerTeam.innerHTML = teamA.name + " WIN";
			}
			else if (teamA.time > teamB.time) {
				winnerTeam.innerHTML = teamB.name + " WIN";
			}
			else {
				winnerTeam.innerHTML = "EQUAL";
			}
		}
		winnerNoti.style.display = 'block';
	}
}