$(document).ready(() => {
    const display = $("#display");
    const form = $("#form");
    const imgForm = $('#imgForm');

    const userInputType = $("#type");
    const userInputTime = $("#time");
    const userInputDate = $("#date");

    const userInput = $("#userInput");
    const logOutBtn = $("#logout");
    const getOrdersBtn = $("#getOrders");

    imgForm.submit(() => {
        setTimeout(() => {
            let fileName = document.getElementById('imgFrame').contentDocument.getElementById('fileName');
            console.log(fileName);
    }, 100);
    }); 

    function getCookie(cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for(var i = 0; i <ca.length; i++) {
          var c = ca[i];
          while (c.charAt(0) == ' ') {
            c = c.substring(1);
          }
          if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
          }
        }
        return "";
      }

      const token = getCookie('token');

    const resetUsersInput = () => {
        userInput.val('');
        userInputDate.val('');
        userInputTime.val('');
    }

    const buildIds = (user) => {
        return {
            editID : "edit_" + user._id,
            deleteID : "delete_" + user._id,
            listItemID : "listItem_" + user._id,
            userID : "user_" + user._id
        }
    }

    const logOut = () => {
        logOutBtn.click(() => {
            fetch(`/users/logout`, {
                method: 'post',
                headers: {
                    'Authorization': 'Bearer '+ token, 
                    'Content-Type': 'application/x-www-form-urlencoded'
                  }
            }).then(responce => { console.log(responce.status); window.location.replace("/"); })
            //
        })
    }

    getOrdersBtn.click(() => 
        getOrders()
    );

    const buildTemplate = (order, ids) => {
        let imgPath = '/images/noImg.jpg';
        if (order.img) {
            imgPath = `/images/${order.img}`
        }

        return `<li class="list-group-item" id = "${ids.listItemID}">
            <div class = "row">
                <div id = "${ids.orderID}">${order.dateTime} ${order.serviceType}

                <img src = "${imgPath}" width = "100" height = "100"></div>
                <div style = "position: absolute; left: 80%;">
                    <button type = "button" class = "btn btn-secondary" id = "${ids.editID}">Edit</button>
                    <button type = "button" class = "btn btn-danger" id = "${ids.deleteID}">Delete</button>
                </div>
            </div>
            </li>`
    }

    const editOrder = (order, orderID, editID) => {
        
        let editBtn = $(`#${editID}`);

        editBtn.click(() => {
            fetch(`/orders/${order._id}`, {
                method: 'put',
                body: JSON.stringify({
                    a: orderInput.val(),
                    date_time: orderInputTime.val() + " " + orderInputDate.val(),
                    type: orderInputType.val()
                }),
                headers: {
                        'Authorization': 'Bearer '+ token, 
                        'Content-Type': 'application/x-www-form-urlencoded',
            }
            }).then((responce) => {
                console.log(responce);
                return responce.json();
            }).then((data) => {
                if (data.ok == 1) {
                    console.log(data);
                    let orderIndex = $(`#${orderID}`);
                    orderIndex.html(data.value.a);
                    resetOrdersInput();
                }
            });
        });
    }

    const deleteOrder = (order, listItemID, deleteID) => {
        let deleteBtn = $(`#${deleteID}`);
        deleteBtn.click(() => {
            fetch(`/orders/${order._id}`, {
                method: 'delete',
                headers: {
                        'Authorization': 'Bearer '+ token, 
                        'Content-Type': 'application/x-www-form-urlencoded',
            }
            }). then (response => {
                return response.json();
            }).then(data => {
                if (data.ok == 1) {
                    $(`#${listItemID}`).remove();
                    getOrders();
                }
            });
        });
    }

    const displayOrders = data => {
        display.append(showTemplate());
        data.forEach((order) => {
            let ids = buildIds(order);
            display.append(buildTemplate(order, ids));
            editOrder(order, ids.orderID, ids.editID);
            deleteOrder(order, ids.listItemID, ids.deleteID);
        });
    }

    form.submit(e => {
        e.preventDefault();

        let iframe = document.getElementById('imgFrame');
        let fileName = null;
        

        let body = {
            dateTime: userInputTime.val() + " " + userInputDate.val(),
            serviceType: userInputType.val()
        }

        console.log(iframe);

        if (iframe) {
            let innerDoc = iframe.contentDocument || iframe.contentWindow.document;

            fileName = innerDoc.getElementById("fileName");
            body.img = fileName.textContent;
        }

        console.log(body);

        fetch('/orders', {
            method: 'post',
            body: JSON.stringify(body),
            headers: {
                'Authorization': 'Bearer '+ token, 
                        'Content-Type': 'application/json; charset=utf-8',
            }
        }).then(responce => {
            if (responce.status === 201) {
                return responce.json();
            }
        }).then(data => {
            console.log(data);
        });
    });

    const getOrders = () => {
        fetch(`/orders`, {
            method: 'get',
            headers: {
                'Authorization': 'Bearer '+ token, 
                'Content-Type': 'application/json; charset=utf-8'
              }
        })
            .then(responce => responce.json())
            .then(data => {
                displayOrders(data);
            });
    }

    const showTemplate = () => {
        return `<li class="list-group-item" id = "tableContent">
            <div class = "row">
            <p>Price | Area | The nubmer of Rooms | Image</p>
            </div>
            </li>`
    }

    logOut();

});
