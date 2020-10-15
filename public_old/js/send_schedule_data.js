"use strict";
const Http = new XMLHttpRequest();
const url    = window.location.href + "build";//'https://schedule-creator.herokuapp.com/build';

document.getElementById('send_data').onclick = () => {
	document.getElementById("enter_courses").style.display = "none";
	document.getElementById("loading_schedules").style.display = "inline-block";
	let container = document.getElementById("input-fields");
	let nodes = container.childNodes;
	let courses = []
	for (let i = 0; i < nodes.length - 1; i++) {
		let course = nodes[i].firstChild.value.toUpperCase();
		if (course.length != 5)
			continue;
		courses.push(course);
	}
	
	let semester = "10";
	let radio_buttons = document.getElementsByName('semester');
	for (let i = 0; i < radio_buttons.length; i++) {
		if (radio_buttons[i].checked) {
			semester = radio_buttons[i].value;
			break;
		}
	}
	let year = "2020";
	radio_buttons = document.getElementsByName('school_year');
	for (let i = 0; i < radio_buttons.length; i++) {
		if (radio_buttons[i].checked) {
			year = radio_buttons[i].value;
			break;
		}
	}
	
	radio_buttons = document.getElementById('yes-full');
	let include_full = radio_buttons.checked;
	
	
	$.ajax({
		type: 'POST',
		url: url,
		data: {
			courses: courses,
			semester: semester,
			year: year,
			include_full: include_full,
		},
		xhrFields: {
			withCredentials: false,
		},
		success: function(res) {
			populate_schedule_tables(res);
		}
	});
};