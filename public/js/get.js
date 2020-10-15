"use strict";

function populate_schedule_tables(res) {
	// Switch views
	document.getElementById("loading-screen").style.display = "none";
	let schedule_container = document.getElementById("result-screen");
	schedule_container.style.display = "inline-block";
	
	let back_button = document.createElement("button");
	back_button.appendChild( document.createTextNode("Go Back") );
	back_button.classList.add("btn");
	back_button.id = "back_button";
	back_button.onclick = () => {
		document.getElementById("result-screen").style.display = "none";
		document.getElementById("first-screen").style.display = "inline-block";
		document.getElementById("result-screen").innerHTML = "";
	}
	schedule_container.appendChild(back_button);
	
	// Show error message if applicable
	if ('error_message' in res) {
		let error_message_header = document.createElement("h2");
		error_message_header.appendChild( document.createTextNode(res['error_message']) );
		schedule_container.appendChild(error_message_header);
		return;
	}
	
	let schedule_count_header = document.createElement("h2");
	schedule_count_header.appendChild( document.createTextNode(res.schedules.length + " possible schedule" + (res.schedules.length != 1 ? "s" : "") + " generated.") );
	schedule_container.appendChild(schedule_count_header);
	
	// Create tables
	for (let i = 0; i < res.schedules.length; i++) {
		let schedule = res.schedules[i];
		let row = document.createElement("div");
		row.classList.add("row");
		row.classList.add("justify-content-center");
		let table_frame = document.createElement("div");
		table_frame.classList.add("col-sm-8");
		
		row.appendChild(table_frame);
		
		let tbl = document.createElement("table");
		tbl.classList.add("table");
		
		// Create headers
		let tbl_row = document.createElement("tr");
		let course_headers = [
			"Course",
			"CRN",
			"Title",
			"Credits",
			"Seats Available",
			"Days",
			"Time",
			"Room",
			"Instructor",
		];
		
		for (let header_index = 0; header_index < course_headers.length; header_index++) {
			let header = document.createElement("th");
			header.appendChild( document.createTextNode(course_headers[header_index]) );
			tbl_row.appendChild(header.cloneNode(true));
		}
		tbl.appendChild(tbl_row.cloneNode(true));
		
		// Create data		
		for (let course_index = 0; course_index < schedule.length; course_index++) {
			let course =  res.lookup_table[schedule[course_index]];
			let course_data = [
				course.course + " " + course.section,
				course.crn,
				course.title,
				course.credits,
				course.available,
				course.days +
				(course.lab_day == undefined ?
				"" : " (" + course.lab_day + ")"),
				course.time +
				(course.lab_time == undefined ?
				"" : " (" + course.lab_time + ")"),
				course.room +
				(course.lab_room == undefined ?
				"" : " (" + course.lab_room + ")"),
				course.instructor,
			];
			
			tbl_row = tbl_row.cloneNode(false);
			for (let data_index = 0; data_index < course_data.length; data_index++) {
				let td = document.createElement("td");
				td.appendChild( document.createTextNode(course_data[data_index]) );
				tbl_row.appendChild(td.cloneNode(true));
			}
			tbl.appendChild(tbl_row.cloneNode(true));
		}
		
		table_frame.appendChild(tbl);
		schedule_container.appendChild(row);
	}
}