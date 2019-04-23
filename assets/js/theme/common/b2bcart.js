/**
 * Created by silk on 2017/9/4.
 */
import $ from 'jquery';
export default function() {
  console.log("b2bcart.js");
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

  // var cartItems = [
  //   {
  //     "name": "Stripe Product 001",
  //     "id": "product_001_test",
  //     "price": "18.99",
  //     "quantity": "2"
  //   },
  //   {
  //     "name": "Stripe Product 002",
  //     "id": "product_002_test",
  //     "price":"12.99",
  //     "quantity": "3"
  //   },
  //   {
  //     "name": "Stripe Product 003",
  //     "id": "product_003_test",
  //     "price":"12.99",
  //     "quantity": "3"
  //   }
  // ];


  for(var i=0; i<cartItems.length; i++) {
    $("#b2bcart_tbody").append("<tr><td>" + cartItems[i].sku + "</td><td id='price" + i
    + "'>" + parseFloat(cartItems[i].price).toFixed(2) + "</td>"
    + "<td id='qty" + i + "'>" + parseInt(cartItems[i].quantity) + "</td><td><span id='lineTotal" + i + "'></span></td></tr>");
  }
  updateTotal();

  for (var i = 0; i <= cartItems.length; i++) {
      $("#price" + i).change(function() {
        updateTotal();
      });
      $("#qty" + i).change(function() {
        updateTotal();
      });
  }

  function updateTotal() {
    var discount = 0;
    var subTotal = 0.00;
    var discount = 0;
    for(var i=0; i<cartItems.length; i++) {
      var lineTotal = parseFloat($("#price"+ i).text()) * parseInt($("#qty"+ i).text());
      $("#lineTotal" + i).text(lineTotal.toFixed(2));
      subTotal += lineTotal;
    }
    var minusPrice = (subTotal * discount).toFixed(2);
    $("#subtotal").text("Subtotal: $" + subTotal.toFixed(2));
    $("#discount").html("Discount (" + discount + "%): <span class='text-danger'>-$" + minusPrice + "</span>");
    $("#total").text("Total: $" + (subTotal-minusPrice).toFixed(2));
  }

  $("#cancel").click(function() {
    var str_arr = window.location.href.split("/b2bcart");
    window.location.href = str_arr[0] + "/manager/#quotes";
  });

  $("#checkout").click(function() {
    var str_arr = window.location.href.split("/b2bcart");
    var url = str_arr[0] + "/b2bcheckout/?lineItem=" + cartItems.length + "&";
    for(var i=0; i<cartItems.length; i++) {
      var obj = new Object();
      obj["sku" + i] = cartItems[i].sku;
      obj["price" + i] = cartItems[i].price;
      obj["quantity" + i] = cartItems[i].quantity;
      url += $.param(obj) + "&";
    }
    window.location.href = url;
  })
}
