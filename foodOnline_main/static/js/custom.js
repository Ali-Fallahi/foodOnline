$(document).ready(function () {

    //get latitude and longitude using API in home page
    if (document.getElementById('home-search')) {
        document.getElementById('home-search').addEventListener('submit', function (event) {
            event.preventDefault(); // Prevent form submission

            var address = document.getElementById('id_address').value;

            // Send a request to the API to get latitude and longitude
            fetch('https://us1.locationiq.com/v1/search?q=' + address + '&key=pk.b488c4e5d0fcd29ac9ddf8894ef3fbfd' + '&format=json')
                .then(function (response) {
                    return response.json();
                })
                .then(function (data) {
                    console.log(data)
                    // Populate the hidden inputs with latitude and longitude
                    document.getElementById('id_latitude').value = data[0]['lat'];
                    document.getElementById('id_longitude').value = data[0]['lon'];

                    // Submit the form
                    document.getElementById('home-search').submit();
                })
                .catch(function (error) {
                    console.log(error);
                    $('#notFoundBadge').removeClass('d-none');
                    // Handle error scenarios if needed
                });
        });
    }
    //add to cart
    $('.add_to_cart').on('click', function (e) {
        e.preventDefault();

        food_id = $(this).attr('data-id');
        url = $(this).attr('data-url');

        $.ajax({
            type: 'GET',
            url: url,
            success: function (response) {
                console.log(response)
                if (response.status === 'login_required') {
                    swal(response.message, '', 'info').then(function () {
                        window.location = '/login';
                    })
                } else if (response.status === 'Failed') {
                    swal(response.message, '', 'error')
                } else {
                    $('#cart_counter').html(response.cart_counter['cart_count'])
                    $('#qty-' + food_id).html(response.qty)

                    //subtotal, tax and grand total
                    applyCartAmounts(
                        response.cart_amount['subtotal'],
                        response.cart_amount['tax_dict'],
                        response.cart_amount['grand_total'],
                    )
                }
            }
        })
    })

    //place the cart item quantity on load
    $('.item_qty').each(function () {
        var the_id = $(this).attr('id')
        var qty = $(this).attr('data-qty')
        $('#' + the_id).html(qty)
    })

    //decrease cart
    $('.decrease_cart').on('click', function (e) {
        e.preventDefault();

        food_id = $(this).attr('data-id');
        url = $(this).attr('data-url');
        cart_id = $(this).attr('id');


        $.ajax({
            type: 'GET',
            url: url,
            success: function (response) {
                console.log(response)
                if (response.status === 'login_required') {
                    swal(response.message, '', 'info').then(function () {
                        window.location = '/login';
                    })
                } else if (response.status === 'Failed') {
                    swal(response.message, '', 'error')
                } else {
                    $('#cart_counter').html(response.cart_counter['cart_count'])
                    $('#qty-' + food_id).html(response.qty)


                    applyCartAmounts(
                        response.cart_amount['subtotal'],
                        response.cart_amount['tax_dict'],
                        response.cart_amount['grand_total'],
                    )

                    if (window.location.pathname === '/cart/') {
                        removeCartItem(response.qty, cart_id)
                        checkEmptyCart();
                    }
                }
            }
        })
    })

    //delete cart item
    $('.delete_cart').on('click', function (e) {
        e.preventDefault();

        cart_id = $(this).attr('data-id');
        url = $(this).attr('data-url');

        $.ajax({
            type: 'GET',
            url: url,
            success: function (response) {
                console.log(response)
                if (response.status === 'Failed') {
                    swal(response.message, '', 'error');
                } else {
                    $('#cart_counter').html(response.cart_counter['cart_count']);
                    swal(response.status, response.message, 'success');

                    applyCartAmounts(
                        response.cart_amount['subtotal'],
                        response.cart_amount['tax_dict'],
                        response.cart_amount['grand_total'],
                    )

                    removeCartItem(0, cart_id);
                    checkEmptyCart();
                }
            }
        })
    })

    //delete the cart element
    function removeCartItem(cartItemQty, cart_id) {
        if (cartItemQty <= 0) {
            // remove the cart item element
            document.getElementById("cart-item-" + cart_id).remove()
        }
    }

    //check if the cart is empty
    function checkEmptyCart() {
        var cart_counter = document.getElementById("cart_counter").innerHTML
        if (cart_counter == 0) {
            document.getElementById("empty-cart").style.display = "block"
        }
    }

    //apply cart amounts
    function applyCartAmounts(subtotal, tax_dict, grand_total) {
        if (window.location.pathname == "/cart/") {
            $('#subtotal').html(subtotal);
            $('#grand_total').html(grand_total);

            for (key1 in tax_dict) {
                for (key2 in tax_dict[key1]) {
                    $('#tax-' + key1).html(tax_dict[key1][key2])
                }
            }
        }
    }

    // ADD OPENING HOUR
    $('.add_hour').on('click', function (e) {
        let condition;
        e.preventDefault();
        const day = document.getElementById('id_day').value;
        const from_hour = document.getElementById('id_from_hour').value;
        const to_hour = document.getElementById('id_to_hour').value;
        let is_closed = document.getElementById('id_is_closed').checked;
        const csrf_token = $('input[name="csrfmiddlewaretoken"]').val();
        const url = document.getElementById('add_hour_url').value;

        console.log(day, from_hour, to_hour, is_closed, csrf_token, url)

        if (is_closed) {
            is_closed = 'True'
            condition = "day != ''"
        } else {
            is_closed = 'False'
            condition = "day != '' && from_hour != '' && to_hour != ''"
        }

        if (eval(condition)) {
            $.ajax({
                type: "POST",
                url: url,
                data: {
                    'day': day,
                    'from_hour': from_hour,
                    'to_hour': to_hour,
                    'is_closed': is_closed,
                    'csrfmiddlewaretoken': csrf_token
                },
                success: function (response) {
                    if (response.status == 'success') {
                        if (response.is_closed == 'Closed') {
                            html = `<tr id="hour-${response.id}"><td><b>${response.day}</b></td><td><b>Closed</b></td><td><a href="#" class="remove_hour" data-url="/vendor/opening-hours/remove/${response.id}/">Remove</a></td></tr>`
                        } else {
                            html = `<tr id="hour-${response.id}"><td><b>${response.day}</b></td><td><b>${response.from_hour} - ${response.to_hour}</b></td><td><a href="#" class="remove_hour" data-url="/vendor/opening-hours/remove/${response.id}/">Remove</a></td></tr>`
                        }
                        $('.opening_hours').append(html)
                        document.getElementById('opening_hours').reset();
                    } else {
                        swal(response.message, '', "error")
                    }
                }
            });
        } else {
            swal('Please fill all fields', '', 'info');
        }
    })
    // REMOVE OPENING HOUR
    $(document).on('click', '.remove_hour', function (e) {
        e.preventDefault();
        url = $(this).attr('data-url')

        $.ajax({
            type: 'GET',
            url: url,
            success: function (response) {
                if (response.status == 'success') {
                    document.getElementById('hour-' + response.id).remove()
                }
            }
        })
    })

    // document ready close
});