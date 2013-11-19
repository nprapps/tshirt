var $x_description;
var $station_target;
var $station_zip;
var $shirt_form;

var on_duplicate_fields = function() {
  /*
  * The event handler for duplicating the shipping/billing address.
  */

  // Set up the fields that might be duplicated.
  var duplicate_fields = ['address', 'city', 'state', 'zip', 'first_name', 'last_name'];

  // Loop over the duplicated fields and assign the shipping info to the billing info.
  _.each(duplicate_fields, function(element, index, list){
    $('#x_ship_to_' + element).val($('#x_' + element).val());
  });

  return false;

};

var on_form_submit = function() {
  /*
  * The event handler for the form submission.
  */

  // Set up the fields we need to validate.
  var fields = [
    'x_shirt',
    'x_email',
    'x_address',
    'x_city',
    'x_state',
    'x_zip',
    'x_first_name',
    'x_last_name',
    'x_ship_to_address',
    'x_ship_to_city',
    'x_ship_to_state',
    'x_ship_to_zip',
    'x_ship_to_first_name',
    'x_ship_to_last_name'
  ];

  // Prepare the description array.
  var x_description = {};

  // Set up our alert text.
  var missing_fields = '';

  // Assume we'll be submitting this form unless we have a reason not to.
  var submit = true;

  // Handle validation of the form.
  // Loop over each of the validatable form fields.
  _.each(fields, function(element, index, list){

    // If it's not filled out, break the upcoming submit.
    if ($('#' + element).val() === undefined || $('#' + element).val() === '') {

      missing_fields += '* ' + element.replace('x_', '').replace('_', ' ').replace('_', ' ').replace('_', ' ') + '\n';
      submit = false;

    } else {

      // If it is filled out, add it to the description array.
      x_description[element] = $('#' + element).val();

    }

  });

  // Handle the station bits.
  var station = $("div.station-results input:checked").val();

  // If you failed to select a station, just set to no thanks.
  if (station === undefined || station === ""){
    x_description['station'] = "NOTHANKS";
  } else {
    x_description['station'] = station;
  }

  // Stringify the description array and add it to the form.
  $x_description.val(JSON.stringify(x_description));

  // If we can submit, submit.
  if (submit === true){

      // alert($x_description.val());
      $shirt_form.submit();

  } else {

      alert("Looks like you missed something. Please fill out:\n\n" + missing_fields);

  }

};

var on_zip_click = function() {
  /*
  * Handles the click on the ZIP finder.
  */

  // Fetch station JSON from our proxy.
  $.getJSON('/tshirt/stations/' + $station_zip.val() + '.json', function(data){

    // Empty the station target.
    $station_target.empty();

    // Loop over the stations.
    _.each(data['station'], function(s){

      // Render out the template.
      $station_target.append(JST.station_detail({ station: s }));

    });

  });

};

$(function(){
  // Define our bits.
  $x_description = $('#x_description');
  $station_target = $('#station-target');
  $station_zip = $('#station-zip');
  $shirt_form = $('form#t-shirt-form');

  // Set up our event handlers.
  $('#zip-code-find').on('click', on_zip_click);
  $('#t-shirt-submit').on('click', on_form_submit);
  $('#duplicate-fields').on('click', on_duplicate_fields);

  setTimeout(function(){ location.reload(); }, 840000);

});