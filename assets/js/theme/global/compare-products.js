import $ from 'jquery';
import _ from 'lodash';

function handleItemImage(counter) {
    const $compareProductList = $("#compareProductList");
    $compareProductList.html("");
    counter.forEach(function(value, index){
        const itemImage = $(`#compare-${value}`).parents(".card").find(".card-image").attr("src");
        const $addItem = '<li class="compare-product-item" bottom-compare-item-' + value + '>'+
                         '<div class="compare-item-inner" style="background-image:url('+itemImage+')">'+
                         '<span class="compare-item-delete icon" bottom-compare-delete bottom-compare-delete-id="' +value+ '">'+
                         '<svg><use xlink:href="#icon-close"></use></svg>'+
                         '</span>'+
                         '</div>'+
                         '</li>';
        $compareProductList.append($addItem);
    });
}

function decrementCounter(counter, item) {
    const index = counter.indexOf(item);

    if (index > -1) {
        counter.splice(index, 1);
    }
}

function incrementCounter(counter, item) {
    counter.push(item);
}

function updateCounterNav(counter, $link, urlContext) {
    if (counter.length !== 0) {
        if (!$link.is('visible')) {
            $link.addClass('show');
        }
        //$link.attr('href', `${urlContext.compare}/${counter.join('/')}`);
        //$link.find('span.countPill').html(counter.length);
        $link.find(".compare-link").attr('href', `${urlContext.compare}/${counter.join('/')}`);
    } else {
        $link.removeClass('show');
    }
    handleItemImage(counter);
}

export default function (urlContext) {
    let products;

    const $checked = $('body').find('input[name="products\[\]"]:checked');
    //const $compareLink = $('a[data-compare-nav]');
    const $compareLink = $('[data-compare-section]');

    if ($checked.length !== 0) {
        products = _.map($checked, (element) => element.value);

        updateCounterNav(products, $compareLink, urlContext);
    }

    const compareCounter = products || [];

    $('body').on('click', '[data-compare-id]', (event) => {
        const product = event.currentTarget.value;
        //const $clickedCompareLink = $('a[data-compare-nav]');
        const $clickedCompareLink = $('[data-compare-section]');

        if (event.currentTarget.checked) {
            // incrementCounter(compareCounter, product);
            if(compareCounter.length < 4) {
                incrementCounter(compareCounter, product);
            } else {
                //alert('Please select 2 - 4 products to compare.');
                $("#alertWindow").addClass("show");
                $("#alertInfo").html("Please select 2 - 4 products to compare.");
                return event.preventDefault();
            }
        } else {
            decrementCounter(compareCounter, product);
        }

        updateCounterNav(compareCounter, $clickedCompareLink, urlContext);
    });

    $('body').on('submit', '[data-product-compare]', (event) => {
        const $this = $(event.currentTarget);
        const productsToCompare = $this.find('input[name="products\[\]"]:checked');

        if (productsToCompare.length <= 1) {
            //alert('You must select at least two products to compare');
            $("#alertWindow").addClass("show");
            $("#alertInfo").html("Please select 2 - 4 products to compare.");
            event.preventDefault();
        }
    });

    $('body').on('click', 'a[data-compare-nav]', () => {
        const $clickedCheckedInput = $('body').find('input[name="products\[\]"]:checked');

        if ($clickedCheckedInput.length <= 1) {
            //alert('You must select at least two products to compare');
            $("#alertWindow").addClass("show");
            $("#alertInfo").html("Please select 2 - 4 products to compare.");

            return false;
        }
    });

    $('body').on('click', '[bottom-compare-delete]', (event) => {
        const $target = $(event.currentTarget);
        const productId = $target.attr("bottom-compare-delete-id");
        const $clickedCompareLink = $('[data-compare-section]');

        $(`#compare-${productId}`).removeAttr("checked");
        decrementCounter(compareCounter, productId);
        updateCounterNav(compareCounter, $clickedCompareLink, urlContext);
    });

    $("#alertWindow").on("click", function(){
        $(this).removeClass("show");
    });
}
