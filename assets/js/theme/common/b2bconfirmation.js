/**
 * Created by silk on 2017/9/4.
 */
import $ from 'jquery';
export default function() {
  console.log("b2bconfirmation.js");
// ?orderId=or_1AzLNYG0T4iZuYsK8dwrjoBL&bill-first-name=ray&bill-last-name=zhang&
// bill-phone=111-111-1111&bill-email=ray.zhang%40silksoftware.com&bill-address=laguna+Road&
// bill-state=California&bill-city=Irvine&bill-zipcode=92618&bill-country=United+States&
//ship-first-name=&ship-last-name=&ship-address=&ship-state=&ship-city=&ship-zipcode=&ship-country=Country&price0=21.99&price1=12.99&price2=12.99&
// stripeToken=tok_1AzLNkG0T4iZuYsKBBVbt1WA&stripeTokenType=card&stripeEmail=111%40test.com

  var searchParams = new URLSearchParams(window.location.search);
  var orderId = searchParams.get("orderId");
  var stripeToken = searchParams.get("stripeToken");

  if (orderId.length > 0 && stripeToken.length > 0) {
      //binding orderId to stripeToken
      var str = JSON.stringify({
          "orderId": orderId,
          "stripeToken": stripeToken
      });
      $.ajax({
          type: "POST",
          url: "https://0vvwag1o7b.execute-api.us-west-2.amazonaws.com/prod/stripe/pay",
          crossDomain: true,
          contentType: "application/json",
          data: str,

          success: function(result) {
              var bcOrder = {}

              bcOrder["customer_message"] = JSON.stringify({
                  "Stripe Order ID": result["id"],
                  "Stripe Charge ID": result["charge"]
              });

              bcOrder["billing_address"] = {
                "first_name": searchParams.get("bill-first-name"),
                "last_name":  searchParams.get("bill-last-name"),
                "street_1":  searchParams.get("bill-address"),
                "city":  searchParams.get("bill-city"),
                "state":  searchParams.get("bill-state"),
                "zip":  searchParams.get("bill-zipcode"),
                "country": searchParams.get("bill-country")
              };

              bcOrder["shipping_addresses"] = []
              if(searchParams.get("ship-first-name") == "") {
                bcOrder["shipping_addresses"].push(bcOrder["billing_address"]);
              }
              else {
                bcOrder["shipping_addresses"].push({
                  "first_name": searchParams.get("ship-first-name"),
                  "last_name":  searchParams.get("ship-last-name"),
                  "street_1":  searchParams.get("ship-address"),
                  "city":  searchParams.get("ship-city"),
                  "state":  searchParams.get("ship-state"),
                  "zip":  searchParams.get("ship-zipcode"),
                  "country": searchParams.get("ship-country")
                });
              }

              //hard code
              var productid = 136;

              bcOrder["products"] = []
              for(var i=0; i<searchParams.get("items"); i++) {
                if(searchParams.get("qty" + i) > 0) {
                  bcOrder["products"].push({
                    "product_id": productid++,
                    "price_inc_tax": searchParams.get("price" + i),
                    "price_ex_tax": searchParams.get("price" + i),
                    "quantity": searchParams.get("qty" + i)
                  });
                }
              }

              console.log(bcOrder);
              //create BC order
              $.ajax({
                  type: "POST",
                  url: "https://0vvwag1o7b.execute-api.us-west-2.amazonaws.com/prod/bc/order",
                  crossDomain: true,
                  contentType: "application/json",
                  data: JSON.stringify(bcOrder),

                  success: function(result) {
                      console.log(result);
                      $("#ordernumber").text(result.id);
                      $("#ordernumber").attr("href", "https://store-h3jnjw30qw.mybigcommerce.com/manage/orders/" + result["id"])
                      $("#emailaddress").text(searchParams.get("bill-email"));
                  }
              });
          }
      });
  }

}
