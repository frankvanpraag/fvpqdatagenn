$(document).ready(function () {

    // var ctx = document.getElementById('myChart').getContext('2d');
    // var chart = new Chart(ctx, {
    //     // The type of chart we want to create
    //     type: 'line',

    //     // The data for our dataset
    //     data: {
    //         labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    //         datasets: [{
    //             label: 'My First dataset',
    //             backgroundColor: 'rgb(255, 99, 132)',
    //             borderColor: 'rgb(255, 99, 132)',
    //             data: [0, 10, 5, 2, 20, 30, 45]
    //         }]
    //     },

    //     // Configuration options go here
    //     options: {}
    // });
    getPollResults();
});

function getPollResults() {
    mySurveyID = "SV_6u4ZKzZCU6XPQUJ";
    myStoryStopNumber = "1";

    console.log("mySurveyID = " + mySurveyID);
    console.log("myStoryStopNumber = " + myStoryStopNumber);


    var myOutgoingData = new Object();
    (function poll() {

       
        myOutgoingData['surveyId'] = mySurveyID;
        myOutgoingData['storyStopNumber'] = myStoryStopNumber;
        console.log("JSON.stringify(myOutgoingData) = " + JSON.stringify(myOutgoingData));
        myOutgoingData = JSON.stringify(myOutgoingData);



        setTimeout(function () {
            $.ajax({
                url: "server", success: function (data) {
                    //Update your dashboard gauge
                    salesGauge.setValue(data.value);
                    //Setup the next poll recursively
                    poll();
                }, dataType: "json"
            });
        }, 30000);
    })();



    $.ajax({
        contentType: "application/json; charset=utf-8",
        method: "POST",
        url: "/getPollResults",
        data: myOutgoingData,
        success: function (data) {
            console.log("getPollResults ajax success = " + data);
            doChart(data);
            // console.log("success = " + JSON.stringify(data));
            // parsePostPostResponse(data);
        },
        error: function (jqXHR, exception) {
            console.log("getPollResults jqXHR.responseText = " + jqXHR.responseText);
            // console.log("getPollResults jQuery.parseJSON(jqXHR.responseText) = " + jQuery.parseJSON(jqXHR.responseText));
        },
        dataType: "json"
    });
};

function parsePostPostResponse(obj) {
    var myResponseMessage = JSON.stringify(obj);
    console.log(myResponseMessage);
}

function doChart(data) {
    var myData = data;
    var ctx = document.getElementById('myChart').getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
           
            datasets: [{
                label: '# of Votes',
                data: myData,
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });

};

