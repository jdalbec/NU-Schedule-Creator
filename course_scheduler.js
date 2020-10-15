"use-strict";

const rp = require('request-promise');
//const url = 'https://ssb.norwich.edu/bear/nu_courselist.p_nu_crslist?subj_code=GR&p_termcode=202040&p_ptrmcode=1';
//const url = 'https://ssb.norwich.edu/bear/nu_courselist.p_nu_crslist?subj_code=AS&p_termcode=202040&p_ptrmcode=1';
const cheerio = require('cheerio');
const tableparser = require('cheerio-tableparser');



module.exports = {
	build_schedule_and_fulfil_request: async (courses, termcode, include_full, res) => {
		categories = {};
		
		for (let i = 0; i < courses.length; i++) {
			let category_code = courses[i].slice(0, 2);
			if (!/[A-Z]{2}/.test(category_code)) return;
			if (!categories.hasOwnProperty(category_code)) {
				//if (!/[A-Z]{2}/.test(category_code)) return;
				categories[category_code] = get_section(category_code, termcode);
			}
		}
		
		category_promises = [];
		for (let prop in categories) {
			category_promises.push(categories[prop]);
		}
		
		Promise.all( category_promises ).then((categories) => {
			courses_categorized = {};
			for (let i = 0; i < courses.length; i++) {
				let category = courses[i].slice(0, 2);
				courses_categorized[category] == undefined ?
					courses_categorized[category] = [courses[i]] :
					courses_categorized[category].push(courses[i]);
			}
			
			course_options = {}; // 'course: [class1, class2, ...]'
			course_lab_options = {};
			
			courses_that_have_at_least_one = [];
			
			for (let category_index = 0; category_index < categories.length; category_index++) {
				category = categories[category_index]
				category_code = category[0].course.slice(0, 2);
				
				// Find all requested classes that belong to this category, and add them to course_options
				for (let course_index = 0; course_index < category.length; course_index++) {
					let current_course = category[course_index];
					
					if (!include_full && parseInt(current_course.available) <= 0)
						continue;
					
					if (courses_categorized[category_code].includes(current_course.course)) {
						if (courses_that_have_at_least_one.indexOf(current_course.course) == -1)
							courses_that_have_at_least_one.push(current_course.course);
						
						// If course instance is a lab
						if (/^L{1,2}\d+$/.test(current_course.section)) {
							course_lab_options[current_course.course + "_LAB"] == undefined ?
								course_lab_options[current_course.course + "_LAB"] = [current_course] :
								course_lab_options[current_course.course + "_LAB"].push(current_course);
						}
						// Normal course
						else {
							course_options[current_course.course] == undefined ?
								course_options[current_course.course] = [current_course] :
								course_options[current_course.course].push(current_course);
						}
					}
				}
			}
			
			if (courses_that_have_at_least_one.length != courses.length) {
				err_msg = "Error: The following classes are currently full: ";
				missing_courses = courses.filter(x => !courses_that_have_at_least_one.includes(x));
				for (let i = 0; i < missing_courses.length - 1; i++) {
					err_msg += missing_courses[i] + ", ";
				}
				err_msg += missing_courses[missing_courses.length - 1] + ".";
				
				console.log(err_msg);
				
				res.send({
					error_message: err_msg,
				});
			}
			
			course_options = {
				...course_options,
				...course_lab_options
			};
			
			let course_master_list = {};
			let unsorted = Object.values(course_options);
			for (let big_i = 0; big_i < unsorted.length; big_i++) {
				for (let i = 0; i < unsorted[big_i].length; i++) {
					course_master_list[unsorted[big_i][i].crn] = unsorted[big_i][i];
				}
			}
			
			// Actually create schedules
			let schedules = build_schedules(course_options);
			
			res.send({
				schedules: schedules,
				lookup_table: course_master_list,
			});
			
			
		}).catch( () => {
			// Send error message
		});
	}
}

