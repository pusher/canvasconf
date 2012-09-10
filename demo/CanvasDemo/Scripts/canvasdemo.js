var squareCount = 0;
var username;
var squaresChannel;
var socketId;
var presenceChannel;


// On document ready, init UI
$(function () {
    initializeUI();
});


// Sets up UI controls
function initializeUI() {

    // Setup add square button
    $("#addshape").button().click(function () {
        
        var squareId = username + "_" + squareCount++;

        console.log("Adding new square, ID = " + squareId);

        addSquare(squareId, true);

    });

    // Set up 'enter name' dialog and open it
    $('#nameDialog').dialog({
        autoOpen: true,
        width: 400,
        modal: true,
        buttons: {
            "Ok": function () {

                var tempUsername = $('#username').val();

                // Check username is not blank
                if (tempUsername.trim() != '') {
                    username = tempUsername;
                    $('#title').empty().append('Welcome ' + username);
                    $(this).dialog("close");

                    initializePusher();
                }
                else
                    return false;
            }
        }
    });

}


// Initialise Pusher setup
function initializePusher() {

    // TODO: Complete this line with your app key
    var pusher = new Pusher('');

    // Set callback for authentication
    Pusher.channel_auth_endpoint = "/Pusher/Auth?username=" + username;

    // Set up Pusher logging to console
    Pusher.log = function (message) {
        if (window.console && window.console.log) {
            window.console.log(message);
        }
    };

    // Get socket ID on connection success
    pusher.connection.bind('connected', function () {
        console.log("Connected to Pusher!");
        socketId = pusher.connection.socket_id;
    });


    // Square updates channel
    squaresChannel = pusher.subscribe('private-squares');

    squaresChannel.bind('client-add-square', function (data) {
        if (data.originatingSocketId != socketId) {
            console.log("New square added, ID = " + data.squareId);
            addSquare(data.squareId, false);
        }
    });

    // TEST, add square		{"squareId": "Rich_0"}

    squaresChannel.bind('client-update-square', function (data) {
        if (data.originatingSocketId != socketId) {
            console.log("Square moved, ID = " + data.squareId + ", top = " + data.top + ", left = " + data.left);
            moveSquare(data.squareId, data.top, data.left);
        }
    });

    // TEST, move square	{"squareId": "Rich_0","top": 248,"left": 365}

    // Presence channel
    presenceChannel = pusher.subscribe('presence-squares');

    presenceChannel.bind('pusher:subscription_succeeded', function () {
        console.log("Subscribed to presence channel updates");
        listMembers();
    });

    presenceChannel.bind('pusher:member_added', function (member) {
        console.log("Member added to presence channel");
        listMembers();
    });

    presenceChannel.bind('pusher:member_removed', function (member) {
        console.log("Member removed from presence channel");
        listMembers();
    });


}

// Adds a square to the screen
function addSquare(squareId, isMySquare) {

    var classes = 'draggable ui-widget-content';
    if (isMySquare) classes += ' ui-state-highlight';

    // Add square, make it draggable and attach events
    $('#canvas').append('<div id="' + squareId + '" class="' + classes + '"></div>');

    $('#' + squareId).draggable({

        // On end of drag
        stop: function (event, ui) {

            var squareId = ui.helper.context.id;

            window.console.log("Square " + squareId + " moved to new position: " + ui.position.top + "," + ui.position.left);

            // Inform other clients of moved square
            triggerSquareMovedEvent(squareId, ui.position.top, ui.position.left);

        }
    });

    if (isMySquare) {

        // Inform other clients of new square
        triggerAddSquareEvent(squareId);        

    }
}

// Triggers an add square event
function triggerAddSquareEvent(squareId) {

    // Client triggered
    squaresChannel.trigger('client-add-square', { squareId: squareId });

}

// Triggers a move square event
function triggerSquareMovedEvent(squareId, top, left) {

    // Client triggered
    squaresChannel.trigger('client-update-square', { squareId: squareId, top: top, left: left });
	
}


// Moves a square to given location
function moveSquare(squareId, top, left) {
    $('#' + squareId).offset({left:left,top:top});
}

// Displays a list of members in the presence list
function listMembers() {

    $('#presenceList').empty();

    presenceChannel.members.each(function (member) {

        console.log("Listing member: " + member.info.name);
        $('#presenceList').append('<li>' + member.info.name + '</li>');

    });

}