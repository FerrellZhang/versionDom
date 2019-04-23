/**
 * Created by silk on 2017/7/28.
 */
import $ from 'jquery';
export default function() {
  console.log("manage.js");
  function tabClass(el, className) {
    $(el).on('click', function(e) {
      e.stopPropagation();
      if ($(this).hasClass(className)) {
        $(this).removeClass(className);
      } else {
        $(el).removeClass(className);
        $(this).addClass(className);
      }
    })
  }

  tabClass('#manage .item', 'is-open');
  tabClass('#manage .child-list li', 'ftBold');
  tabClass('#manage .selectTbl tr', 'is-active');

  $('#manage li a').on('click', function(e) {
    e.preventDefault();
    var showId = $(this).attr('href');
    $('#manage .content').css('display', 'none');
    $(showId).css('display', 'block');
    $('#manage .child-list li a').removeClass("ftBold");
    $(this).addClass("ftBold");
  });




  var section = window.location.href.split("/manager/");
  if (section.length > 1) {
    if (section[1] == "#manageUsers") {
      $("#account_nav").addClass("is-open");
      $("#manageUsers_nav").addClass("ftBold");
      $('#manage .content').css('display', 'none');
      $("#manageUsers").css('display', 'block');
    } else if (section[1] == "#supplyLists") {
      $("#supplyLists_nav").addClass("is-open");
      $("#show_supply_lists").addClass("ftBold");
      $('#manage .content').css('display', 'none');
      $("#supplyLists").css('display', 'block');
    } else if (section[1] == "") {
      $("#account_nav").addClass("is-open");
      $("#myaccount_nav").addClass("ftBold");
      $("#myAccount").css('display', 'block');
    } else if (section[1] == "#quotes") {
      $("#supplyLists_nav").addClass("is-open");
      $("#show_quote_lists").addClass("ftBold");
      $("#quotes").css('display', 'block');
    }
  }

  //hard code things
  $("#active_quotes").click(function() {
    $('#manage .content').css('display', 'none');
    $("#supplyLists_nav").addClass("is-open");
    $("#show_quote_lists").addClass("ftBold");
    $("#quotes").css('display', 'block');
  });

  //store hash
  var store_hash = "h3jnjw30qw";

  //User
  //get customer_id
  var customer_id = $("#myAccount_name").attr("customerId");
  console.log("customerId:" +  customer_id);

  var company = new Object();
  var admin = true;

  var customer_map = {};
  customer_map[customer_id] = $("#myAccount_name").val();
  $.ajax({
    type: "GET",
    url: "https://0vvwag1o7b.execute-api.us-west-2.amazonaws.com/prod/company?store_hash=" + store_hash + "&admin_customer_id=" + customer_id,
    headers: {
      "Access-Control-Allow-Origin": "*"
    },
    async: false,
    success: function(data) {
      //if admin user show user lists
      if (data.length > 0) {
        console.log("admin");
        company = data[0];
        $("#myAccount_company_name").text("Company: " + company.company_name);
        myAccount_load_table(data[0]);
        company_info();
      }
      //normal users
      else {
        console.log("non-admin");
        admin = false;
        $.ajax({
          type: "GET",
          url: "https://0vvwag1o7b.execute-api.us-west-2.amazonaws.com/prod/company?store_hash=" + store_hash + "&customer_id=" + customer_id,
          // contentType: "application/json",
          headers: {
            "Access-Control-Allow-Origin": "*"
          },
          async: false,
          success: function(data) {
            company = data[0];
            $("#myAccount_type").val("user");
            $(".admin_user").hide();
            company_info();
          },
          error: function(jqXHR, textStatus, errorThrown) {
            alert(JSON.stringify(jqXHR));
          }
        });
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {

    }
  });
  console.log("company id:" +  company.id);
  console.log("store hash:" +  store_hash);

  function company_info(){
    //company information
    $("#company_name").text(company.company_name);
    $("#company_address").text(company.address);
    $("#company_phone").text(company.phone);
    $("#company_email").text("silk@silksoftware.com");
  }

  function myAccount_load_table(data) {
    if(admin) {
      $("#myAccount_type").val("admin_user");
    }
    else {
      $("#myAccount_type").val("user");
    }

    for (var i = 0; i < data.customer_ids.length; i++) {
      var user_id = data.customer_ids[i];
      $.ajax({
        type: "GET",
        url: "https://0vvwag1o7b.execute-api.us-west-2.amazonaws.com/prod/bc/customer?id=" + user_id,
        // contentType: "application/json",
        headers: {
          "Access-Control-Allow-Origin": "*"
        },
        async: false,
        success: function(BCcustomer) {
          customer_map[user_id] = BCcustomer.first_name + " " + BCcustomer.last_name;
          if (user_id == data.admin_customer_id) {
            $("#user_lists_tbody").append("<tr><td>" + BCcustomer.first_name + " " + BCcustomer.last_name + "</td><td>admin_user</td><td>" + BCcustomer.email + "</td><td></td></tr>");
          } else {
            $("#user_lists_tbody").append("<tr><td>" + BCcustomer.first_name + " " + BCcustomer.last_name + "</td><td>user</td><td>" + BCcustomer.email + "</td><td><button user_id='" +
              user_id + "' class='user_del button'>Delete</button></td></tr>");
          }
        },
        error: function(jqXHR, textStatus, errorThrown) {
          alert(JSON.stringify(jqXHR));
        }
      });
    }

    //delete user
    $(".user_del").click(function() {
      //delete user
      var target = $(this).attr("user_id");
      var index = data.customer_ids.indexOf(target);
      data.customer_ids.splice(index, 1);
      $.ajax({
        type: "POST",
        url: "https://0vvwag1o7b.execute-api.us-west-2.amazonaws.com/prod/company",
        // contentType: "application/json",
        headers: {
          "Access-Control-Allow-Origin": "*"
        },
        data: JSON.stringify(data),
        success: function(data) {
          var str_arr = window.location.href.split("/manager/");
          window.location.href = str_arr[0] + "/manager/#manageUsers";
          location.reload();
        },
        error: function(jqXHR, textStatus, errorThrown) {
          alert(JSON.stringify(jqXHR));
        }
      });
    });
  }

  //add user
  $("#add_user_save").click(function(event) {
    var user_email = $("#contact_email").val();
    if (user_email == "") {
      alert("Please input user_email");
      return;
    }
    $.ajax({
      type: "GET",
      url: "https://0vvwag1o7b.execute-api.us-west-2.amazonaws.com/prod/bc/customer?email=" + user_email,
      // contentType: "application/json",
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      statusCode: {
        400: function() {
          alert('Please input a valid email address!');
        },
        500: function() {
          alert('500 status code! server error');
        }
      },
      async: false,
      success: function(data) {
        //find user
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
            // contentType: "application/json",
            headers: {
              "Access-Control-Allow-Origin": "*"
            },
            data: JSON.stringify(jsonObj),
            success: function(data) {
              var str_arr = window.location.href.split("/manager/");
              window.location.href = str_arr[0] + "/manager/#manageUsers";
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
  });

  //
  //supply lists
  //
  var supply_lists_map = new Object();
  $.ajax({
    type: "GET",
    url: "https://0vvwag1o7b.execute-api.us-west-2.amazonaws.com/prod/supplylist?store_hash=" + store_hash + "&company_id=" + company.id,
    // contentType: "application/json",
    headers: {
      "Access-Control-Allow-Origin": "*"
    },
    async:false,
    success: function(data) {
        supplyLists_load_table(data);
    },
    error: function(jqXHR, textStatus, errorThrown) {
      alert(JSON.stringify(jqXHR));
    }
  });

  function supplyLists_load_table(supply_lists) {
    //load table
    for (var i = 0; i < supply_lists.length; i++) {
      supply_lists_map[supply_lists[i].id] = supply_lists[i].list_name;
      $(".supply_lists_tbody").append("<tr><td>" + supply_lists[i].list_name + "</td><td>" +
        supply_lists[i].skus + "</td><td>" + supply_lists[i].created_date +
        "</td><td class='admin_user_show'><button supply_list_id='" + supply_lists[i].id + "' class='edit_supplyList button'>Edit</button></td><td><button supply_list_id='" +
        supply_lists[i].id + "' class='create_quote button'>create</button></td></tr>");
    }

    if (!admin) {
      $(".admin_user_show").hide();
    }

    $("#create_supply_list").click(function() {
      $('#manage .content').css('display', 'none');
      $("#create_supplyList").css('display', 'block');
      load_edit_supply_lists("add", new Object());
    });

    $(".edit_supplyList").click(function() {
      $('#manage .content').css('display', 'none');
      $("#create_supplyList").css('display', 'block');
      var obj = new Object();
      var target = $(this).attr("supply_list_id");
      for (var i = 0; i < supply_lists.length; i++) {
        if (supply_lists[i].id == target) {
          obj = supply_lists[i];
        }
      }
      load_edit_supply_lists("edit", obj);
    });

    $(".create_quote").click(function() {
      $('#manage .content').css('display', 'none');
      $("#create_quote").css('display', 'block');
      var obj = new Object();
      var target = $(this).attr("supply_list_id");
      for (var i = 0; i < supply_lists.length; i++) {
        if (supply_lists[i].id == target) {
          obj = supply_lists[i];
        }
      }
      load_create_quote(obj);
    });

    //
    //add or edit supply lists
    //
    function load_edit_supply_lists(operator, obj) {
      if (operator == "edit") {
        $("#supply_list_name").val(obj.list_name);
        load_skus_table(obj.skus);
      }
      else {
        obj.skus = new Array();
      }

      //edit product skus
      $("#add_product").click(function() {
        var input_product = $("#product").val();
        if (input_product == "") {
          alert("Please input product sku!");
          return;
        }
        if (obj.skus.indexOf(input_product) > -1) {
          alert("Cannot add duplicate product!");
          return;
        }
        $.ajax({
          type: "GET",
          url: "https://f877mgrf34.execute-api.us-west-2.amazonaws.com/prod/b2b/bc/product?sku=" + input_product,
          // contentType: "application/json",
          headers: {
            "Access-Control-Allow-Origin": "*"
          },
          async: false,
          success: function(data) {
            //cannot find product sku
            if (typeof data === "undefined") {
              alert("Cannot find product sku!")
            } else {
              obj.skus.push(input_product);
              load_skus_table(obj.skus);
            }
          },
          error: function(jqXHR, textStatus, errorThrown) {
            alert(JSON.stringify(jqXHR));
          }
        });
      });

      //save button
      $("#save_supplyList").click(function() {
        var name = $("#supply_list_name").val();

        if (operator == "edit") {
          var jsonObj = obj;
          jsonObj.list_name = name;
        }
        else {
          var jsonObj = {
            "store_hash": store_hash,
            "company_id": company.id,
            "list_name": name,
            "skus": obj.skus
          };
        }
        $.ajax({
          type: "POST",
          url: "https://0vvwag1o7b.execute-api.us-west-2.amazonaws.com/prod/supplylist",
          // contentType: "application/json",
          dataType: "json",
          headers: {
            "Access-Control-Allow-Origin": "*"
          },
          data: JSON.stringify(jsonObj),
          success: function(data) {
            var str_arr = window.location.href.split("/manager/");
            window.location.href = str_arr[0] + "/manager/#supplyLists";
            location.reload();
          },
          error: function(jqXHR, textStatus, errorThrown) {
            alert(JSON.stringify(jqXHR));
          }
        });
      });

      $("#cancel_supplyList").click(function() {
        // var str_arr = window.location.href.split("/manager/");
        // window.location.href = str_arr[0] + "/manager/#supplyLists";
        // location.reload();
        $('#manage .content').css('display', 'none');
        $("#supplyLists").css('display', 'block');
      });

      //
      //load skus table in create or edit supply lists
      //
      function load_skus_table(product_skus) {
        $("#skus_table_tbody").html("");
        for(var i=0; i<product_skus.length; i++) {
          $.ajax({
            type: "GET",
            url: "https://0vvwag1o7b.execute-api.us-west-2.amazonaws.com/prod/bc/product?sku=" + product_skus[i],
            // contentType: "application/json",
            headers: {
              "Access-Control-Allow-Origin": "*"
            },
            async:false,
            success: function(data) {
              if(data.length == 0) {
                return;
              }
              $("#skus_table_tbody").append("<tr><td>" + data[0].name + "</td><td>"
              + data[0].sku + "</td><td><button skus='" + data[0].sku + "' class='delete_skus button'>Delete</button></td></tr>")
            },
            error: function(jqXHR, textStatus, errorThrown) {
              alert(JSON.stringify(jqXHR));
            }
          });
        }

        $(".delete_skus").click(function() {
          var target_sku = $(this).attr("skus");
          var index = obj.skus.indexOf(target_sku);
          if(index > -1) {
            obj.skus.splice(index, 1);
          }
          load_skus_table(obj.skus);
        });

      }
    }

    //
    //create quote
    //
    function load_create_quote(obj) {
      //load product skus
      $("#product_skus_tbody").text("");
      for (var i = 0; i < obj.skus.length; i++) {
        $("#product_skus_tbody").append("<tr><td>" + obj.skus[i] + "</td><td><input id='" + obj.skus[i] + "' value='0'></td></tr>");
      }
      //according to supply list id
      $("#quote_supply_list_name").text("Supply List Name:" + obj.list_name);

      //save button
      $("#save_quote").click(function() {
        var line_items = new Array();
        for (var i = 0; i < obj.skus.length; i++) {
          var tmpObj = new Object();
          tmpObj.sku = obj.skus[i];
          tmpObj.qty = parseInt($("#" + obj.skus[i]).val());
          tmpObj.price = 100.00;
          line_items.push(tmpObj);
        }

        var jsonObj = {
          "store_hash": obj.store_hash,
          "company_id": obj.company_id,
          "supply_list_id": obj.id,
          "customer_id": parseInt(customer_id),
          "expiration_date": "2018-12-31",
          "line_items": line_items
        };
        $.ajax({
          type: "POST",
          url: "https://0vvwag1o7b.execute-api.us-west-2.amazonaws.com/prod/quote",
          // contentType: "application/json",
          dataType: "json",
          headers: {
            "Access-Control-Allow-Origin": "*"
          },
          data: JSON.stringify(jsonObj),
          success: function(data) {
            var str_arr = window.location.href.split("/manager/");
            window.location.href = str_arr[0] + "/manager/#supplyLists";
            location.reload();
          },
          error: function(jqXHR, textStatus, errorThrown) {
            alert(JSON.stringify(jqXHR));
          }
        });

      });

      $("#cancel_requisition").click(function() {
        // var str_arr = window.location.href.split("/manager/");
        // window.location.href = str_arr[0] + "/manager/#masterLists";
        // location.reload();
        $('#manage .content').css('display', 'none');
        $("#masterLists").css('display', 'block');
      });
    }
  }

  //
  //quotes
  //
  //admin user can see all quote lists
  if (admin) {
    $.ajax({
      type: "GET",
      url: "https://0vvwag1o7b.execute-api.us-west-2.amazonaws.com/prod/quote?store_hash=" + store_hash + "&company_id=" + company.id,
      // contentType: "application/json",
      headers: {
        "Access-Control-Allow-Origin": "*"
      },

      success: function(data) {
        quote_load_table(data);
      },
      error: function(jqXHR, textStatus, errorThrown) {
        alert(JSON.stringify(jqXHR));
      }
    });
  } else {
    //normal use only can see quote created by themselves
    $.ajax({
      type: "GET",
      url: "https://0vvwag1o7b.execute-api.us-west-2.amazonaws.com/prod/quote?store_hash=" + store_hash + "&company_id=" + company.id + "&customer_id=" + customer_id,
      // contentType: "application/json",
      headers: {
        "Access-Control-Allow-Origin": "*"
      },

      success: function(data) {
        quote_load_table(data);
      },
      error: function(jqXHR, textStatus, errorThrown) {
        alert(JSON.stringify(jqXHR));
      }
    });
  }

  function quote_load_table(quote_lists) {
    //load table
    for (var i = 0; i < quote_lists.length; i++) {
      $("#quote_lists_tbody").append("<tr><td>" + supply_lists_map[quote_lists[i].supply_list_id] + "</td><td>"
      + customer_map[quote_lists[i].customer_id.toString()] + "</td><td>" + quote_lists[i].updated_date
      + "</td><td><button quote_id='" + quote_lists[i].id
      + "' class='button show_quote'>Show</button></td></tr>");
    }

    $(".show_quote").click(function() {
      var target_id = $(this).attr("quote_id");
      var quote = new Object();
      for(var i=0; i<quote_lists.length; i++) {
        if(quote_lists[i].id == target_id) {
          quote = quote_lists[i];
        }
      }
      $('#manage .content').css('display', 'none');
      $("#show_quote").css('display', 'block');
      load_show_quote(quote);
    });

    function load_show_quote(quote) {
      var total_price = 0;
      $("#products_table_tbody").html("");
      var pricedata = new Object();
      $.ajax({
        type: "GET",
        url: "https://0vvwag1o7b.execute-api.us-west-2.amazonaws.com/prod/pricelist?id=" + company.price_list_id,
        // contentType: "application/json",
        headers: {
          "Access-Control-Allow-Origin": "*"
        },
        async:false,
        success: function(data) {
          pricedata = data;
        },
        error: function(jqXHR, textStatus, errorThrown) {
          alert(JSON.stringify(jqXHR));
        }
      });

      for (var i=0; i<quote.line_items.length; i++) {
        $.ajax({
          type: "GET",
          url: "https://0vvwag1o7b.execute-api.us-west-2.amazonaws.com/prod/bc/product?sku=" + quote.line_items[i].sku,
          // contentType: "application/json",
          headers: {
            "Access-Control-Allow-Origin": "*"
          },
          async:false,
          success: function(data) {
            if(data.length == 0) {
              return;
            }
            quote.line_items[i].id = data[0].id;
            //tier price
            if(pricedata.price_type_id == "1") {
              console.log("tier price");
              var res = 0;
              var exist = false;
              for (var prop in pricedata.tier_price) {
                  if(!pricedata.tier_price.hasOwnProperty(prop))  {
                    continue;
                  }
                  if(parseInt(prop) > res && quote.line_items[i].qty >= parseInt(prop)) {
                    res = parseInt(prop);
                    exist = true;
                  }
              }
              if(!exist) {
                quote.line_items[i].price = parseFloat(data[0].price);
              }
              else {
                quote.line_items[i].price = parseFloat(data[0].price) * (1-parseFloat(pricedata.tier_price[res.toString()])/100);
              }
            }
            else if(pricedata.price_type_id == "2") {
              console.log("sku price");
              if(pricedata.tier_price.hasOwnProperty(data[0].sku))  {
                quote.line_items[i].price = pricedata.tier_price[data[0].sku];
              }
              else {
                quote.line_items[i].price = parseFloat(data[0].price);
              }
            }

            var tmp_price = quote.line_items[i].price * quote.line_items[i].qty;
            $("#products_table_tbody").append("<tr><td>" + data[0].name + "</td><td>"
            + data[0].sku + "</td><td>" + data[0].description +"</td><td>$" + quote.line_items[i].price.toFixed(2)
            + "</td><td>" + quote.line_items[i].qty + "</td><td>$" + tmp_price.toFixed(2)  +"</td></tr>");
            total_price += tmp_price;
          },
          error: function(jqXHR, textStatus, errorThrown) {
            alert(JSON.stringify(jqXHR));
          }
        });
      }
      $("#products_table_tbody").append("<tr><td></td><td></td><td></td><td></td><td></td><td>$" + total_price.toFixed(2)  +"</td></tr>");

      $("#add_to_cart").click(function() {
        var str_arr = window.location.href.split("/manager");
        var url = str_arr[0] + "/b2bcart/?lineItem=" + quote.line_items.length + "&";
        for(var i=0; i<quote.line_items.length; i++) {
          var obj = new Object();
          obj["sku" + i] = quote.line_items[i].sku;
          obj["price" + i] = quote.line_items[i].price;
          obj["quantity" + i] = quote.line_items[i].qty;
          url += $.param(obj) + "&";
        }
        window.location.href = url;
      });

      $("#show_quote_cancel").click(function() {
        $('#manage .content').css('display', 'none');
        $("#quotes").css('display', 'block');
      });
    }

  }

}
