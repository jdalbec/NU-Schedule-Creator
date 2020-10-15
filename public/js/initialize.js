"use strict";
let date = new Date();
let year = date.getFullYear();
document.querySelector('.footer_legal').innerHTML = year + " " + window.location.hostname;
						// On October 1st, swap default semester selection from fall to spring
if (date >= new Date(year, "09", "01")) {
	document.getElementById("spring-semester").setAttribute("checked", true);
} else {
	document.getElementById("fall-semester").setAttribute("checked", true);
}

						// March 1st, years update
if (date >= new Date(year, "02", "01")) {
	document.querySelector("label[for='earlier-year']").innerHTML =  "" + year + " - " + (year + 1);
	document.querySelector("label[for='later-year']").innerHTML =  "" + (year + 1) + " - " + (year + 2);
	document.getElementById("earlier-year").setAttribute("checked", true);
	document.getElementById("earlier-year").value = year;
	document.getElementById("later-year").value = year + 1;
} else {
	document.querySelector("label[for='earlier-year']").innerHTML =  "" + (year - 1) + " - " + year;
	document.querySelector("label[for='later-year']").innerHTML =  "" + year + " - " + (year + 1);
	document.getElementById("later-year").setAttribute("checked", true);
	document.getElementById("earlier-year").value = year - 1;
	document.getElementById("later-year").value = year;
}