//console.log("Hello there, General Kenobi");
function build_schedules(course_options) {
	course_options = Object.values(course_options);
	valid_schedules = [];
	
	function recursive(course_index, course_trace) {
		let possible_classes = course_options[course_index];
		
		// For each possible class of course
		for (let i = 0; i < Object.keys(possible_classes).length; i++) {
			let current_class = possible_classes[i];
			
			//For each previous class, check if there is a time conflict with the current class
			
			let valid = true;
			for (let prev_index = 0; prev_index < course_index; prev_index++) {
				let previous_course = course_trace[prev_index];
				
				if (do_times_conflict(current_class.time, current_class.days, previous_course.time, previous_course.days)) {
					valid = false;
					break;
				}
				if (current_class.lab_time != undefined) {
					if (do_times_conflict(current_class.lab_time, current_class.lab_day, previous_course.time, previous_course.days)) {
						valid = false;
						break;
					}
				}
				if (previous_course.lab_time != undefined) {
					if (do_times_conflict(current_class.time, current_class.days, previous_course.lab_time, previous_course.lab_day)) {
						valid = false;
						break;
					}
				}
				if (previous_course.lab_time != undefined && current_class.lab_time != undefined) {
					if (do_times_conflict(current_class.lab_time, current_class.lab_day, previous_course.lab_time, previous_course.lab_day)) {
						valid = false;
						break;
					}
				}
			}
			
			
			// Skip this class, conflicts with earlier class time
			if (!valid)
				continue;
			
			course_trace[course_index] = current_class;
			if (course_index + 1 < course_options.length)
				recursive(course_index + 1, course_trace);
			// No more courses to schedule in
			else {
				schedule = [];
				for (let prev_index = 0; prev_index < course_trace.length; prev_index++) {
					schedule.push(course_trace[prev_index].crn);
				}
				valid_schedules.push(schedule);
			}
			
		}
	};
	
	recursive(0, []);
	
	return valid_schedules;
}

function do_times_conflict(time1, days1, time2, days2) {
	if (time1 == "TBA")
		return false;
	if (time2 == "TBA")
		return false;
	if (days1 == "TBA")
		return false;
	if (days2 == "TBA")
		return false;
	let days_compare = days2.split("");
	let same_day = false;//If the days contain at least one of the same days
	for (let i = 0; i < days_compare.length; i++) {
		if (days1.includes(days_compare[i])) {
			same_day = true;
			break;
		}
	}
	
	if (!same_day)
		return false;
	
	time1 = time1.split('-');
	time2 = time2.split('-');
	
	let time1_start = parseInt(time1[0], 10);
	let time1_end = parseInt(time1[1], 10);
	let time2_start = parseInt(time2[0], 10);
	let time2_end = parseInt(time2[1], 10);
	
	return (time1_start < time2_end && time1_end > time2_start)
}

async function get_section(category, termcode) {
	let url = `https://ssb.norwich.edu/bear/nu_courselist.p_nu_crslist?subj_code=${category}&p_termcode=${termcode}&p_ptrmcode=1`;
	
	let html = await rp(url);
	
	let scraped = cheerio.load(html);
	let table = scraped('table table');
	
	table = cheerio.load("<table>" + table.html() + "</table>");
	tableparser(table);
	data = table("table").parsetable(false, true, true);
	
	let courses = [];
	
	for (let i = 2; i < data[1].length; i++) {
		let course = {
			course: data[0][i].slice(0, 6).replace(/\s/, ''),
			section: data[1][i],
			crn: data[2][i],
			title: data[3][i].replace(/\s{2,}/g, ' '),
			credits: data[5][i],
			available: data[7][i],
			limit: data[8][i],
			days: data[12][i],
			time: data[13][i].replace(/:/g, ''),
			room: data[14][i],
			lab_day: null,
			lab_time: null,
			lab_room: null,
			instructor: data[15][i],
		};
		
		let is_lab = false;
		
		if (i > 2 && courses[courses.length - 1].crn == course.crn) {
			// Is a lab, append to previous course
			let previous_course = courses[courses.length - 1];
			
			if (previous_course.days.length < course.days.length) {
				previous_course.lab_day = previous_course.days;
				previous_course.lab_time = previous_course.time;
				previous_course.lab_room = previous_course.room;
				
				previous_course.days = course.days;
				previous_course.time = course.time;
				previous_course.room = course.room;
			}
			else {
				previous_course.lab_day = course.days;
				previous_course.lab_time = course.time;
				previous_course.lab_room = course.room;
			}
			is_lab = true;
		}
		
		if (!is_lab)
			courses.push(course);
	}
	
	return courses;
}