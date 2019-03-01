// declare globals
var groupings = [];
var compulsory = [];
var week_list = [];
var week_number = 0;

$(document).ready(function() {
    // get the current week number
    let current_date = new Date();
    let start_of_term = new Date(2018, 9-1, 17);    // 9-1 because of idiocy in how Date() counts months from zero

    let diff = (start_of_term.getTime() - current_date.getTime()) / 1000;
    diff /= (60 * 60 * 24 * 7);

    week_number = Math.abs(Math.round(diff));

    // update the input element
    document.getElementById('week_number').value = week_number;

    // add event listener to week number input change
    document.getElementById('week_number').onclick = function() {
        updateweekNumber();
    }
    
    // add event listener to CSV file upload
    document.getElementById('csv').addEventListener('change', loadCSV, false);

    // hide help
    $("#help").hide();

    // load groupings from localstorage
    loadGroupings();

    // load week list from localstorage
    loadWeekList();

    // load the timetable
    parseWeek();
});


function updateweekNumber() {
    week_number = $("#week_number").val();

    parseWeek();
}

function loadCSV(event) {
    let files = event.target.files;

    // use the 1st file from the list
    file = files[0];

    let reader = new FileReader();

    // called by .readAsTest(file)
    reader.onload = (function(theFile) {
        return function(event) {
            readCSV(event.target.result);
        };
    })(file);

    reader.readAsText(file);
}

function readCSV(csv_text) {
    // split into week blocks
    let row_list = csv_text.split("\n");

    week_list = [];
    let new_week = [];

    for (index = 0; index < row_list.length; index++) {

        // split at commas, but not commas inside double quotes
        let row = row_list[index].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);

        // if no matches, initialise as empty array
        row = row || [];

        // remove quotation marks from the string
        for (row_index = 0; row_index < row.length; row_index++) {
            row[row_index] = row[row_index].replace(/"/g,"");
        }

        if (row.length == 0) {
            week_list.push(new_week);
            new_week = [];
        }
        else {
            new_week.push(row);
        }
    }

    // save timetable
    localStorage.setItem("timetable", JSON.stringify(week_list));
}

function loadWeekList() {
    try {
        week_list = JSON.parse(localStorage.getItem("timetable"));
    }
    catch(err) {
        console.log(err);
    }
}

function getGroupings() {
    let grouping_info = document.getElementsByClassName("group_info");

    groupings = [];
    compulsory = [];

    for(let index = 0; index < grouping_info.length; index=index+2)
    {
        let module = grouping_info.item(index);
        let group_number = grouping_info.item(index+1);

        if (module.value != "" && group_number.value != "00") {
            groupings.push( [ module.value, group_number.value ] );
        }
        else if (module.value != "" && group_number.value == "00") {
            compulsory.push( module.value );
        }
    }

    saveGroupings();
}

function saveGroupings() {
    localStorage.setItem("groupings", JSON.stringify(groupings));
    localStorage.setItem("compulsory", JSON.stringify(compulsory));

    parseWeek();
}

function loadGroupings() {
    try {
        groupings = JSON.parse(localStorage.getItem("groupings"));
        compulsory = JSON.parse(localStorage.getItem("compulsory"));

        for (let index = 0; index < groupings.length; index++) {
            addAdditionalGroup(groupings[index][0], groupings[index][1]);
        }

        for (let index = 0; index < compulsory.length; index++) {
            addAdditionalGroup(compulsory[index]);
        }
    }
    catch(err) {
        console.log(err);
    }
}

function delete_group_info_div(event) {
    // removes the container div
    event.parentNode.parentNode.removeChild(event.parentNode);
}

function addAdditionalGroup(module="", number="00") {
    $("#group_info_form").append(`<div><input class="group_info" type="text" value=`+module+`>\n<input class="group_info" type="text" value=`+number+`>\n<button onclick="delete_group_info_div(this)">Delete</button></div>`);
}

