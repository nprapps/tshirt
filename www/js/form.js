var $x_description;

$(function(){

    $x_description = $('#x_description');

    $('button.zip-code-find').on('click', function(){

      var station_zip = $('#station-zip').val();

      $.getJSON('/tshirt/stations/' + station_zip, function(data){

        $('#station-target').empty();

        _.each(data['station'], function(s){

          $('#station-target').append(JST.station_detail({ station: s }));

        });

      });

    });

    $('button.t-shirt-submit').on('click', function(){

        var fields = [ 'address', 'city', 'state', 'zip', 'shirt', 'country', 'first_name', 'last_name'];
        var duplicate_fields = ['address', 'city', 'state', 'zip', 'country', 'first_name', 'last_name'];
        var x_description = {};

        var submit = true;

        _.each(fields, function(element, index, list){

            if ($('#' + element).val() === undefined || element === '') {

              alert(element);
              submit = false;

            }

            x_description[element] = $('#' + element).val();
        });

        _.each(duplicate_fields, function(element, index, list){
          $('#ship_to_' + element).val($('#' + element).val());
        });

        var station = $("div.station-results input:checked").val();

        if (station === undefined || station === ""){

          x_description['station'] = "NOTHANKS";

        } else {

          x_description['station'] = station;

        }

        $x_description.val(JSON.stringify(x_description));

        if (submit === true){

            alert($x_description.val());
            // $('form#t-shirt-form').submit();

        } else {

            alert('Fill out the whole form, please.');

        }

    });
});