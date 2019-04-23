import $ from 'jquery';
export default function() {
  console.log("b2bportal.js");
  console.log($().jquery);

  var customer_id = $("#me").text();
  console.log(customer_id);
  var store_hash = "h3jnjw30qw";
  var admin = true;
  var company = {};
  var customers = {};

  $(document).ready(function() {

    sessionStorage.setItem("customer_id", customer_id);
    $.ajax({
      type: "GET",
      url: "https://0vvwag1o7b.execute-api.us-west-2.amazonaws.com/prod/company?store_hash=" + store_hash + "&admin_customer_id=" + customer_id,
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      async: false,
      success: function(data) {
        //admin user
        if(data.length > 0) {
          company = data[0];
          sessionStorage.setItem("company", JSON.stringify(company));
          if(admin) {
            sessionStorage.setItem("admin", "isAdmin");
          }
          else {
            sessionStorage.setItem("admin", "noAdmin");
          }
          load_table(data[0]);
        }
        //sub users
        else {
          admin = false;
          $.ajax({
            type: "GET",
            url: "https://0vvwag1o7b.execute-api.us-west-2.amazonaws.com/prod/company?store_hash=" + store_hash + "&customer_id=" + customer_id,
            headers: {
              "Access-Control-Allow-Origin": "*"
            },
            async: false,
            success: function(data) {
              company = data[0];
              sessionStorage.setItem("company", JSON.stringify(company));
              if(admin) {
                sessionStorage.setItem("admin", "isAdmin");
              }
              else {
                sessionStorage.setItem("admin", "noAdmin");
              }
              var str_arr = window.location.href.split("/b2bportal/");
              window.location.href = str_arr[0] + "/orderrequests/";
              // load_table(data[0]);
              //subuser
              $("#add_user_block").hide()
            },
            error: function(jqXHR, textStatus, errorThrown) {
              alert(JSON.stringify(jqXHR));
            }
          });
        }
      },
      error: function(jqXHR, textStatus, errorThrown) {
        alert(JSON.stringify(jqXHR));
      }
    });

    // $("#order_requests").click(function() {
    //   var str_arr = window.location.href.split("/b2bportal/");
    //   window.location.href = str_arr[0] + "/orderrequests/";
    // });

    $("#add_new_user").click(function() {
      $("#new_user").show();
    });

    $("#close_popup").click(function() {
      $("#new_user").hide();
    });

    $("#search").click(function() {
      var email = $("#search_user").val();
      if (email == "") {
        alert("Please input email!");
        return;
      }
      $.ajax({
        type: "GET",
        url: "https://0vvwag1o7b.execute-api.us-west-2.amazonaws.com/prod/bc/customer?email=" + email,
        headers: {
          "Access-Control-Allow-Origin": "*"
        },
        statusCode: {
          400: function() {
            alert('Please input a valid email address!');
          },
          500: function() {
            alert('500 status code! Big Commerce server error!');
          }
        },
        async: false,
        success: function(data) {
          if (typeof data !== "undefined") {
            var BCcustomerId = data[0].id;
            if (company.customer_ids.indexOf(BCcustomerId) > -1) {
              alert("Cannot add duplicate user!");
              return;
            } else {
              company.customer_ids.push(BCcustomerId);
            }
            var jsonObj = company;
            $.ajax({
              type: "POST",
              url: "https://0vvwag1o7b.execute-api.us-west-2.amazonaws.com/prod/company",
              headers: {
                "Access-Control-Allow-Origin": "*"
              },
              data: JSON.stringify(jsonObj),
              success: function(data) {
                location.reload();
              },
              error: function(jqXHR, textStatus, errorThrown) {
                alert(JSON.stringify(jqXHR));
              }
            });
          } else {
            alert("Cannot found user!");
          }
        },
        error: function(jqXHR, textStatus, errorThrown) {}
      });
    })

  });

  function load_table(data) {
    for (var i = 0; i < data.customer_ids.length; i++) {
      var id = data.customer_ids[i];
      $.ajax({
        type: "GET",
        url: "https://0vvwag1o7b.execute-api.us-west-2.amazonaws.com/prod/bc/customer?id=" + id,
        headers: {
          "Access-Control-Allow-Origin": "*"
        },
        async: false,
        success: function(BCcustomer) {
          customers[id.toString()] = BCcustomer.first_name + " " + BCcustomer.last_name;
          var src_path = $("#del_icon").attr("src");
          if(admin) {
            if (id == data.admin_customer_id ) {
              $("#user_table").append("<tr id='row_" + id + "'><td>" + BCcustomer.first_name + " " + BCcustomer.last_name + "</td><td>" + BCcustomer.email +
              "</td><td>Administrator</td><td></td></tr>");
            } else {
              $("#user_table").append("<tr><td>" + BCcustomer.first_name + " " + BCcustomer.last_name + "</td><td>" + BCcustomer.email +
              "</td><td>Sub User</td><td><img class='delete_row' customer_id='" + id + "' src='" + src_path + "'></td></tr>");
            }
          }
          else {
            if (id == data.admin_customer_id ) {
              $("#user_table").append("<tr id='row_" + id + "'><td>" + BCcustomer.first_name + " " + BCcustomer.last_name + "</td><td>" + BCcustomer.email +
              "</td><td>Administrator</td><td></td></tr>");
            } else {
              $("#user_table").append("<tr><td>" + BCcustomer.first_name + " " + BCcustomer.last_name + "</td><td>" + BCcustomer.email +
              "</td><td>Sub User</td><td></td></tr>");
            }
          }
        },
        error: function(jqXHR, textStatus, errorThrown) {
          alert(JSON.stringify(jqXHR));
        }
      });
    }
    sessionStorage.setItem("customers", JSON.stringify(customers));

    $(".delete_row").click(function() {
      var rowid = $(this).attr("customer_id");
      $("#row_" + rowid).remove();
      for(var i=0; i<company.customer_ids.length; i++) {
        if(company.customer_ids[i] == rowid) {
          company.customer_ids.splice(i, 1);
          break;
        }
      }
      $.ajax({
        type: "POST",
        url: "https://0vvwag1o7b.execute-api.us-west-2.amazonaws.com/prod/company",
        headers: {
          "Access-Control-Allow-Origin": "*"
        },
        data: JSON.stringify(company),
        // async: false,
        success: function(BCcustomer) {
        },
        error: function(jqXHR, textStatus, errorThrown) {
          alert(JSON.stringify(jqXHR));
        }
      });
    });
  }

  function save() {
    console.log("click");
  }
}
