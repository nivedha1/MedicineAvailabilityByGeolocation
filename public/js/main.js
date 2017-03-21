

$(document).ready(function () {



    var url = 'https//gomashup.com/json.php?fds=geo/usa/zipcode/state/';


    $('#states').on('change', function () {
        $('#cities').empty()
        $.ajax({
            url: url + this.value,
            type: 'GET',
            crossDomain: true,
            dataType: 'jsonp',
            success: function (data) {
                var s = $("<select id=\"selectId\" name=\"selectName\" />");
                for (var val in data.result) {
                    $("<option />", {value: data.result[val].Longitude +","+ data.result[val].Latitude, text: data.result[val].City}).appendTo(s);
                }
               
                s.appendTo('#cities')
                
               
            },
            error: function () {
                alert('Failed!');
            }

        });
   
      $('#next-button').on('click', function () {
      });
  });
});