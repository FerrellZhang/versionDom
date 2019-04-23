/**
 * Created by silk on 2017/9/4.
 */
import $ from 'jquery';
export default function() {
  var store_hash = "h3jnjw30qw"
  console.log("b2bcheckout.js");
  // url parameters
  var searchParams = new URLSearchParams(window.location.search);
  var lineItem = searchParams.get("lineItem");
  var cartItems = new Array();
  for(var i=0; i<lineItem; i++) {
    var obj = new Object();
    obj.sku = searchParams.get("sku" + i);
    obj.price = searchParams.get("price" + i);
    obj.quantity = searchParams.get("quantity" + i);
    cartItems.push(obj);
  }

  var subTotal = 0.00;
  var discount = 0.00;
  var total = 0.00
  for (var i = 0; i < cartItems.length; i++) {
    var lineTotal = parseFloat(cartItems[i].price) * parseFloat(cartItems[i].quantity);
    $("#b2bcheckout_tbody").append("<tr><td><input name='product" + i + "' value='" + cartItems[i].sku + "'hidden />"
    + cartItems[i].sku + "</td><td><input name='price" + i
    + "' type='number' value='" + parseFloat(cartItems[i].price) + "'readonly /></td>"
    + "<td><input name='qty" + i + "' type='number' value='" +
    parseFloat(cartItems[i].quantity) + "'readonly /></td><td>" + lineTotal + "</td></tr>");
    subTotal += lineTotal;
  }
  var minusPrice = (subTotal * discount).toFixed(2);
  total = subTotal - minusPrice;
  $("#subtotal").text("Subtotal: $" + subTotal.toFixed(2));
  $("#discount").html("Discount (" + discount + "%): <span class='text-danger'>-$" + minusPrice + "</span>");
  var ship_fee = 10
  $("#ship_fee").text("Shipping: $" + ship_fee.toFixed(2));

  var taxArray = new Array();
  //get tax
  $.ajax({
    type: "GET",
    url: "https://0vvwag1o7b.execute-api.us-west-2.amazonaws.com/prod/tax?store_hash=" + store_hash,
    headers: {
      "Access-Control-Allow-Origin": "*"
    },
    async: false,
    success: function(data) {
      taxArray = data;
      var zipcode = $("input[name=bill-zipcode]").val();
      if($("#differect_box").is(":checked")) {
        zipcode = $("input[name=ship-zipcode]").val();
      }
      if(zipcode == "") {
        return;
      }
      for(var i=0; i<data.length; i++) {
        if(parseInt(zipcode) > parseInt(data[i].postcode_from) && parseInt(zipcode) < parseInt(data[i].postcode_to)) {
          var tax = total * parseFloat(data[i].rate) / 100;
          $("#tax").text("Tax(" + data[i].rate + "): $" + tax.toFixed(2));
          total += tax + ship_fee;
          $("#total").text("Total: $" + total.toFixed(2));
        }
      }
    }
  });



  //strip data
  var data = {};
  var orderData = {};
  orderData["items"] = [];
  var orderId = "";

  $("#back").click(function() {
    var str_arr = window.location.href.split("/b2bcheckout/");
    var url = str_arr[0] + "/b2bcart/?lineItem=" + cartItems.length + "&";
    for(var i=0; i<cartItems.length; i++) {
      var obj = new Object();
      obj["sku" + i] = cartItems[i].sku;
      obj["price" + i] = cartItems[i].price;
      obj["quantity" + i] = cartItems[i].quantity;
      url += $.param(obj) + "&";
    }
    window.location.href = url;
  });

  $("#pay").click(function() {
    //construction order data
    orderData["items"].push({
        "type": "sku",
        "parent": "silk_b2b",
        "quantity": 1
    });
    $.ajax({
        type: "POST",
        url: "https://0vvwag1o7b.execute-api.us-west-2.amazonaws.com/prod/stripe/sku/price",
        crossDomain: true,
        contentType: "application/json",
        data: JSON.stringify({
            "id": "silk_b2b",
            "price": Math.round(total * 100)
        }),
        success: function(result) {
            console.log(result);
            createOrder();
        }
    });
  });

  function createOrder() {
    orderData["email"] = $("input[name='bill-email']").val();
    console.log("orderData = " + JSON.stringify(orderData));
    $.ajax({
        type: "POST",
        url: "https://0vvwag1o7b.execute-api.us-west-2.amazonaws.com/prod/stripe/order",
        crossDomain: true,
        contentType: "application/json",
        data: JSON.stringify(orderData),

        success: function(result) {
            console.log(result);
            $("input[name='orderId']").val(result['id']);
            $("input[name='items']").val(cartItems.length);
            $("#checkout").attr("data-amount", result['amount']);
            $(".stripe-button-el").click();
        }
    });
  }
}
