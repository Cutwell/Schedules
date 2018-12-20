// Get the modal
var options_modal = document.getElementsByClassName('modal')[0];
var event_modal = document.getElementsByClassName('modal')[1];

// Get the button that opens the modal
var options_modal_btn = document.getElementById("modal-button");

// Get the <span> element that closes the modal
var options_modal_span = document.getElementsByClassName("close")[0];
var event_modal_span = document.getElementsByClassName("close")[1];

// When the user clicks on the button, open the modal 
options_modal_btn.onclick = function() {
  options_modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
options_modal_span.onclick = function() {
  options_modal.style.display = "none";
}
event_modal_span.onclick = function() {
  event_modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == options_modal) {
    options_modal.style.display = "none";
  }
  else if (event.target == event_modal) {
    event_modal.style.display = "none";
  }
}


function updateWeekNumber(int) {
  let val = parseInt(document.getElementById('week_number').value);
  if ((val + int) > 0) {
    document.getElementById('week_number').value = (val + int);
    updateweekNumber();
  }
}