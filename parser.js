// template html for a table to display the timetable
template_html = `<table width="600">\n<tr>\n<td align="center"> \n<table align="center" border="0" cellspacing="0" cellpadding="10" style="border:1px solid #ccc;">\n"++"\n</table>\n</td>\n</tr>\n</table>\n`;

// template html for a table entry
template_event = "<tr> <td>{day}</td> <td>{name}</td> <td>{start_time}</td> <td>{end_time}</td> <td>{teacher}</td> <td>{location}</td> </tr>";

// declare globals
var groupings = [];
var compulsory = [];
var week_list = [];
var week_number = 0;
var toggle_help = 0;

$(document).ready(function() {
    // get the current week number
    let current_date = new Date();
    let start_of_term = new Date(2018, 9-1, 17);    // 9-1 because of idiocy in how Date() counts months from zero

    let diff = (start_of_term.getTime() - current_date.getTime()) / 1000;
    diff /= (60 * 60 * 24 * 7);

    week_number = Math.abs(Math.round(diff));

    // update the input element
    $("#week_number").val(week_number.toString());


    // add event listener to week number input change
    document.getElementById('week_number').addEventListener('change', updateweekNumber, false);
    
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

function toggleShowingHelp() {
    if (toggle_help == 0) {
        toggle_help = 1;
        $("#help").show();
    }
    else {
        toggle_help = 0;
        $("#help").hide();
    }
}

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
    for (index=0; index < row_list.length; index++) {
        let row = row_list[index];

        if (row == []) {
            week_list.push(new_week);
            new_week = [];
        }
        else {
            new_week.push( row.split(",") );
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

    let html_event_list = [];

    for (index=0; index < matched_events.length; index++) {
        
        let event = matched_events[index];
        let html_event = "<tr> <td>"+event[2]+"</td> <td>"+event[0]+"</td> <td>"+event[4]+"</td> <td>"+event[7]+"</td> <td>"+event[10]+event[9]+"</td> <td>"+event[11]+"</td> </tr>";;
        html_event_list.push(html_event);        
    }

    $("#week_header").html(week[0]);
    $("#timetable").html( html_event_list.join("\n") );
}