"use strict";

var connection = new signalR.HubConnectionBuilder().withUrl("/chatHub").build();

//Disable the send button until connection is established.
document.getElementById("sendButton").disabled = true;

connection.on("ReceiveMessage", function (messageId, user, message) {
    var li = document.createElement("li");
    li.setAttribute("data-id", messageId);

    var currentUser = document.getElementById("userName").value;
    console.log(`Current User: ${currentUser}, Message User: ${user}`); // Log om te debuggen

    var deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";

    // Controleer of de huidige gebruiker de eigenaar is van het bericht
    if (user === currentUser) {
        deleteButton.onclick = function () {
            connection.invoke("DeleteMessage", messageId).catch(function (err) {
                return console.error(err.toString());
            });
        };
        li.appendChild(deleteButton);
    }

    li.appendChild(document.createTextNode(`${user} says ${message}`));
    document.getElementById("messagesList").appendChild(li);
});

connection.on("MessageDeleted", function (messageId) {
    var messageElement = document.querySelector(`li[data-id='${messageId}']`);
    if (messageElement) {
        messageElement.remove();
    }
});

connection.start().then(function () {
    document.getElementById("sendButton").disabled = false;
}).catch(function (err) {
    return console.error(err.toString());
});

document.getElementById("sendButton").addEventListener("click", function (event) {
    var message = document.getElementById("messageInput").value.trim(); // Trim om lege ruimtes te verwijderen
    if (message !== "") { // Controleer op leeg bericht
        connection.invoke("SendMessage", message).catch(function (err) {
            return console.error(err.toString());
        });
    }
    event.preventDefault();
});
