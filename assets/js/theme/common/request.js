import $ from 'jquery';
export default function() {
  console.log("request.js");

  var customer_id = parseInt(sessionStorage.getItem("customer_id"));
  var store_hash = "h3jnjw30qw";
  var admin = sessionStorage.getItem("admin");
  var company = JSON.parse(sessionStorage.getItem("company"));
  var request_id = sessionStorage.getItem("request");
  var request_content = {};
  var pricedata = {};
  var newrow = 0;
  var disable_change = false;

  $(document).ready(function() {

    //get pricelist
    $.ajax({
      type: "GET",
      url: "https://0vvwag1o7b.execute-api.us-west-2.amazonaws.com/prod/pricelist?id=" + company.price_list_id,
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

    //admin user
    if(admin == "isAdmin") {
      console.log("admin");
      //new
      if(request_id == "new") {
        console.log("new");
      }
      //update
      else {
        request_content = JSON.parse(sessionStorage.getItem("request_content"));
        console.log("update");
        if(request_content.quote_status == "Ordered") {
          console.log("Ordered");
          disable_change = true;
          $("#save").hide();
          $("#add_product_line").hide();
          $("#add_to_cart").hide();
        }
      }
    }
    //subuser
    else {
      console.log("subuser");
      $("#add_to_cart").text("Send Request");
      $(".text2").hide();
      //new
      if(request_id == "new") {
        console.log("new");
      }
      //update
      else {
        request_content = JSON.parse(sessionStorage.getItem("request_content"));
        console.log("update");
        if(request_content.quote_status == "Ordered" || request_content.quote_status == "Pending") {
          console.log("Ordered or Pending");
          disable_change = true;
          $("#save").hide();
          $("#add_product_line").hide();
          $("#add_to_cart").hide();
        }
      }
    }

    $(document).on("change", ".sku_search", function() {
      console.log("search");
      var sku = this.value;
      var rowid = $(this).attr("row");
      var element = $(this);
      if(sku == "") {
        alert("Please input SKU!");
        return;
      }
      console.log(request_content.line_items);
      for(var i=0; i<request_content.line_items.length; i++) {
        if(request_content.line_items[i].sku == sku) {
          alert("SKU already exists!");
          return;
        }
      }
      $.ajax({
        type: "GET",
        url: "https://0vvwag1o7b.execute-api.us-west-2.amazonaws.com/prod/bc/product?sku=" + sku,
        headers: {
          "Access-Control-Allow-Origin": "*"
        },
        async:false,
        success: function(data) {
          if(typeof data === "undefined") {
            alert("Please input valid SKU!");
            return;
          }

          //product image
          $.ajax({
            type: "GET",
            url: "https://0vvwag1o7b.execute-api.us-west-2.amazonaws.com/prod/bc/product/image?id=" + data[0].id,
            headers: {
              "Access-Control-Allow-Origin": "*"
            },
            async:false,
            success: function(picture) {
              var url = "";
              if(typeof picture !== "undefined") {
                url = picture[0].tiny_url;
              }
              element.attr("readonly", true);
              //request_content
              var item = {};
              item.sku = data[0].sku;
              item.default_price = parseFloat(data[0].price);
              request_content.line_items.push(item);

              $("#new_row_" + rowid + " img").attr("src", url);
              $("#new_row_" + rowid + " .name").text(data[0].name);
              $("#new_row_" + rowid + " .unit").text("$" + item.default_price.toFixed(2));
              $("#new_row_" + rowid + " .unit").attr("id", data[0].sku + "_unit");
              $("#new_row_" + rowid + " .changeQty").attr("sku", data[0].sku);
              $("#new_row_" + rowid + " .line_total").attr("id", data[0].sku + "_line_total");
              $("#new_row_" + rowid + " .delete_row").attr("sku", data[0].sku);
              $("#new_row_" + rowid).attr("id", data[0].sku + "_row");
              //hover
              $("#" + data[0].sku + "_row").hover(function() {
                var $div= $("<div id='tip' class='row'><span>"+ data[0].description + "<span></div>");
                //style
                $(this).after($div);
                $div.css({"position":"absolute", "background": "LightGray"});

              }, function() {
                $("#tip").remove();
              });

            },
            error: function(jqXHR, textStatus, errorThrown) {
              alert(JSON.stringify(jqXHR));
            }
          });

        },
        error: function(jqXHR, textStatus, errorThrown) {
          alert(JSON.stringify(jqXHR));
        }
      });
    });

    $(document).on("change", ".changeQty", function() {
      var item = {};
      var sku = $(this).attr("sku");
      var quantity = 0;

      if(this.value != "") {
        var quantity = parseInt(this.value);
      }

      for(var i=0; i<request_content.line_items.length; i++) {
        if(request_content.line_items[i].sku == sku) {
          item = request_content.line_items[i];
        }
      }
      item.qty = parseInt(quantity);
      cal_unit_price(item)
      $("#" + sku + "_unit").text("$" + item.price.toFixed(2));
      var line_total = item.price * item.qty;
      $("#" + sku + "_line_total").text("$" + line_total.toFixed(2));
      cal_total();
    })

    $(document).on("click", ".delete_row", function() {
      var sku = $(this).attr("sku");
      if(sku == "new_row") {
        var rowid = $(this).attr("row");
        $("#new_row_" + rowid).remove();
      }
      else {
        $("#" + sku + "_row").remove();
        for(var i=0; i<request_content.line_items.length; i++) {
          if(request_content.line_items[i].sku == sku) {
            request_content.line_items.splice(i, 1);
            return;
          }
        }
      }
    })


    $("#add").click(function() {
      var src_path = $("#del_icon").attr("src");
      $("#request_table").append("<tr id='new_row_" + newrow +
      "'><td><img src=''></td><td><input class='sku_search' row='" + newrow + "' size='15'></td><td class='name'></td><td class='unit'>$0.00</td><td>" +
      "<input class='changeQty' type='number' value='0'></input></td><td class='line_total'>$0.00</td><td><img class='delete_row' src='" + src_path +
      "' sku='new_row' row='" + newrow + "'></img></td></tr>");
      newrow++;
    });


    //update request
    //load table
    if(request_id != "new") {
      $("#path").text(" Order Request " + request_id.split("-")[0]);
      var subtotal = 0.00;
      for(var i=0; i<request_content.line_items.length; i++) {
        var item = request_content.line_items[i];
        $.ajax({
          type: "GET",
          url: "https://0vvwag1o7b.execute-api.us-west-2.amazonaws.com/prod/bc/product?sku=" + item.sku,
          headers: {
            "Access-Control-Allow-Origin": "*"
          },
          async:false,
          success: function(data) {
            if(typeof data === "undefined") {
              return;
            }

            request_content.line_items[i].product_id = data[0].id;
            //get product image
            $.ajax({
              type: "GET",
              url: "https://0vvwag1o7b.execute-api.us-west-2.amazonaws.com/prod/bc/product/image?id=" + data[0].id,
              headers: {
                "Access-Control-Allow-Origin": "*"
              },
              async:false,
              success: function(picture) {

                //product image
                var url = "";
                if(typeof picture !== "undefined") {
                  url = picture[0].tiny_url;
                }
                item.default_price = data[0].price;
                cal_unit_price(item, data[0].price);
                var line_total = item.price * item.qty;
                var src_path = $("#del_icon").attr("src");
                $("#request_table").append("<tr size='15' id='" + item.sku + "_row'><td><img src='" + url + "'</td><td>" + item.sku + "</td><td>" +
                data[0].name +"</td><td id='" + item.sku + "_unit'>$" + item.price.toFixed(2) + "</td><td><input class='changeQty' sku='" + item.sku + "' type='number' value='" +
                item.qty + "'></input></td><td id='" + item.sku + "_line_total'>$" + line_total.toFixed(2) +
                "</td><td><img class='delete_row' sku='" + item.sku + "' src='" + src_path + "' ></img></td></tr>");
                //hover show description
                $("#" + item.sku + "_row").hover(function() {
                  var $div= $("<div id='tip' class='row'><span>"+ data[0].description + "<span></div>");
                  //style
                  $(this).after($div);
                  $div.css({"position":"absolute", "background": "LightGray",});

                }, function() {
                  $("#tip").remove();
                });
                subtotal += line_total;
              },
              error: function(jqXHR, textStatus, errorThrown) {
                alert(JSON.stringify(jqXHR));
              }
            });

          },
          error: function(jqXHR, textStatus, errorThrown) {
            alert(JSON.stringify(jqXHR));
          }
        });

      }
      cal_total();
    }
    //new request
    else {
      $("#path").text("New Order Request");
      request_content.store_hash = store_hash;
      request_content.company_id = company.id;
      request_content.supply_list_id = "XXX";
      request_content.customer_id = customer_id;
      request_content.expiration_date = "2018-12-31";
      request_content.quote_status = "Draft";
      request_content.line_items = new Array();
      for(var i=0; i<5; i++) {
        $("#add").click();
      }
    }

    // $("#b2bportal").click(function() {
    //   var str_arr = window.location.href.split("/request/");
    //   window.location.href = str_arr[0] + "/b2bportal/";
    // })
    //
    // $("#orderrequests").click(function() {
    //   var str_arr = window.location.href.split("/request/");
    //   window.location.href = str_arr[0] + "/orderrequests/";
    // })

    function save_request(my_status) {
      request_content.quote_status = my_status;
      if(request_content.line_items.length == 0) {
        alert("No items in request!");
        return;
      }
      $.ajax({
        type: "POST",
        url: "https://0vvwag1o7b.execute-api.us-west-2.amazonaws.com/prod/quote",
        data: JSON.stringify(request_content),
        headers: {
          "Access-Control-Allow-Origin": "*"
        },
        async:false,
        success: function(data) {
          console.log(data);
          sessionStorage.setItem("request_id", data.id);
        },
        error: function(jqXHR, textStatus, errorThrown) {
          alert(JSON.stringify(jqXHR));
        }
      });
    }

    $("#save").click(function() {
      save_request("Draft");
      var str_arr = window.location.href.split("/request/");
      window.location.href = str_arr[0] + "/orderrequests/";
    });

    $("#cancel").click(function() {
      var str_arr = window.location.href.split("/request/");
      window.location.href = str_arr[0] + "/orderrequests/";
    })

    $("#add_to_cart").click(function() {
      //admin:get to cart
      if(admin == "isAdmin") {
        save_request("Draft");
        //build data
        var body = new Object();
        body.store_hash = store_hash;
        body.data = new Object();
        body.data.line_items = new Array();
        for(var i=0; i<request_content.line_items.length; i++) {
          var item = new Object();
          item.product_id = request_content.line_items[i].product_id;
          item.quantity = request_content.line_items[i].qty;
          item.list_price = request_content.line_items[i].price;
          body.data.line_items.push(item);
        }
        $.ajax({
          type: "POST",
          url: "https://0vvwag1o7b.execute-api.us-west-2.amazonaws.com/prod/bc/cart",
          data: JSON.stringify(body),
          headers: {
            "Access-Control-Allow-Origin": "*"
          },
          async:false,
          success: function(data) {
            console.log(data);
            window.location.href = data.data.cart_url;
          },
          error: function(jqXHR, textStatus, errorThrown) {
            alert(JSON.stringify(jqXHR));
          }
        });
      }
      //subuser:send request
      else {
        save_request("Pending");
        var str_arr = window.location.href.split("/request/");
        window.location.href = str_arr[0] + "/orderrequests/";
      }

    });

  });

  function cal_total() {
    var subtotal = 0.00;
    var total = 0.00;
    for(var i=0; i<request_content.line_items.length; i++) {
      subtotal += request_content.line_items[i].price * request_content.line_items[i].qty;
    }
    total += subtotal;
    $("#subtotal").text("$" + subtotal.toFixed(2));
    var tax = total * 7.5 / 100;
    total += tax;
    $("#tax").text("$" + tax.toFixed(2));
    var ship = 10.00;
    total += ship;
    $("#ship").text("$" + ship.toFixed(2));
    $("#total").text("$" + total.toFixed(2));
  }

  function cal_unit_price(item) {
    if(pricedata.price_type_id == "1") {
      var res = 0;
      var exist = false;
      for (var prop in pricedata.tier_price) {
          if(!pricedata.tier_price.hasOwnProperty(prop))  {
            continue;
          }
          if(parseInt(prop) > res && item.qty >= parseInt(prop)) {
            res = parseInt(prop);
            exist = true;
          }
      }
      if(!exist) {
        item.price = parseFloat(item.default_price);
      }
      else {
        item.price = parseFloat(item.default_price) * (1-parseFloat(pricedata.tier_price[res.toString()])/100);
      }
    }
    else if(pricedata.price_type_id == "2") {
      if(pricedata.tier_price.hasOwnProperty(item.sku))  {
        item.price = pricedata.tier_price[item.sku];
      }
      else {
        item.price = parseFloat(item.default_price);
      }
    }
  }

}
