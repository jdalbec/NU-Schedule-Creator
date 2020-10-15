"use strict";
var fieldContainer = document.getElementById("course-input-container");

setInterval ( () => {
	if (fieldContainer.lastChild == null || fieldContainer.lastChild.firstChild.value != '') {
		let courseInputRow = document.createElement("div");
		courseInputRow.classList.add("row");
		courseInputRow.classList.add("justify-content-center");
		
		let courseInput = document.createElement("input");
		courseInput.classList.add("course-input");
		courseInput.setAttribute("maxlength", "5");
		
		let removeCourseBtn = document.createElement("span");
		removeCourseBtn.classList.add("btn");
		removeCourseBtn.classList.add("remove-course");
		removeCourseBtn.appendChild(document.createTextNode("X"));
		removeCourseBtn.onclick = (event) => {
			fieldContainer.removeChild(event.target.parentElement);
		};
		
		courseInputRow.appendChild(courseInput);
		courseInputRow.appendChild(removeCourseBtn);
		fieldContainer.appendChild(courseInputRow);
	}
}, 10);