function parseWeek() {
    let week = week_list[week_number];

    let week_events = week.slice(2);

    let matched_events = [];

    for (index=0; index < week_events.length; index++) {
        let event = week_events[index];

        for (group_index=0; group_index < groupings.length; group_index++) {
            let module = groupings[group_index][0];
            let number = groupings[group_index][1];

            let expected_start_index_of_group_number = event[0].length-3;

            if (event[0].indexOf(module) != -1 && event[0].indexOf(number, expected_start_index_of_group_number) != -1) {
                matched_events.push(event);
            }
        }

        for (compulsory_index=0; compulsory_index < compulsory.length; compulsory_index++) {
            let event_name = compulsory[compulsory_index];

            if (event[0].indexOf(event_name) != -1) {
                matched_events.push(event);
            }
        }
    }

    let table_events = [[], [], [], [], []];
    let weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday"];
    let weekday_acronyms = ["Mon", "Tue", "Wed", "Thu", "Fri"];

    for (index=0; index < matched_events.length; index++) {    
        let event = matched_events[index];
        let tr;
        let td = document.createElement('td');

        // get tr
        let weekday = 0;
        for (weekday_index = 0; weekday_index < weekdays.length; weekday_index++) {
            if (event[2] == weekday_acronyms[weekday_index]) {
                // keep a reference to the index
                weekday = weekday_index;

                tr = document.getElementById(weekdays[weekday_index]);
                break;
            }
        }

        td.innerText = event[0];

        let event_span = event[8].substring(0, 2);
        let event_index = parseInt(event[4].substring(0, 2));

        td.colSpan = event_span;
        td.rowIndex = event_index;

        td.style.cssText = "padding: 1em; border-right: 1px solid #ddd; border-left: 1px solid #ddd;";

        td.onclick = function() {
            eventModal(td, event[0], event[3], event[4] + " - " + event[7], event[9], event[10]);
        };

        table_events[weekday].push(td);
    }

    let false_entry = document.createElement('td');
    false_entry.rowIndex = 25;
    let earliest_entry = false_entry;

    // reset x view
    document.getElementById("container").scrollLeft = 0;

    // if x view != 0, then x axis is set to 0 by following logic
    // hence need to reset view to 0 each execution
    // (will sometimes still not work, but less if x is reset)

    for (index = 0; index < weekdays.length; index++){

        let today = table_events[index];

        // compare function for sorting based on rowIndex
        function compare(a, b){
            if (a.rowIndex < b.rowIndex) {
                return 1
            }
            
            else if (b.rowIndex > a.rowIndex) {
                return -1
            }
        
            return 0;
        }
        
        // sort today so events are applied in order
        today.sort(compare);

        let tr = document.getElementById(weekdays[index]);
        let spanned_columns = 0;

        // reset tr's td children (keep th children)
        while (tr.getElementsByTagName("td")[0]) {
            tr.removeChild(tr.getElementsByTagName("td")[0]);
        }

        // populate row with empty entries + actual entries
        while (spanned_columns < 24) {
            td = today.pop();

            if (td != undefined) {

                if (td.rowIndex < earliest_entry.rowIndex) {
                    earliest_entry = td;
                }

                // add entry and record column span
                if (spanned_columns == td.rowIndex) {
                    tr.appendChild( td );
                    spanned_columns += parseInt(td.colSpan);
                }
                // fill up with empty elements
                else {
                    tr.appendChild( document.createElement('td') );
                    spanned_columns++;

                    // and push back onto the start of the list to check next round
                    today.unshift(td);
                }
            }
            // finish filling with empty elements
            else {
                tr.appendChild( document.createElement('td') );
                spanned_columns++;
            }
        }
    }

    // if entry was ever overwritten (i.e.: this week has events)
    if (earliest_entry.rowIndex < false_entry.rowIndex) {
        let earliest_position = earliest_entry.getBoundingClientRect();

        // offset to prevent headers overlapping entries immediately
        let offset = 150; //(pixels)

        // shift x view to the earliest elements x position
        document.getElementById("container").scrollLeft = earliest_position.left - offset;
    }

    document.getElementById("week_header").innerText = week[0];
}

function eventModal(event, name, date, time, lecturer, location) {
    // get written date
    let year = date.substring(0,4);
    let month = date.substring(5,7);
    let day = date.substring(8,10);

    let date_object = new Date(year, month-1, day);

    // populate modal
    document.getElementById("event-name").innerText = name;
    document.getElementById("event-date").innerText = date_object.toString().replace("00:00:00 GMT+0000 (Greenwich Mean Time)", "");
    document.getElementById("event-time").innerText = time;
    document.getElementById("event-lecturer").innerText = "Staff: " + lecturer;
    document.getElementById("event-location").innerText = "Location: " + location;

    // display modal
    document.getElementsByClassName('modal')[1].style.display = "block";
}