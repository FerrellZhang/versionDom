import $ from 'jquery';
export default function() {
  console.log("orderrequests.js");

  var customer_id = sessionStorage.getItem("customer_id");
  var store_hash = "h3jnjw30qw";
  var admin = sessionStorage.getItem("admin");
  var company = JSON.parse(sessionStorage.getItem("company"));
  var customers = JSON.parse(sessionStorage.getItem("customers"));
  var requests = [];

  console.log(admin);

  $(document).ready(function() {
    if(admin == "isAdmin") {
      console.log("admin");
      $.ajax({
        type: "GET",
        url: "https://0vvwag1o7b.execute-api.us-west-2.amazonaws.com/prod/quote?store_hash=" + store_hash + "&company_id=" + company.id,
        headers: {
          "Access-Control-Allow-Origin": "*"
        },

        success: function(data) {
          load_table(data);
        },
        error: function(jqXHR, textStatus, errorThrown) {
          alert(JSON.stringify(jqXHR));
        }
      });

    }
    else {
      $(".text2").hide();
      $.ajax({
        type: "GET",
        url: "https://0vvwag1o7b.execute-api.us-west-2.amazonaws.com/prod/quote?store_hash=" + store_hash + "&company_id=" + company.id + "&customer_id=" + customer_id,
        headers: {
          "Access-Control-Allow-Origin": "*"
        },

        success: function(data) {
          console.log(data);
          load_table(data);
        },
        error: function(jqXHR, textStatus, errorThrown) {
          alert(JSON.stringify(jqXHR));
        }
      });

    }

    // $("#b2bportal").click(function() {
    //   console.log("user_management");
    //   var str_arr = window.location.href.split("/orderrequests/");
    //   window.location.href = str_arr[0] + "/b2bportal/";
    // })

    $("#new_request").click(function() {
      sessionStorage.setItem("request", "new");
      var str_arr = window.location.href.split("/orderrequests/");
      window.location.href = str_arr[0] + "/request/";
    })

  });

  function load_table(data) {
    requests = data;
    var src = $("#dropdown").attr("src");
    for(var i=0; i<data.length; i++) {
      if(data[i].quote_status == "Ordered") {
        if(admin == "isAdmin") {
          $("#requests_table").append("<tr class='request' request_id='" + data[i].id + "'><td>" + data[i].id + "</td><td>" + customers[data[i].customer_id.toString()] + "</td><td>" + data[i].quote_status + "</td><td><a href='/account.php?action=view_order&order_id=" +
          data[i].order_id + "'>" + data[i].order_id + "</a></td></tr>");
        }
        else {
          $("#requests_table").append("<tr class='request' request_id='" + data[i].id + "'><td>" + data[i].id + "</td><td>" + customers[data[i].customer_id.toString()] + "</td><td>" + data[i].quote_status + "</td><td>"
          + data[i].order_id + "</td></tr>");
        }

      }
      else {
        $("#requests_table").append("<tr class='request' request_id='" + data[i].id + "'><td>" + data[i].id + "</td><td>" + customers[data[i].customer_id.toString()] + "</td><td>" + data[i].quote_status + "</td><td></td></tr>");
      }
    }

    $(".request").click(function() {
      var id = $(this).attr("request_id");
      if(id != "new") {
        for(var i=0; i<requests.length; i++) {
          if(id == requests[i].id) {
            sessionStorage.setItem("request_content", JSON.stringify(requests[i]));
          }
        }
      }
      sessionStorage.setItem("request", id);
      var str_arr = window.location.href.split("/orderrequests/");
      window.location.href = str_arr[0] + "/request/";
    });
  }
}
