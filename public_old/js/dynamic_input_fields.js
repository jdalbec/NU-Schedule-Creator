"use-strict";

var field_container = document.getElementById("input-fields");

setInterval( () => {
	if (field_container.lastChild == null || field_container.lastChild.firstChild.value != '') {
		let container = document.createElement("div");
		container.classList.add("class-input-container");
		
		let field = document.createElement("input");
		field.classList.add("class-input");
		field.setAttribute("maxlength", "5");
		
		let btn = document.createElement("span");
		btn.classList.add("remove-field");
		btn.classList.add("btn");
		btn.appendChild(document.createTextNode("X"))
		btn.onclick = (event) => {
			field_container.removeChild(event.target.parentElement);
		};
		
		container.appendChild(field);
		container.appendChild(btn);
		field_container.appendChild(container);
		
	}
}, 10);