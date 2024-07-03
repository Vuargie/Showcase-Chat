"use strict";

var connection = new signalR.HubConnectionBuilder().withUrl("/chatHub").build();

document.getElementById("sendButton").disabled = true;

connection.on("ReceiveMessage", function (messageId, user, message) {
    var li = document.createElement("li");
    li.setAttribute("data-id", messageId);

    var currentUser = document.getElementById("userName").value;

    var deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";

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

connection.on("UserJoined", function (user) {
    // Voeg een vertraging toe voordat de gebruiker aan de lijst wordt toegevoegd
    setTimeout(() => addUserToList(user), 500);  // 500 ms vertraging
});

connection.on("UserLeft", function (user) {
    removeUserFromList(user);
});

connection.on("UpdateUserList", function (users) {
    var usersList = document.getElementById("usersList");
    usersList.innerHTML = "";
    // Voeg een vertraging toe voordat de gebruikerslijst wordt bijgewerkt
    setTimeout(() => {
        users.forEach(function (user) {
            addUserToList(user);
        });
    }, 500);  // 500 ms vertraging
});

connection.on("Kicked", function (message) {
    alert(message);
    window.location.href = "/";
});

connection.start().then(function () {
    document.getElementById("sendButton").disabled = false;
}).catch(function (err) {
    return console.error(err.toString());
});

document.getElementById("sendButton").addEventListener("click", function (event) {
    var message = document.getElementById("messageInput").value.trim();
    if (message !== "") {
        connection.invoke("SendMessage", message).catch(function (err) {
            return console.error(err.toString());
        });
    }
    event.preventDefault();
});

function addUserToList(user) {
    var usersList = document.getElementById("usersList");
    var li = document.createElement("li");
    li.setAttribute("data-user", user);
    li.textContent = user;

    var isAdmin = document.getElementById("isAdmin").value === "True";
    console.log("isAdmin:", isAdmin); // Voeg deze regel toe voor debugging
    console.log("currentUser:", document.getElementById("userName").value); // Voeg deze regel toe voor debugging
    if (isAdmin && user !== document.getElementById("userName").value) {
        var kickButton = document.createElement("button");
        kickButton.textContent = "Kick";
        kickButton.onclick = function () {
            connection.invoke("KickUser", user).catch(function (err) {
                return console.error(err.toString());
            });
        };
        li.appendChild(kickButton);
    }

    usersList.appendChild(li);
}

function removeUserFromList(user) {
    var usersList = document.getElementById("usersList");
    var li = usersList.querySelector(`li[data-user='${user}']`);
    if (li) {
        li.remove();
    }
}

