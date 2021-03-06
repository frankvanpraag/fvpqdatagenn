/////////// version 1.011
/////////// welcome to the qualtrics survey response generation tool
/////////// for questions reach out to Joe Bernisky jbernisky at qualtrics dot com
var myDatacenter = new Object();
var myAPIToken = new Object();
var mySelectedSurveyID;
var mySurveyList = [];
var myPostResponseAnswersToSubSubmitObjectPRE = new Object();
var myPostResponseAnswersToSubSubmitObjectPOST = new Object();
var myNumberOfResponsesToGenerate;
var mySurveyQuestionsList = [];
var myAllAnswerChoices = new Object();
var myAllSurveyData = new Object();
var mySurveyDetails;
var myMCQuestionIndex = new Object();
var myNPSQID;
var myListofTextQuestions = [];
var mySurveyQuestions;
var myAnswerChoicesCandidatesObject = new Object();
var myAnswerChoicesCandidatesArray = [];
var myCommentPartsLibrary = [];
var surveyCurrentlyLoaded = false;
var myQuestionIDSAndText = new Object();
var myDataPayload = new Object();
var devModeOn = false;
var myAnswerChoicesDisplayTextForTickets = new Object();
var myTurboState = "off";
var myTurboCounter = 1;
var timer;
var commentTimer;
var t0, t1;
var myTextCommentLibraryFlattened = [];
var myObjectForTicketPayload = new Object();
var myPositiveThreshold;
var myNegativeThreshold;
var myOriginalIntro_onclick;


$(document).ready(function () {
    // try {
    // recordSignal("pageLoad", "data generator home");
    loadMyGlobalEventHandlers();
    loadStringReplacementFunction();
    loadDatePickers();
    getUserInfoFromLocalStorage();
    toggleDevMode();
    checkAPITokenVisibility();
   
    $('.slimmenu').slimmenu();
    $(".menuContainer").width($(window).width());
    

    var myAPIToken = JSON.parse(localStorage.getItem('APIToken'));
    var myDatacenter = JSON.parse(localStorage.getItem('Datacenter'));
    var myAPIKeyData = { 'apiToken': myAPIToken, 'datacenter': myDatacenter };
    $.ajax({
        type: 'GET',
        data: myAPIKeyData,
        url: 'https://joeberni.pythonanywhere.com/surveys',
        success: function (data) {
            parseSurveyListJSON(data);
        }, error: function (jqXHR, exception) {
            console.log("jqXHR AJAX onError");
            console.log(jqXHR.responseText)
            $("#gridSurveyList").html("please enter your api token and datacenter above <br/> and then click the checkmark button to get started.");
        }
    })
    $(".divUserControlPanel").hide();
    $("#trimButtons").hide();
    $("#introMessagePanel").prepend(myIntroMessage);
    
})

function checkAPITokenVisibility() {
    if (($("#txtAPIToken").val().length) > 0) {
        // $("#txtAPIToken").hide();
        // $('#btnToggleAPITokenVisibility').html('show');
    } else {
        // $("#txtAPIToken").show();
        // $('#btnToggleAPITokenVisibility').html('hide');
    }
}

function toggleAPIVisibility() {
    if ($("#txtAPIToken").length > 0) {
        console.log("toggleAPIVisibility");
        console.log("$('#btnToggleAPITokenVisibility').html() = " + $('#btnToggleAPITokenVisibility').html());

        if ($('#btnToggleAPITokenVisibility').html() == "show") {
            $('#btnToggleAPITokenVisibility').html('hide');
            console.log("change to hide")
            $("#txtAPIToken").show();
        } else {
            $('#btnToggleAPITokenVisibility').html('show');
            console.log("change to show")
            $("#txtAPIToken").hide();
        }
    } else {
        $("#txtAPIToken").show();
        $('#btnToggleAPITokenVisibility').html('hide');
    }
}

function getCommentLibraryListFromGoogleSheets() {
    var myGSheetID = JSON.parse(localStorage.getItem('gSheetID'));
    var surveyIDData = { 'GSheetID': myGSheetID };
    // console.log("myGSheetID = " + myGSheetID);
    // console.log("surveyIDData = " + JSON.stringify(surveyIDData));
    $.ajax({
        contentType: "application/json; charset=utf-8",
        method: "GET",
        data: surveyIDData,
        url: "/getListOfTextCommentLibraries",
        success: function (data) {
            loadTextCommentLibrariesDropdown(data);
        },
        error: function (jqXHR, exception) {
            console.log("Post response via API failed");
            console.log("jqXHR.responseText = " + jqXHR.responseText);
        },
        dataType: "json"
    })
}

function startTutorial() {
    var intro = introJs();

    intro.setOptions({
        /* Next button label in tooltip box */
        nextLabel: 'Next &rarr;',
        /* Previous button label in tooltip box */
        prevLabel: '&larr; Back',
        /* Skip button label in tooltip box */
        skipLabel: 'Exit',
        /* Done button label in tooltip box */
        doneLabel: 'Exit',
        /* Default tooltip box position */
        tooltipPosition: '',
        /* Next CSS class for tooltip boxes */
        tooltipClass: '',
        /* CSS class that is added to the helperLayer */
        highlightClass: '',
        /* Close introduction when pressing Escape button? */
        exitOnEsc: true,
        /* Close introduction when clicking on overlay layer? */
        exitOnOverlayClick: false,
        /* Show step numbers in introduction? */
        showStepNumbers: true,
        /* Let user use keyboard to navigate the tour? */
        keyboardNavigation: true,
        /* Show tour control buttons? */
        showButtons: true,
        /* Show tour bullets? */
        showBullets: true,
        /* Show tour progress? */
        showProgress: false,
        /* Scroll to highlighted element? */
        scrollToElement: false,
        /* Set the overlay opacity */
        overlayOpacity: 0.8,
        /* Precedence of positions, when auto is enabled */
        positionPrecedence: ["bottom", "top", "right", "left"],
        /* Disable an interaction with element? */
        disableInteraction: false,
        steps: [
            {
                element: document.querySelector('#tourStop001'),
                intro: 'Enter your API token and datacenter, <br/> then click the checkmark before clicking <strong>Next</strong>'
            }, {
                element: document.querySelector('#tourStop002'),
                intro: 'These are the surveys in your Qualtrics account. All surveys will be displayed here, but please note that this tool works best with surveys containing multiple choice and text questions.  Other question types, such as matrix questions, will be ignored. <br/><br/> Select a survey before clicking <strong>Next</strong>'
            }, {
                element: document.querySelector('#tourStop003'),
                intro: 'This is the survey that random responses will be generated for'
            }, {
                element: document.querySelector('#tourStop004'),
                intro: 'Select the date range from which the <strong>start_date</strong> and <strong>end_date</strong> fields (they will equal each other)  can be randomly selected from',
                position: 'top'
            }, {
                element: document.querySelector('#tourStop005'),
                intro: 'Enter the number of random responses you would like to generate.<br/><br/> The qAPI limit is 50 responses at a time. If you need to generate a large number of responses, seek out turbo mode...'
            }, {
                element: document.querySelector('#tourStop006'),
                intro: 'OPTIONAL: Selecting this checkbox will cause this tool to create random comments for the text questions in your selected survey. If this is not selected, random answers will still be created - text questions will just be ignored. If a survey contains more than one text question, a unique response will be generated for each.<br/></br> Text comments are generated from a library of sentence fragments supplied via a Google sheet. A default library has been provided and you are encouraged to use your own by making a copy and ensuring the following rules are met:<br/><ul><li>The new sheet must be shared with <strong>dgserviceaccount@data-generator-project.iam.gserviceaccount.com</strong><br/><br/><li/>Get the sheet ID from the URL bar and paste it below<br/><br/><li>The new file must contain a tab named <strong>Comment Structure</strong> that looks similar to the one in the default file <a target="new" href="https://docs.google.com/spreadsheets/d/1gXvHT5qSdyxl_Pf0bVU2TkxZQL32TizQz_Ws2plASWM/edit?usp=sharing">here</a></ul>Each tab in the spreadsheet will be available in the <strong>Select a Text Library</strong> dropdown. <br/><br/>The general sentiment of the randomly generated comment will correspond to the random answer choice created for the question you indicate in the <strong>Select a Question to Base Sentiment On</strong> dropdown. Only positive and negative comments will be created (i.e. neutral scores do not result in comment creation). The thresholds in the spreadsheet tab named Comment Structure | fields D1:D2 determine which scores result in which sentiment categories (all scores are normalized to a 1-10 scale)<br/><br/>The sentence parts for these text comments are based on the values in Comment Structure | Column A. By default there are four sentence parts: Intro, Segment 1, Segment 2, and Closing. For example, if the sentiment category is positive, the random comment will be made up of randomly selected sentence parts labled as positiveIntro + positiveSegment1 + positiveSegment2 + positiveClosing',
                position: 'top'
            }, {
                element: document.querySelector('#tourStop007'),
                intro: 'OPTIONAL: Selecting this checkbox will cause this tool tool to call a JSON endpoint of your choosing.  <br/> <br/>An option to only create tickets for a specified percentage of responses is provided as a way to throttle the number of tickets being created. FYI - this endpoint does not necessarily have to result in tickets being created.<br/> <br/> ',
                position: 'top'
            }, {
                element: document.querySelector('#tourStop008'),
                intro: 'Every multiple choice question in your survey will be shown below. If an answer choice is checked, the random response engine will incluce that answer choice in its pool of answer choices to pick from. <br/> <br/>',
                position: 'bottom',
                'data-scrollTo': document.querySelector('.tourStop007')
            }, {
                element: document.querySelector('.tourStop009'),
                intro: 'When you are ready to start the data magic, press this button<br/> <br/> '
            }, {
                element: document.querySelector('.tourStop010'),
                intro: 'Results from the API calls being made will be shown here, along with other random info. <br/> <br/> That is the end of our tour. Have fun creating data! <br/><br/>',
                position: 'left'
            }
        ]
    });
    intro.onafterchange(function (targetElement) {
        if (intro._currentStep == 1) {
            myOriginalIntro_onclick = $('.introjs-nextbutton').get(0).onclick;
            if (typeof mySelectedSurveyID == 'undefined') {
                $('.introjs-nextbutton').addClass('introjs-disabled');
                $('.introjs-nextbutton').get(0).onclick = null;
            };
        }
    });

    intro.onbeforechange(function (targetElement) {
        console.log("intro._currentStep  = " + intro._currentStep);
        if (intro._currentStep == 5) {
            console.log("This should be it");
            $(".introjs-tooltip").css("max-width", "800px").css("min-width", "800px");
        } else {
            $(".introjs-tooltip").css("max-width", "300px").css("min-width", "300px");
        };
    });

    intro.start();
}

function loadTextCommentLibrariesDropdown(data) {
    var myResult = data;
    var myTextLibraryIndustriesDropdown = $("#selectTextCommentLibraryList");
    // myTextLibraryIndustriesDropdown.empty();
    myTextLibraryIndustriesDropdown.append($("<option disabled selected />").val("999").text("Select a Text Library"));
    // <option disabled selected>Select a text library</option>
    // console.log("myResult = " + JSON.stringify(myResult));
    $.each(myResult, function (i, j) {
        var mySheetID = j.properties.sheetId;
        var mySheetTitle = j.properties.title;
        // console.log("mySheetTitle = " + JSON.stringify(mySheetTitle));
        if (mySheetTitle !== "Comment Structure") {
            myTextLibraryIndustriesDropdown.append($("<option />").val(mySheetID).text(mySheetTitle.replace("&nbsp;", " ")));
        }
    });
}

function getSelectedCommentLibraryFromGoogleSheets(sheetID) {
    var myGSheetID = JSON.parse(localStorage.getItem('gSheetID'));
    var surveyIDData = { 'GSheetID': myGSheetID };
    var mySelectedTextLibrarySheetName = $('#selectTextCommentLibraryList option:selected').text();
    var surveyIDData = { 'GSheetID': myGSheetID, 'sheetID': sheetID, 'sheetName': mySelectedTextLibrarySheetName };
    $.ajax({
        contentType: "application/json; charset=utf-8",
        method: "GET",
        data: surveyIDData,
        url: "/getTextCommentLibrary",
        success: function (data) {
            loadCommentLibrary(data);
        },
        error: function (jqXHR, exception) {
            console.log("getSelectedCommentLibraryFromGoogleSheets failed");
            console.log("responseText = " + jqXHR.responseText);
        },
        dataType: "json"
    })
}

function getTextCommentStructureFromGoogleSheets() {
    var myGSheetID = JSON.parse(localStorage.getItem('gSheetID'));
    var surveyIDData = { 'GSheetID': myGSheetID };
    $.ajax({
        contentType: "application/json; charset=utf-8",
        method: "GET",
        data: surveyIDData,
        url: "/getTextCommentStructure",
        success: function (data) {
            myCommentParts = data;
            return data;
        },
        error: function (jqXHR, exception) {
            console.log("Post response via API failed");
            console.log("jqXHR.responseText = " + jqXHR.responseText);
        },
        dataType: "json"
    })
}

function getSelectedTextLibrary() {
    var mySelectedTextLibrarySheetID = $('#selectTextCommentLibraryList').val();
    getSelectedCommentLibraryFromGoogleSheets(mySelectedTextLibrarySheetID);
}

function loadCommentLibrary(data) {
    $.each(data, function (k, v) {
        var myCommentPart = v[0];
        var myCommentPartContent = v[1];
        // var myNewCommentListItem = ["myCommentPart": myCommentPart, myCommentPartContent];
        var myNewCommentListItem = {};
        myNewCommentListItem["contentPart"] = myCommentPart;
        myNewCommentListItem["myCommentPartContent"] = myCommentPartContent;
        myCommentPartsLibrary[myCommentPart] = myCommentPartContent;
        // console.log("myNewCommentListItem = " + JSON.stringify(myNewCommentListItem));
        myCommentPartsLibrary.push(myNewCommentListItem);
    })
}

function theTextMachine(sentiment) {
    var myRandomComment = "";
    mySentiment = sentiment;
    let myListLength = myCommentPartsLibrary.length;
    var myListOfAvailableCommentParts = [];
    var myListOfAvailableSubCommentParts = [];
    $.each(myCommentParts, function (key, data) {
        var mySentimentGroupLabel = mySentiment + data; // positive or negative + Intro or Segment 1 or....etc
        var myListOfAvailableSubCommentParts = [];
        // get comment parts for the generated sentiment (positive, neutral or negative) 
        for (i = 0; i < myListLength; i++) {
            var myContentPart = myCommentPartsLibrary[i].contentPart;
            if (myContentPart.indexOf(mySentimentGroupLabel) > -1) {
                myListOfAvailableSubCommentParts.push(myCommentPartsLibrary[i]);
            };
        }
        var myRandomIndex = Math.floor(Math.random() * myListOfAvailableSubCommentParts.length);
        if (myListOfAvailableSubCommentParts[myRandomIndex].myCommentPartContent != "Undefined") {
            myRandomComment += myListOfAvailableSubCommentParts[myRandomIndex].myCommentPartContent;
            myRandomComment += " "; //adds a space between segments
        };
    });
    // recordSignal("randomCommentGenerated");
    return myRandomComment;
};

function toggleDevMode() {
    if (devModeOn === true) {
        $("#secretDevStuff").show();
        devModeOn = false;
    } else {
        $("#secretDevStuff").hide();
        devModeOn = true;
    }
}

//////// gets values from local storage and populates controls
function getUserInfoFromLocalStorage() {
    try {
        var myAPIToken = JSON.parse(localStorage.getItem('APIToken'));
        var myDatacenter = JSON.parse(localStorage.getItem('Datacenter'));
        var myStartDate = JSON.parse(localStorage.getItem('StartDate'));
        var myEndDate = JSON.parse(localStorage.getItem('EndDate'));
        var myNumberOfResponses = JSON.parse(localStorage.getItem('NumberOfResponses'));
        var myTicketPercentage1 = JSON.parse(localStorage.getItem('TicketPercentage1'));
        // var myTicketPercentage2 = JSON.parse(localStorage.getItem('TicketPercentage2'));
        var myJSONEndpointURL1 = JSON.parse(localStorage.getItem('JSONEndpointURL1'));
        // var myJSONEndpointURL2 = JSON.parse(localStorage.getItem('JSONEndpointURL2'));
        var myNumberOfTurboCycles = JSON.parse(localStorage.getItem('numberOfTurboCycles'));
        var myIntervalForTurboCycles = JSON.parse(localStorage.getItem('intervalForTurboCycles'));
        var myGSheetID = JSON.parse(localStorage.getItem('gSheetID'));

        if (myGSheetID.length > 10) {
            mySpreadsheetURL = "https://docs.google.com/spreadsheets/d/{}/".format(myGSheetID);
            $("#linkToSpreadsheet").attr("href", mySpreadsheetURL);
        }

        if (myAPIToken.length > 10) {
            toggleAPIVisibility();
        }

        $("#txtAPIToken").val(myAPIToken);
        $("#txtDatacenter").val(myDatacenter);
        $("#txtStartDate").val(myStartDate);
        $("#txtEndDate").val(myEndDate);
        $("#txtNumberOfResponses").val(myNumberOfResponses);
        $("#txtTicketPercentage1").val(myTicketPercentage1);
        // $("#txtTicketPercentage2").val(myTicketPercentage2);
        $("#txtJSONURL1").val(myJSONEndpointURL1);
        // $("#txtJSONURL2").val(myJSONEndpointURL2);
        $("#txtNumberOfTurboCycles").val(myNumberOfTurboCycles);
        $("#txtSecondsBetweenTurboCycles").val(myIntervalForTurboCycles);
        var myNumberOfTurboResponses = myNumberOfTurboCycles * myNumberOfResponses;
        $("#lblTurboModeResponseCount").html(myNumberOfTurboResponses);
        $("#txtGSheetID").val(myGSheetID);
    }
    catch (err) {
        console.log(err);
    };
}

//////// when a change is made to an editable value, save it to local storage
function saveUserInfoToLocalStorage() {
    var myAPIToken = $("#txtAPIToken").val();
    var myDatacenter = $("#txtDatacenter").val();
    var myStartDate = $("#txtStartDate").val();
    var myEndDate = $("#txtEndDate").val();
    var myNumberOfResponses = $("#txtNumberOfResponses").val();
    var myTicketPercentage1 = $("#txtTicketPercentage1").val();
    var myTicketPercentage2 = $("#txtTicketPercentage2").val();
    var myJSONEndpointURL1 = $("#txtJSONURL1").val();
    var myJSONEndpointURL2 = $("#txtJSONURL2").val();
    var myNumberOfTurboCycles = $("#txtNumberOfTurboCycles").val();
    var myIntervalForTurboCycles = $("#txtSecondsBetweenTurboCycles").val();
    var myGSheetID = $("#txtGSheetID").val();


    localStorage.setItem('APIToken', JSON.stringify(myAPIToken));
    localStorage.setItem('Datacenter', JSON.stringify(myDatacenter));
    localStorage.setItem('StartDate', JSON.stringify(myStartDate));
    localStorage.setItem('EndDate', JSON.stringify(myEndDate));
    localStorage.setItem('NumberOfResponses', JSON.stringify(myNumberOfResponses));
    localStorage.setItem('TicketPercentage1', JSON.stringify(myTicketPercentage1));
    localStorage.setItem('TicketPercentage2', JSON.stringify(myTicketPercentage2));
    localStorage.setItem('JSONEndpointURL1', JSON.stringify(myJSONEndpointURL1));
    localStorage.setItem('JSONEndpointURL2', JSON.stringify(myJSONEndpointURL2));
    localStorage.setItem('numberOfTurboCycles', JSON.stringify(myNumberOfTurboCycles));
    localStorage.setItem('intervalForTurboCycles', JSON.stringify(myIntervalForTurboCycles));
    localStorage.setItem('gSheetID', JSON.stringify(myGSheetID));
    getUserInfoFromLocalStorage();
    checkAPITokenVisibility();
}

//////// parses raw data from API and places in survey list grid object
function loadSurveysList(surveyList) {
    $("#gridSurveyList").jsGrid({
        width: 600,
        height: 330,
        sorting: true,
        paging: true,
        filtering: true,
        autoload: true,
        pageSize: 10,
        pageButtonCount: 10,
        sorting: true,
        sorter: "string",
        data: surveyList,
        fields: [
            { name: "surveyName", filtering: false, type: "text", width: 250, title: "Name" },
            { name: "surveyID", filtering: false, type: "text", width: 150, title: "ID", css: "hide", width: 0 },
            { name: "SurveylastModified", filtering: false, type: "text", width: 150, title: "Modified" },
            { name: "SurveycreationDate", filtering: false, type: "text", width: 150, title: "Created" }
        ],
        rowClick: function (selectedSurveyArgs) {
            var getData = selectedSurveyArgs.item;
            var keys = Object.keys(getData);
            var text = [];

            $.each(keys, function (idx, value) {
                text.push(value + " : " + getData[value])
            });
            mySelectedSurveyID = text[0].substr(text[0].indexOf(":") + 1).trim();
            mySelectedSurveyName = text[1].substr(text[1].indexOf(":") + 1).trim();

            if (surveyCurrentlyLoaded === false) {

                getSurveyDetails(mySelectedSurveyID);
                surveyCurrentlyLoaded = true;
                $("#lblCurrentSurveyName").html(mySelectedSurveyName);
            } else {
                $("#selectedItemsPanel").prepend("<br/><br/>********************** ALERT : please refresh the page to work on a different survey **********************<br/><br/>");
            }
        }
    });
    //Sort survey list by last modified date
    $("#gridSurveyList").jsGrid("sort", { field: "SurveylastModified", order: "desc" });
    // console.log("loadSurveysList Complete");
}

//////// process list of surveys returned by qAPI
function parseSurveyListJSON(obj) {
    try {

        var mySurveys = obj.result;
        var mySurveyListLength = mySurveys.elements.length;
        for (let i = 0; i < mySurveyListLength; i++) {
            var mySurveyID = mySurveys.elements[i].id;
            var mySurveyName = mySurveys.elements[i].name;
            var mySurveycreationDate = mySurveys.elements[i].creationDate;
            var mySurveylastModified = mySurveys.elements[i].lastModified;
            mySurveyList.push({
                'surveyID': mySurveyID,
                'surveyName': mySurveyName,
                'SurveycreationDate': mySurveycreationDate,
                'SurveylastModified': mySurveylastModified,
            });
        }
        var mySurveysListNextPageURL = mySurveys.nextPage;
        if (mySurveysListNextPageURL !== null) {
            getNextPageOfSurveyList(mySurveysListNextPageURL)
        } else {
            // console.log("parseSurveyListJSON Complete");
            loadSurveysList(mySurveyList);
        }
    } catch (err) {
        $("#gridSurveyList").html("error parsing survey list, likely due toan innaccurate <br/>API token or datacenter entered at top of screen").css("vertical-align:top;");
        console.log("Error parsing survey list - likely due to innaccurate API token or datacenter entered at top of screen")
    };
}

//////// a second call is required if you have more than 100 surveys in your account
function getNextPageOfSurveyList(nextPageURL) {
    var myNextPageURL = nextPageURL;
    var myAPIToken = JSON.parse(localStorage.getItem('APIToken'));
    var myDatacenter = JSON.parse(localStorage.getItem('Datacenter'));
    var surveyListNextPageURLData = { 'surveyListNextPageURL': myNextPageURL, 'apiToken': myAPIToken, 'datacenter': myDatacenter }
    $.ajax({
        contentType: "application/json; charset=utf-8",
        url: 'https://joeberni.pythonanywhere.com/surveysNextPage',
        data: surveyListNextPageURLData,
        success: function (nextPageOfData) {
            parseSurveyListJSON(nextPageOfData);
        },
        error: function (jqXHR, exception) {
            console.log("jqXHR AJAX onError");
            console.log(jqXHR.responseText);
        },
        dataType: "json"
    });
}

//////// makes a call to get details about selected survey from qAPI
function getSurveyDetails(surveyID) {
    getCommentLibraryListFromGoogleSheets();
    getTextCommentStructureFromGoogleSheets();
    getSentimentThresholds();

    var myNumberOfEnjoyHintObjects = $('[class^="introjs"]').length;
    if (myNumberOfEnjoyHintObjects > 0) {
        $('.introjs-nextbutton').removeClass('introjs-disabled');
        $('.introjs-nextbutton').get(0).onclick = myOriginalIntro_onclick;
    }
    var myAPIToken = JSON.parse(localStorage.getItem('APIToken'));
    var myDatacenter = JSON.parse(localStorage.getItem('Datacenter'));
    var surveyIDData = { 'surveyID': surveyID, 'apiToken': myAPIToken, 'datacenter': myDatacenter };
    $.ajax({
        contentType: "application/json; charset=utf-8",
        // url: "https://joeberni.pythonanywhere.com/surveyquestions",
        url: "/surveyquestions",
        data: surveyIDData,
        success: function (data) {
            parseSurveyDetailsJSON(data);
        },
        error: function (jqXHR, exception) {
            console.log("jqXHR AJAX onError");
            console.log(jqXHR.responseText);
        },
        dataType: "json"
    });
}
//////// parses raw survey data from API and calls another function to render the data on page
function parseSurveyDetailsJSON(obj) {
    mySurveyDetails = obj.result;
    mySurveyQuestions = mySurveyDetails.elements;
    $.each(mySurveyQuestions, function (key, data) {
        var myQuestionID = data.QuestionID;
        var myQuestionType = data.QuestionType;
        var myQuestionText = data.QuestionText;
        var myQuestionDescription = data.QuestionDescription;
        var myQuestionTypeSelector = data.Selector;
        var myMiscHTML = '';
        myQuestionIDSAndText[myQuestionID] = myQuestionText;
        switch (myQuestionType) {
            case "Matrix":  //Matrix Choice question type (NOT IN USE)
                var myQuestionAnswerChoicesList = createQuestionAnswerChoicesForGrid(myQuestionID, myQuestionType, myQuestionTypeSelector, data.Choices);
                myMCQuestionIndex[myQuestionID] = key;
                myAllAnswerChoices[myQuestionID] = data.Choices;
                var myQuestionAnswerChoicerOrderList = [];
                mySurveyQuestionsList.push({
                    'questionID': myQuestionID,
                    'questionType': myQuestionType,
                    'questionText': myQuestionText,
                    'questionDescription': myQuestionDescription,
                    'questionTypeSelector': myQuestionTypeSelector,
                    'questionAnswerChoices': myQuestionAnswerChoicesList,
                    'questionAnswerChoiceValues': myQuestionAnswerChoicesList,
                    'QuestionAnswerOrderList': myQuestionAnswerChoicerOrderList,
                    'misc': myMiscHTML
                });
                break;

            case "MC":  //Multiple Choice question type
                var myQuestionAnswerChoicesList = createQuestionAnswerChoicesForGrid(myQuestionID, myQuestionType, myQuestionTypeSelector, data.Choices);
                myMCQuestionIndex[myQuestionID] = key;
                myAllAnswerChoices[myQuestionID] = data.Choices;
                var myQuestionAnswerChoicerOrderList = [];
                mySurveyQuestionsList.push({
                    'questionID': myQuestionID,
                    'questionType': myQuestionType,
                    'questionText': myQuestionText,
                    'questionDescription': myQuestionDescription,
                    'questionTypeSelector': myQuestionTypeSelector,
                    'questionAnswerChoices': myQuestionAnswerChoicesList,
                    'questionAnswerChoiceValues': myQuestionAnswerChoicesList,
                    'QuestionAnswerOrderList': myQuestionAnswerChoicerOrderList,
                    'misc': myMiscHTML
                });
                break;
            case "TE":
                myListofTextQuestions.push(myQuestionID);
                break;
        }
    });
    loadSurveyQuestionGrid(mySurveyQuestionsList);
    // loadTextCommentLibrariesDropdown();
    loadMCQuestionsForTextCommentAndTicketTargetDropdowns();
    $(".divUserControlPanel").show();
    $("#trimButtons").show();
}

//////// parses survey data and re-generates answer choices for the form in this tool
function createQuestionAnswerChoicesForGrid(QuestionID, QuestionType, QuestionTypeSelector, myRawAnswerChoices) {
    var myQuestionID = QuestionID;
    var myQuestionType = QuestionType;
    var myToggleButtonID = "btn" + QuestionID + "Toggle";
    var myAnswersHTMLDisplayString = '<div class="cssAnswerGroupContainer" id="{}" type={}>'.format("div" + myQuestionID, myQuestionType);
    myAnswersHTMLDisplayString += "<button id='{}On' onclick='toggleClickedOn(\"{}\", \"true\")'>All On</button> &nbsp;&nbsp;  ".format(myToggleButtonID, myQuestionID);
    myAnswersHTMLDisplayString += "<button id='{}Off' onclick='toggleClickedOff(\"{}\", \"false\")'>All Off</button></br>".format(myToggleButtonID, myQuestionID);
    var _currentValue = "_currentValue";
    var _currentDisplayValue = "_currentDisplayValue";

    switch (myQuestionType) {
        case "MC":  //Multiple Choice question type
            var myQuestionID = QuestionID;
            var _currentValue = "_currentValue";
            var _currentDisplayValue = "_currentDisplayValue";
            var myNumberofAnswerChoices = Object.keys(myRawAnswerChoices).length;
            var myAnswerChoicesOBJECTForThisQuestion = new Object();
            var myAnswerChoiceOBJECTForThisQuestion = [];
            $.each(myRawAnswerChoices, function (a, c) {
                _currentValue = a;
                _currentDisplayValue = JSON.stringify(c['Display']).replace(/\"/g, "");
                var myQIDandAnswerValue = myQuestionID + "|" + _currentValue + "|" + _currentDisplayValue;
                myAnswersHTMLDisplayString += '<input type="checkbox" checked="true" class="cssRadioButtonOptionLabel radioButton" name="grp{}" id="{}" value="{}">{}</input>&nbsp;&nbsp;'.format(myQuestionID, myQuestionID, _currentValue, _currentDisplayValue);
            });
            myAnswerChoicesOBJECTForThisQuestion.id = myQuestionID;
            myAnswerChoicesOBJECTForThisQuestion.count = myNumberofAnswerChoices;
            break;
    };
    myAnswersHTMLDisplayString += '</div>'
    return (myAnswersHTMLDisplayString);
}

//////// parses raw data from API and places in survey questions grid object
function loadSurveyQuestionGrid(mySurveyQuestionsList) {
    $("#divGridSurveyQuestionList").jsGrid({
        width: "100%",
        sorting: true,
        paging: true,
        filtering: false,
        autoload: true,
        pageSize: 300,
        pageButtonCount: 5,
        sorting: true,
        sorter: "string",
        data: mySurveyQuestionsList,
        fields: [
            { name: "questionID", type: "text", width: 40, title: "QID" },
            { name: "questionText", type: "text", width: 150, title: "Text" },
            { name: "questionAnswerChoices", type: "text", width: "auto", title: "Answer Choice Options to Pick Random Answer From" }
        ]
    });
    $("#divGridSurveyQuestionList").jsGrid("sort", { field: "questionText", order: "asc" });
}

//////// function that handles the All Off buttons 
function toggleClickedOff(data, toggleToState) {
    var myQuestionID = data;
    // var myDivID = "div" + myQuestionID;
    // var myNewCheckboxState = toggleToState;
    $('input#' + data).prop('checked', false);
}

//////// function that handles the All On buttons 
function toggleClickedOn(data, toggleToState) {
    var myQuestionID = data;
    var myDivID = "div" + myQuestionID;
    $('#' + myDivID).find('input:checkbox').each(function (a, b) {
        $('input#' + myQuestionID).prop('checked', toggleToState);
        $(b).attr('checked', false);
    });
}

//////// function that builds the data payload being sent to the qAPI
function buildPostReponseDataString(type, questionID, value) {
    let myValue = value;
    switch (type) {
        case "mcsaQuestion": //question answer (generally referring to multiple choice question type)
            myPostResponseAnswersToSubSubmitObjectPRE[questionID] = parseInt(myValue);
            break;
        case "mcmaQuestion":
            myPostResponseAnswersToSubSubmitObjectPRE[questionID] = myValue;
            break;
        case "textInputQuestion": //text entry
            myTextQuestionID = questionID + "_TEXT";
            myPostResponseAnswersToSubSubmitObjectPRE[myTextQuestionID] = myValue;
            break;
        case "startDate": //start date
            myPostResponseAnswersToSubSubmitObjectPRE['startDate'] = myValue;
            myPostResponseAnswersToSubSubmitObjectPRE['endDate'] = myValue;
            break;
        case "endDate": //end date
            myPostResponseAnswersToSubSubmitObjectPRE['endDate'] = myValue;
            break;
        // case "recordedDate":
        //     myPostResponseAnswersToSubSubmitObjectPRE['_recordedDate'] = myValue;
        //     break;
    }
}

//////// makes sure that the number of responses and text comment target have been selected
function preProcessInputCheck() {
    var myReturnString = "ok";
    if ($("#chkIncludeTextResponses").is(':checked') === true) {
        var mySelectedTextLibrary = $('#selectTextCommentLibraryList').val();
        if (mySelectedTextLibrary === null) {
            $("#selectedItemsPanel").prepend("<br/>*** Alert *** Select a comment library ***<br/><br/>");
            alert("Select a comment library");
            myReturnString = "error : comment library not selected";
            return;
        }
        var mySelectedTextTargetQID = $('#selectTextCommentTargetQuestion').val();
        if (mySelectedTextTargetQID === null) {
            $("#selectedItemsPanel").prepend("<br/>*** ALERT *** select which question to base comment sentiment on***<br/><br/>");
            alert("Select a text target");
            myReturnString = "error : text target not selected";
            return;
        }
    }
    if ($("#chkIncludeTickets1").is(':checked') === true) {
        var mySelectedTicketTarget1 = $('#selectTicketTargetQuestion1').val();
        if (mySelectedTicketTarget1 === null) {
            $("#selectedItemsPanel").prepend("<br/>*** ALERT *** select a ticket target ***<br/><br/>");
            alert("Select a ticket target");
            myReturnString = "error : ticket target not selected";
            return;
        }
        var myJSONEndpointURL1 = $('#txtJSONURL1').val();
        if (myJSONEndpointURL1.length < 20 || myJSONEndpointURL1 === null) {
            $("#selectedItemsPanel").prepend("<br/>*** ALERT *** you must provide your JSON endpoint URL ***<br/><br/>");
            alert("JSON endpoint URL required to generate tickets");
            myReturnString = "error : no JSON endpoint 1 URL provided";
            return;
        }
    }

    myNumberOfResponsesToGenerate = $("#txtNumberOfResponses").val();
    if (myNumberOfResponsesToGenerate.length <= 0) {
        $("#selectedItemsPanel").prepend("*** Alert *** How many responses would you like to create? ***<br/>");
        alert("Enter how many responses to create");
        myReturnString = "error : problem with number of responses to create";
        return;
    }
    var myAPIToken = ($("#txtAPIToken").val());
    if (myAPIToken.length === 0) {
        $("#selectedItemsPanel").prepend("*** ALERT *** api token required ***<br/>");
        alert("Enter your API token");
        myReturnString = "error : api token needed";
        return;
    }
    var myDatacenter = ($("#txtDatacenter").val());
    if (myDatacenter.length === 0) {
        $("#selectedItemsPanel").prepend("*** ALERT *** datacenter required ***<br/>");
        alert("Enter your datacenter");
        myReturnString = "error : datacenter token needed";
        return;
    }
    return myReturnString;
}

//////// function that unchecks the highest or lowest available answer choice
//////// on all questions - designed for shaping response sets on larger surveys
function trimAnswerChoices(whichSide) {
    var myTempMCQuestionIndex = JSON.parse(JSON.stringify(myMCQuestionIndex));
    $.each(myMCQuestionIndex, function (k, v) {
        var myQuestionText = mySurveyDetails.elements[v]['QuestionText'];
        // we only trim questions with 'driver' or 'sat' in the qText
        // as these are usually shaped the together 
        // (i.e.for a given dataset, all sat and driver questions will be skewed the same way)
        var myIndexofDriver = myQuestionText.toLowerCase().indexOf("driver:");
        var myIndexofSat = myQuestionText.toLowerCase().indexOf("sat:");
        var myIndexOfEE = myQuestionText.toLowerCase().indexOf("esat:");
        if (myIndexofDriver < 0) {
            if (myIndexofSat < 0) {
                if (myIndexOfEE < 0) {
                    delete myTempMCQuestionIndex[k];
                };
            };
        };
    });

    if (whichSide === "upper") {
        $.each(myTempMCQuestionIndex, function (k, v) {
            var myCurrentQuestionID = k;
            var mySelectedCheckboxes = $('input#' + myCurrentQuestionID + ':checked');
            // console.log("mySelectedCheckboxes is an array = " + JSON.stringify(mySelectedCheckboxes));
            mySelectedCheckboxes.each(function () {
                var myQID = $(this).prop("id");
                var myIndex = myTempMCQuestionIndex[myQID];
                var myQuestionText = mySurveyDetails.elements[myIndex]['QuestionText'];
            });
            mySelectedCheckboxes.eq(-1).prop('checked', false)
        });
    } else if (whichSide === "lower") {
        $.each(myTempMCQuestionIndex, function (k, v) {
            var myCurrentQuestionID = k;
            var mySelectedCheckboxes = $('input#' + myCurrentQuestionID + ':checked');
            mySelectedCheckboxes.eq(0).prop('checked', false)
        });
    };
}

function makeMagic() {
    //////// Create a list of all checked checkboxes
    //////// If a checkbox is checked it represents a possible answer choice
    var thisQuestionAnswerChoiceList = [];
    $("input:checkbox").each(function () {
        var $this = $(this);
        var myQuestionID = $this.attr("id");
        var myQuestionText = $this.parent().attr("questionText")
        var myAnswerChoiceID = $this.attr("value");
        if (myAnswerChoiceID !== "selectTextCommentLibraryList" || myAnswerChoiceID !== "selectTicketTargetQuestion") {
            if ($this.is(":checked")) {
                // var myQAC = myQuestionID + "|" + myAnswerChoiceID;
                var myAnswerChoiceIdentifier = myQuestionID + "|" + $this.attr("value");
                thisQuestionAnswerChoiceList.push(myAnswerChoiceIdentifier);
            }
        }
    });
    //////// Loop through all multiple choice questions in survey
    //////// for each question, look at the available answer choices (checked)
    //////// and pick one at random
    var myStringForTicketPayload = "";
    $.each(myMCQuestionIndex, function (k, v) {
        var myCurrentQuestionID = k;
        var myCurrentQuestionAnswerChoices = thisQuestionAnswerChoiceList.filter(s => s.includes(myCurrentQuestionID + "|"));
        var myNumberOfAnswerChoicesAvailableForThisQuestion = Object.keys(myCurrentQuestionAnswerChoices).length;
        if (myNumberOfAnswerChoicesAvailableForThisQuestion > 0) {
            var myOriginalQuestionIndex = myMCQuestionIndex[myCurrentQuestionID];
            var myQuestionTypeSelector = mySurveyDetails.elements[myOriginalQuestionIndex]['Selector'];
            var myFirstTwo = myQuestionTypeSelector.substring(0, 2).toLowerCase();
            var myMultipleAnswerPayload = [];
            if (myFirstTwo === "ma") {
                var myListOfAvailableAnswerChoices = myCurrentQuestionAnswerChoices;
                // console.log("myCurrentQuestionAnswerChoices" + JSON.stringify(myCurrentQuestionAnswerChoices));
                $.each(myListOfAvailableAnswerChoices, function (a, c) {
                    myCoin = Math.round(Math.random());
                    // console.log("a = " + a);
                    // console.log("c = " + c);
                    // console.log("myCoin = " + myCoin);
                    if (myCoin === 1) {
                        var myFields = c.split('|');
                        var myRandomAnswerValue = myFields[1];
                        myMultipleAnswerPayload.push(myRandomAnswerValue);
                    }
                });
                var myMultipleAnswerPayloadString = myMultipleAnswerPayload.map(String);
                buildPostReponseDataString("mcmaQuestion", myCurrentQuestionID, myMultipleAnswerPayloadString);
                return;
            } else {
                var myRandomAnswerIndex = getRandomNumber(1, myNumberOfAnswerChoicesAvailableForThisQuestion)
                var myRandomAnswerValueAndQID = myCurrentQuestionAnswerChoices[myRandomAnswerIndex - 1];
                var myFields = myRandomAnswerValueAndQID.split('|');
                var myRandomAnswerValue = myFields[1];
                var myQuestionText = mySurveyDetails.elements[myOriginalQuestionIndex]['QuestionText'].replace("&nbsp;", " ");
                var myRandomAnswerDisplayText = JSON.stringify(mySurveyDetails.elements[myOriginalQuestionIndex]['Choices'][myRandomAnswerValue]['Display']).replace(/\"/g, "").replace("&nbsp;", " ");
                myObjectForTicketPayload[myQuestionText] = myRandomAnswerDisplayText;
                myDataPayload[myQuestionText.replace("&nbsp;", " ")] = myRandomAnswerValue.replace("&nbsp;", " ");
                myQuestionIDSAndText[myCurrentQuestionID] = myRandomAnswerValueAndQID.replace("&nbsp;", " ");
                buildPostReponseDataString("mcsaQuestion", myCurrentQuestionID, myRandomAnswerValue);
            }
        };
    });
    //////// Create a random date for the current survey response
    var myDateRangeStart = $("#txtStartDate").datepicker('getDate');
    var myDateRangeEnd = $("#txtEndDate").datepicker('getDate');
    if (isValidDate(myDateRangeEnd) == false) {
        myDateRangeEnd = myDateRangeStart;
    };
    var myNewRandomDate = randomDate(myDateRangeStart, myDateRangeEnd);
    buildPostReponseDataString("startDate", "NA", myNewRandomDate);
    buildPostReponseDataString("recordedDate", "NA", myNewRandomDate);

    //////// if enable text comments is checked
    var myRandomTextComment = "";
    var includeTextCommentsInResponses = $("#chkIncludeTextResponses").is(':checked');
    if (includeTextCommentsInResponses === true) {
        //////// get the question id that you want to associate text comments with
        var mySelectedTextTargetQID = $('#selectTextCommentTargetQuestion').val();
        //////// based on the scale of the selected text target question
        //////// normalize selected value from 0-100 (in the normalize function)
        //////// and convert to the appropriate sentiment

        var myTextSentiment = normalizeTextCommentScore(myPostResponseAnswersToSubSubmitObjectPRE[mySelectedTextTargetQID]);
        //////// this loop exists so that if no comment is returned (for neutral scores)
        //////// it skips the text question instead of entering a blank response
        //////// which shows up in the response data as spaces

        // console.log("makeMagic myTextSentiment = " + myTextSentiment);
        if (myTextSentiment != "neutral") {
            $.each(myListofTextQuestions, function (i, j) {
                myRandomTextComment = theTextMachine(myTextSentiment);
                if (+myRandomTextComment.length > +20) {
                    buildPostReponseDataString("textInputQuestion", j, myRandomTextComment);
                } else { };  // neutral, so no comment submitted
            });
        };
    };
    // console.log("myRandomTextComment = " + myRandomTextComment);

    var includeTicketCreation1 = $("#chkIncludeTickets1").is(':checked');

    //////// if create tickets1 is checked
    var includeTicketCreation1 = $("#chkIncludeTickets1").is(':checked');
    if (includeTicketCreation1 === true) {
        var myPercentageOfResponsesToCreateTicketsFor1 = $('#txtTicketPercentage1').val();
        myRandomNumber1 = Math.random() * 100;
        if (myRandomNumber1 < myPercentageOfResponsesToCreateTicketsFor1) {
            createTicket(myStringForTicketPayload, myNewRandomDate, myRandomTextComment, myObjectForTicketPayload);
        };
    };
};

function getSentimentThresholds() {
    var myGSheetID = JSON.parse(localStorage.getItem('gSheetID'));
    var surveyIDData = { 'GSheetID': myGSheetID };
    $.ajax({
        contentType: "application/json; charset=utf-8",
        method: "GET",
        data: surveyIDData,
        url: "/getSentimentThresholds",
        success: function (data) {
            saveSentimentThresholds(data)
        },
        error: function (jqXHR, exception) {
            console.log("getSentimentThresholds via API failed");
            console.log("jqXHR.responseText = " + jqXHR.responseText);
        },
        dataType: "json"
    })
}

function saveSentimentThresholds(data) {
    myPositiveThreshold = data[0];
    myNegativeThreshold = data[1];
}

function normalizeTextCommentScore(rawScore) {
    var mySelectedTextTargetQID = $('#selectTextCommentTargetQuestion').val();
    var myOriginalQuestionIndex = myMCQuestionIndex[mySelectedTextTargetQID];
    var myTotalNumberOfAnswerChoices = Object.keys(mySurveyDetails.elements[myOriginalQuestionIndex]['Choices']).length;
    var mySentimentGroup;
    var myNormalizedSentimentScore = 10 * (rawScore / myTotalNumberOfAnswerChoices);
    myNormalizedSentimentScore = Math.round(myNormalizedSentimentScore);

    if (parseInt(myNormalizedSentimentScore) >= parseInt(myPositiveThreshold)) {
        mySentimentGroup = "positive";
    } else if (myNormalizedSentimentScore <= myNegativeThreshold) {
        mySentimentGroup = "negative";
    } else {
        mySentimentGroup = "neutral";
    }
    return mySentimentGroup;
}

async function createTicket(dataPayload, ticketDate, randomComment, payloadObject) {
    var myJSONTicketCreationPayload = new Object();
    myJSONTicketCreationPayload.surveyID = mySelectedSurveyID;
    myJSONTicketCreationPayload.randomProperty = "NothingAtAll";
    var myAPIToken = JSON.parse(localStorage.getItem('APIToken'));
    var myDatacenter = JSON.parse(localStorage.getItem('Datacenter'));
    myJSONTicketCreationPayload.apiToken = myAPIToken;
    myJSONTicketCreationPayload.datacenter = myDatacenter;
    var myJSONEndpointURL = JSON.parse(localStorage.getItem('JSONEndpointURL1'));
    var mySelectedTicketTargetQID = $('#selectTicketTargetQuestion1').val();
    var mySelectedTicketTargetAnswerValue = myPostResponseAnswersToSubSubmitObjectPRE[mySelectedTicketTargetQID];

    myDataPayload['surveyID'] = mySelectedSurveyID;
    myDataPayload['apiToken'] = myAPIToken;
    myDataPayload['datacenter'] = myDatacenter;
    myDataPayload['score'] = mySelectedTicketTargetAnswerValue;
    myDataPayload['JSONEndpointURL'] = myJSONEndpointURL;
    myDataPayload['ticketData'] = dataPayload;
    myDataPayload['startDate'] = ticketDate;
    myDataPayload['randomComment'] = randomComment;

    $.each(payloadObject, function (k, v) {
        myDataPayload[k] = v;
    });

    $.ajax({
        contentType: "application/json; charset=utf-8",
        method: "POST",
        url: "/tickets",
        data: JSON.stringify(myDataPayload),
        success: function (data) {
            parsePostPostResponse(data);
        },
        error: function (jqXHR, exception) {
            console.log("Post response via API failed");
            console.log("jqXHR AJAX onError");
            console.log("jqXHR.responseText = " + jqXHR.responseText);
            console.log("jQuery.parseJSON(jqXHR.responseText) = " + jQuery.parseJSON(jqXHR.responseText));
        },
        dataType: "json"
    });
}

function makeItRain() {
    var canvas = document.getElementById("c");
    context = canvas.getContext('2d');
    context.globalCompositeOperation = 'lighter';
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
    draw();
    var textStrip = ['q', 'u', 'a', 'l', 't', 'r', 'i', 'c', 's', 'Q', 'U', 'A', 'L', 'T', 'R', 'I', 'C', 'S'];
    var stripCount = 60, stripX = new Array(), stripY = new Array(), dY = new Array(), stripFontSize = new Array();

    for (var i = 0; i < stripCount; i++) {
        stripX[i] = Math.floor(Math.random() * 1265);
        stripY[i] = -100;
        dY[i] = Math.floor(Math.random() * 7) + 3;
        stripFontSize[i] = Math.floor(Math.random() * 16) + 8;
    }
    var theColors = ['#7F92E9', '#91A0E9', '#A5B1EA', '#BDC5EE', '#A5B1EA', '#A5B1EA'];
    var elem, context, timer;

    function drawStrip(x, y) {
        for (var k = 0; k <= 20; k++) {
            var randChar = textStrip[Math.floor(Math.random() * textStrip.length)];
            if (context.fillText) {
                switch (k) {
                    case 0:
                        context.fillStyle = theColors[0]; break;
                    case 1:
                        context.fillStyle = theColors[1]; break;
                    case 3:
                        context.fillStyle = theColors[2]; break;
                    case 7:
                        context.fillStyle = theColors[3]; break;
                    case 13:
                        context.fillStyle = theColors[4]; break;
                    case 17:
                        context.fillStyle = theColors[5]; break;
                }
                context.fillText(randChar, x, y);
            }
            y -= stripFontSize[k];
        }
    }

    function draw() {
        context.globalAlpha = 0.1
        // clear the canvas and set the properties
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.shadowOffsetX = context.shadowOffsetY = 0;
        context.shadowBlur = 8;
        context.shadowColor = '#7E91E8';

        for (var j = 0; j < stripCount; j++) {
            context.font = stripFontSize[j] + 'px MatrixCode';
            context.textBaseline = 'top';
            context.textAlign = 'center';

            if (stripY[j] > 1358) {
                stripX[j] = Math.floor(Math.random() * canvas.width);
                stripY[j] = -100;
                dY[j] = Math.floor(Math.random() * 7) + 3;
                stripFontSize[j] = Math.floor(Math.random() * 16) + 8;
                drawStrip(stripX[j], stripY[j]);
            } else drawStrip(stripX[j], stripY[j]);

            stripY[j] += dY[j];
        }
        setTimeout(draw, 70);
    }
}

function executeTurboMode() {
    makeItRain();
    // recordSignal("turboModeInitiated");
    if (surveyCurrentlyLoaded === false) {
        $("#selectedItemsPanel").prepend("<br/><br/>select a survey first, silly<br/><br/>");
        return;
    };
    // change random comments while work is being done
    commentTimer = setInterval(function () {
        // var newText = sampleMessages[i++ % sampleMessages.length];
        $("#lblTurboModeStatus").fadeOut(2000, function () {
            $("#selectedItemsPanel").prepend("<br/>" + newComment() + "<br/>").fadeIn(2000);
        });
    }, 60000);

    $(".myLoader").show();
    $('body').addClass('waiting');
    submitResponse();
    $("#selectedItemsPanel").prepend("<br/></>the FTL drives are coming online, turbo mode about to commence... <br/>");
    t0 = performance.now();
    var myNumberOfTurboCycles = $("#txtNumberOfTurboCycles").val();
    var myNumberOfSeconds = $("#txtSecondsBetweenTurboCycles").val();
    if (myNumberOfSeconds.length > 0 || myNumberOfTurboCycles.length > 0) {

    } else {
        console.log("enter how many seconds to wait between rounds")
    };
    var myIntervalBetweenCycles = myNumberOfSeconds * 1000;
    if (myTurboState === "off") {
        myTurboState = "on";
        $("#lblTurboModeStatus").html("turbo mode on")
        $("#btnStartTurboMode").html("terminate turbo mode");
        $("#lblTurboModeCycleNumber").html("turbo mode currently on round #" + myTurboCounter);

        timer = setInterval(function () {
            writeWaiting();
        }, myIntervalBetweenCycles);
    } else {
        terminateTurboMode();
    };
}

function terminateTurboMode() {
    console.log("stopping turgbo mode");
    $("#lblTurboModeStatus").html("");
    $("#lblTurboModeCycleNumber").html("");
    $("#lblTurboCommentLabel").html("");
    $(".myLoader").hide();
    $('body').removeClass('waiting');
    myTurboState = "off";
    clearInterval(timer);
    clearInterval(commentTimer);
    $("#btnStartTurboMode").html("start turbo mode");
    var canvas = document.getElementById("c");
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
}

function newComment() {
    var myRandomComments = [
        "Less than 0.5% of all data we create is ever analysed and used.",
        "A 10% increase in data accessibility will result in more than $65 million additional net income for the typical Fortune 1000 company",
        "Automated responses being generated",
        "Google uses about 1,000 computers to answering a single search query.",
        "Bad data costs US businesses alone $600 billion annually.",
        "70% of data is created by individuals, but enterprises are responsible for storing and managing 80% of that.",
        "A stack of CD-ROMs equal to the current global digital storage capacity would tower 80,000 km beyond the moon.",
        "There are nearly as many pieces of digital information as there are stars in the universe.",
        "Turbo mode is still working",
        "Who knew creating data could be so much fun?",
        "The big data analytics market is set to reach $103 billion by 2023"
    ];
    myRandomNumber = Math.round(Math.random() * 10);
    myRandomComment = myRandomComments[myRandomNumber];
    return myRandomComment;
}

function writeWaiting() {
    myTurboCounter++;
    var myNumberOfCycles = $("#txtNumberOfTurboCycles").val();
    $("#lblTurboModeCycleNumber").html("turbo mode currently on round #" + myTurboCounter);
    $("#selectedItemsPanel").prepend("<br/>round #" + myTurboCounter);
    $("#selectedItemsPanel").prepend("<br/>myNumberOfCycles " + myNumberOfCycles);

    if (myTurboCounter < myNumberOfCycles) {
        $("#selectedItemsPanel").prepend("<br/><br/> | this was round # " + myTurboCounter + " |<br/><br/>");
        $("#btnGenerateResponses").click();
    } else {
        $('body').removeClass('waiting');
        myTurboState = "off";
        var t1 = performance.now();
        var myElapsedTime = t1 - t0;
        $(".myLoader").hide();
        $("#selectedItemsPanel").prepend("<br/>that took " + msToTime(myElapsedTime) + "");
        terminateTurboMode()
    };
}

function msToTime(ms) {
    var seconds = (ms / 1000);
    var minutes = parseInt(seconds / 60, 10);
    seconds = seconds % 60;
    var hours = parseInt(minutes / 60, 10);
    minutes = minutes % 60;
    return hours + ':' + minutes + ':' + seconds;
}

function logDGActivity() {
    // var email = Session.getActiveUser().getEmail();
    // console.log("My User Email = " + email);
    var myAPIToken = JSON.parse(localStorage.getItem('APIToken'));
    var myMaskedAPIToken = "XXXXXXXXXX" + myAPIToken.substring(30, myAPIToken.length);
    var myData = new Object();
    myData['QID3_TEXT'] = mySelectedSurveyID;
    myData['QID1_TEXT'] = myMaskedAPIToken;
    myData['QID2_TEXT'] = myNumberOfResponsesToGenerate;
    myData['startDate'] = new Date();
    myData['endDate'] = new Date();
    myData['surveyID'] = 'SV_1QT9HSX9X5tr7JX';
    myData['QID4'] = myNumberOfResponsesToGenerate;
    // console.log("myData = " + JSON.stringify(myData));
    var myJSONPostResponsePayload = new Object();
    myJSONPostResponsePayload.datacenter = 'co1';
    myJSONPostResponsePayload.surveyID = 'SV_1QT9HSX9X5tr7JX';
    myJSONPostResponsePayload.values = myData;
    $.ajax({
        contentType: "application/json; charset=utf-8",
        method: "POST",
        // url: "https://joeberni.pythonanywhere.com/logDGActivity",
        url: "/logDGActivity",
        data: JSON.stringify(myJSONPostResponsePayload),
        success: function (data) {
            parsePostPostResponse(data);
        },
        error: function (jqXHR, exception) {
            console.log("Post response via API failed");
            console.log("jqXHR logDGActivity onError");
            console.log("jqXHR.responseText = " + jqXHR.responseText);
            console.log("jQuery.parseJSON(jqXHR.responseText) = " + jQuery.parseJSON(jqXHR.responseText));
        },
        dataType: "json"
    });
    myPostResponseAnswersToSubSubmitObjectPRE = {};
}

// var mySignalObject = new Object();
function recordSignal(signalEventCode, signalTarget) {
    var myAPIToken = JSON.parse(localStorage.getItem('APIToken'));
    if (myAPIToken == null) {
        var myMaskedAPIToken = "XXXXXXXXXX";
        mySignalOrgID = "jbernisky+qvoc";
        mySignalAccountID = "jbernisky";
    } else {
        var myMaskedAPIToken = "XXXXXXXXXX" + myAPIToken.substring(30, myAPIToken.length);
        mySignalOrgID = "jbernisky+qvoc";

    }

    var myData = new Object();
    if (signalEventCode !== "undefined") myData['QID3_TEXT'] = signalEventCode;
    if (signalTarget !== "undefined") myData['QID7_TEXT'] = signalTarget;
    if (mySignalOrgID !== "undefined") myData['QID8_TEXT'] = mySignalOrgID;
    if (mySignalAccountID !== "undefined") myData['QID9_TEXT'] = mySignalAccountID;
    myData['QID10_TEXT'] = myMaskedAPIToken;

    var myJSONPostResponsePayload = new Object();
    myJSONPostResponsePayload.datacenter = 'co1';
    myJSONPostResponsePayload.surveyID = 'SV_1QT9HSX9X5tr7JX';
    myJSONPostResponsePayload.values = myData;
    $.ajax({
        contentType: "application/json; charset=utf-8",
        method: "POST",
        url: "/recordSignal",
        data: JSON.stringify(myJSONPostResponsePayload),
        success: function (data) {
            // do nothing;
        },
        error: function (jqXHR, exception) {
            console.log("Post response via API failed");
            console.log("jqXHR AJAX onError");
            console.log("jqXHR.responseText = " + jqXHR.responseText);
            console.log("jQuery.parseJSON(jqXHR.responseText) = " + jQuery.parseJSON(jqXHR.responseText));
        },
        dataType: "json"
    });
}

async function submitResponse() {
    // t0 = performance.now();
    if (preProcessInputCheck() !== "ok") {
        return;
    }
    var myJSONPostResponsePayload = new Object();
    var myAPIToken = JSON.parse(localStorage.getItem('APIToken'));
    var myDatacenter = JSON.parse(localStorage.getItem('Datacenter'));
    myJSONPostResponsePayload.apiToken = myAPIToken;
    myJSONPostResponsePayload.datacenter = myDatacenter;
    myJSONPostResponsePayload.surveyID = mySelectedSurveyID;

    ga('gtm1.send', 'pageview', {
        'metric1': myNumberOfResponsesToGenerate
    });

    var trackerName = ga.getAll()[0].get('name');
    // console.log("trackerName = " + trackerName);
    logDGActivity();
    // recordSignal("createResponses");

    for (let i = 0; i < myNumberOfResponsesToGenerate; i++) {
        var myIndex = i + 1;
        $("#selectedItemsPanel").prepend("submitting response >> " + myIndex + " / " + parseInt(myNumberOfResponsesToGenerate) + "</br >");
        makeMagic();
        // console.log("myPostResponseAnswersToSubSubmitObjectPRE = " + JSON.stringify(myPostResponseAnswersToSubSubmitObjectPRE));
        myJSONPostResponsePayload.values = myPostResponseAnswersToSubSubmitObjectPRE;
        $.ajax({
            contentType: "application/json; charset=utf-8",
            method: "POST",
            // url: "https://joeberni.pythonanywhere.com/postresponse",
            url: "/postresponse",
            data: JSON.stringify(myJSONPostResponsePayload),
            success: function (data) {
                parsePostPostResponse(data);
            },
            error: function (jqXHR, exception) {
                console.log("Post response via API failed");
                console.log("jqXHR AJAX onError");
                console.log("jqXHR.responseText = " + jqXHR.responseText);
                console.log("jQuery.parseJSON(jqXHR.responseText) = " + jQuery.parseJSON(jqXHR.responseText));
            },
            dataType: "json"
        });
        myPostResponseAnswersToSubSubmitObjectPRE = {};
    }
    $("#selectedItemsPanel").prepend("<br/>");
}

function parsePostPostResponse(obj) {
    var myResponseMessage = JSON.stringify(obj['meta']);
    // t1 = performance.now();
    // var myElapsedTime = (t1 - t0) / 1000;
    $("#selectedItemsPanel").prepend("<br/>" + myResponseMessage);
    // console.log(myResponseMessage);
}

function enableTickets() {
    if ($("#chkIncludeTickets1").is(':checked') === true) {
        $("#selectTicketTargetQuestion1").prop('disabled', false);
        $("#txtTicketPercentage1").prop('disabled', false);
        $("#txtJSONURL1").prop('disabled', false);
        $("#btnSaveJSONEndpoint1").prop('disabled', false);
        $("#divTicketOptions").css('display', 'block');

    } else {
        $("#selectTicketTargetQuestion1").prop('disabled', true);
        $("#txtTicketPercentage1").prop('disabled', true);
        $("#txtJSONURL1").prop('disabled', true);
        $("#btnSaveJSONEndpoint1").prop('disabled', true);
        $("#divTicketOptions").css('display', 'none');
    };
}

function enableTextCommentDropdowns() {
    // let myOrigCommentParts = ['Intro', 'Segment1', 'Segment2', 'Closing'];
    if ($("#chkIncludeTextResponses").is(':checked') === true) {
        $("#selectTextCommentLibraryList").prop('disabled', false);
        $("#selectTextCommentTargetQuestion").prop('disabled', false);
        $("#txtGSheetID").prop('disabled', false);
        $("#btnSaveUserTextInfo").prop('disabled', false);
        $("#divTextCommentOptions").css('display', 'block');
    } else {
        $("#selectTextCommentLibraryList").prop('disabled', true);
        $("#selectTextCommentTargetQuestion").prop('disabled', true);
        $("#txtGSheetID").prop('disabled', true);
        $("#btnSaveUserTextInfo").prop('disabled', true);
        $("#divTextCommentOptions").css('display', 'none');
    };
    if ($("#chkIncludeTickets1").is(':checked') === true) {
        $("#selectTextCommentLibraryList1").prop('disabled', false);
        $("#selectTextCommentTargetQuestion1").prop('disabled', false);
        $("#divTicketOptions").prop('display', 'block');
    } else {
        $("#selectTextCommentLibraryList1").prop('disabled', true);
        $("#selectTextCommentTargetQuestion1").prop('disabled', true);
    };
}

function textInputAnswerChanged(myCurrentTextbox) {
    var $this = $(this)
    var myCurrentQuestionID = myCurrentTextbox.attr("id") + "_TEXT";
    var myCurrentAnswervalue = myCurrentTextbox.val();

    if (isNaN(myCurrentAnswervalue)) {
        mySelectedAnswerValue = myCurrentTextbox.val();
    }
    else {
        ////////  If an number is entered into a text input field, it is interpreted by the API as a 
        ////////  number and needs to be submitted without double quotes
        ////////  This python class automatically strips double quotes off of number values in order to submit to API
        ////////  If number is entered into text field add double quotes around it so that api treats it as a string
        mySelectedAnswerValue = "\"" + myCurrentAnswervalue + "\"";
    };
    // console.log("mySelectedAnswerValue = " + mySelectedAnswerValue);
    buildPostReponseDataString("mcQuestion", myCurrentQuestionID, mySelectedAnswerValue);
}

function loadMCQuestionsForTextCommentAndTicketTargetDropdowns() {
    var myMCQuestionDropdown = $("#selectTextCommentTargetQuestion");
    var myTextCommentLibraryDropdown = $("#selectTextCommentLibraryList");
    var myTicketTargetDropdown1 = $("#selectTicketTargetQuestion1");
    var myTicketTargetDropdown2 = $("#selectTicketTargetQuestion2");
    // myMCQuestionDropdown.empty();
    // myTicketTargetDropdown.empty();
    // myTextCommentLibraryDropdown.empty();
    // myMCQuestionIndex[myQuestionID] = key;
    $.each(myMCQuestionIndex, function (key, data) {
        var myQuestionText = mySurveyQuestions[data].QuestionText.replace("&nbsp;", " ");
        myMCQuestionDropdown.append($("<option />").val(key).text(myQuestionText));
        myTicketTargetDropdown1.append($("<option />").val(key).text(myQuestionText));
        myTicketTargetDropdown2.append($("<option />").val(key).text(myQuestionText));
        // console.log("myMCQuestionIndex = " + JSON.stringify(key) + " " + data);
        // console.log("myQuestionText = " + myQuestionText);
    });
}

function toggleCheckboxes() {
    $('input:checkbox').not(this).prop('checked', this.checked);
};

function getRandomNumber(min, max) {
    var myRandomNumber = Math.random() * (max - min) + min;
    return Math.round(myRandomNumber);
}

function randomDate(start, end) {
    var myStartDate = start;
    var myEndDate = end;
    var startHour = 0;
    var endHour = 23;
    var myRandom1 = Math.random();
    var myRandom2 = Math.random();
    var date = new Date(+myStartDate + myRandom1 * (myEndDate - myStartDate));
    var hour = startHour + myRandom2 * (endHour - startHour) | 0;
    date.setHours(hour);
    var myNewDate = new Date(start.getTime() + Math.random() * (myEndDate.getTime() - myStartDate.getTime()));
    return myNewDate;
}

function emptyRightDiv() {
    $("#divRightDevPanel").html('');
}

function loadDatePickers() {
    var currentDate = new Date();
    $("#txtStartDate").datepicker({
        setDate: currentDate,
        showButtonPanel: true,
    });

    $("#txtEndDate").datepicker({
        setDate: currentDate,
        showButtonPanel: true,
    });

    $("#txtStartDate").focus(function () {
        $('#txtStartDate').datepicker();
        $('#txtStartDate').datepicker('show');
    });

    $("#txtEndDate").focus(function () {
        $('#txtEndDate').datepicker();
        $('#txtEndDate').datepicker('show');
    });

    $('#txtStartDate').datepicker().on("input change", function (e) {
        console.log("Date changed: ", e.target.value);
        saveUserInfoToLocalStorage();
    });

    $('#txtEndDate').datepicker().on("input change", function (e) {
        console.log("Date changed: ", e.target.value);
        saveUserInfoToLocalStorage();
    });

    var myStartDate = JSON.parse(localStorage.getItem('StartDate'));
    $('#txtStartDate').datepicker('setDate', 'today');
    $('#txtEndDate').datepicker('setDate', 'today')
}

function isValidDate(d) {
    return d instanceof Date && !isNaN(d);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function loadStringReplacementFunction() {
    // String replacement function for building URLs to post survey response to//
    String.prototype.format = function () {
        var i = 0, args = arguments;
        return this.replace(/{}/g, function () {
            return typeof args[i] != 'undefined' ? args[i++] : '';
        });
    };
}

function loadMyGlobalEventHandlers() {
    $("#btnToggleAPITokenVisibility").click(function (event) {
        toggleAPIVisibility(event);
    });


    $("#btnStartTutorial").click(function (event) {
        startTutorial();
    });


    $("#selectTextCommentLibraryList").change(function (event) {
        getSelectedTextLibrary();
    });

    $("#btnDoSomething").click(function (event) {
        // recordSignal("clickDoSomething");
        btnDoSomething();
    });


    $("#txtAPIToken").keyup(function () { }).focus(function () {
        //
    }).blur(function () {
        saveUserInfoToLocalStorage();
        $("#selectedItemsPanel").prepend("<br/>user info saved to local storage");
    });

    $("#txtDatacenter").keyup(function () {
        //
    }).focus(function () {
        //
    }).blur(function () {
        saveUserInfoToLocalStorage();
        $("#selectedItemsPanel").prepend("<br/>user info saved to local storage");
    });

    $("#txtStartDate").keyup(function () {
        //
    }).focus(function () {
        //
    }).blur(function () {
        saveUserInfoToLocalStorage();
        $("#selectedItemsPanel").prepend("<br/>start date saved to local storage");
    });

    $("#txtEndDate").keyup(function () {
        //
    }).focus(function () {
        //
    }).blur(function () {
        saveUserInfoToLocalStorage();
        $("#selectedItemsPanel").prepend("<br/>end date saved to local storage");
    });

    $("#txtNumberOfResponses").keyup(function () {
        //
    }).focus(function () {
        //
    }).blur(function () {
        $("#selectedItemsPanel").prepend("<br/>number of responses saved to local storage");
        var myVal = $(this).val();
        if (myVal > 50) {
            $("#txtNumberOfResponses").val("50");
            $("#selectedItemsPanel").prepend("easy there, tough guy...50 is the max number allowed at one time<br/>for more power, seek out turbo mode...<br/>")
        }
        saveUserInfoToLocalStorage();

    });

    $("#txtTicketPercentage1").keyup(function () {
        //
    }).focus(function () {
        //
    }).blur(function () {
        saveUserInfoToLocalStorage();
        $("#selectedItemsPanel").prepend("ticket percentage 1 saved to local storage");
    });

    $("#txtTicketPercentage2").keyup(function () {
        //
    }).focus(function () {
        //
    }).blur(function () {
        saveUserInfoToLocalStorage();
        $("#selectedItemsPanel").prepend("ticket percentage saved 2 to local storage");
    });

    $("#btnStartTurboMode").click(function (event) {
        saveUserInfoToLocalStorage();
        getUserInfoFromLocalStorage();
        executeTurboMode();
    });

    // $("#btnPreProcessResponses").click(function (event) {
    //     makeMagic();
    // });

    $("#btnGenerateResponses").click(function (event) {
        submitResponse();
    });

    $("#gridSurveyQuestionList").jsGrid();

    $("#btnEmptyDiv").click(function (event) {
        saveCommentLibrary();
    });

    $("#btnTrimLower").click(function (event) {
        trimAnswerChoices("lower");
    });

    $("#btnTrimUpper").click(function (event) {
        trimAnswerChoices("upper");
    });

    $("#btnAddLower").click(function (event) {
        padAnswerChoices("lower");
    });

    $("#btnAddUpper").click(function (event) {
        padAnswerChoices("upper");
    });

    $("#chkIncludeTextResponses").change(function (event) {
        enableTextCommentDropdowns();
    });

    $("#chkIncludeTickets1").change(function (event) {
        enableTickets(1);
    });

    // $("#chkIncludeTickets2").change(function (event) {
    //     enableTickets(2);
    // });

    $("#btnSaveUserInfo").click(function (event) {
        saveUserInfoToLocalStorage();

        var myNumberOfEnjoyHintObjects = $('[class^="introjs"]').length;
        console.log("myNumberOfEnjoyHintObjects = " + myNumberOfEnjoyHintObjects)
        if (myNumberOfEnjoyHintObjects <= 0) {
            document.location.reload();
        }
    });

    $("#btnSaveUserTextInfo").click(function (event) {
        var myTextCommentLibraryDropdown = $("#selectTextCommentLibraryList");
        myTextCommentLibraryDropdown.empty();
        saveUserInfoToLocalStorage();
        getCommentLibraryListFromGoogleSheets();
    });

    $("#btnSaveJSONEndpoint1").click(function (event) {
        saveUserInfoToLocalStorage;
    });

    $("#btnSaveJSONEndpoint2").click(function (event) {
        saveUserInfoToLocalStorage;
    });

    $("#txtJSONURL1").keyup(function () {
        //
    }).focus(function () {
        //
    }).blur(function () {
        saveUserInfoToLocalStorage();
        $("#selectedItemsPanel").prepend("JSON endpoint 1 URL saved to local storage");
    });

    $("#txtJSONURL2").keyup(function () {
        //
    }).focus(function () {
        //
    }).blur(function () {
        saveUserInfoToLocalStorage();
        $("#selectedItemsPanel").prepend("JSON endpoint 2 URL saved to local storage");
    });

    $("#btnToggleDevMode").click(function (event) {
        toggleDevMode();
    });

    $("#txtNumberOfTurboCycles").keyup(function () {
        //
    }).focus(function () {
        //
    }).blur(function () {
        saveUserInfoToLocalStorage();
        $("#selectedItemsPanel").prepend("# of turbo cycles saved to local storage");
    });

    $("#txtSecondsBetweenTurboCycles").keyup(function () {
        //
    }).focus(function () {
        //
    }).blur(function () {
        saveUserInfoToLocalStorage();
        $("#selectedItemsPanel").prepend("interval for turbo cycles saved to local storage");
    });
}
//Everyone is great!
var myIntroMessage = "";
myIntroMessage += "<br/>";
myIntroMessage += "welcome to the random data generation tool";
myIntroMessage += "<br/><br/>";
myIntroMessage += "to begin, enter your api key and datacenter";
myIntroMessage += "<br/>";
myIntroMessage += "and click the checkmark to save your info";
myIntroMessage += "<br/>";
myIntroMessage += "select the survey you would like";
myIntroMessage += "<br/>";
myIntroMessage += "to create responses for.";
myIntroMessage += "<br/><br/>";
myIntroMessage += "all multiple choice questions and their ";
myIntroMessage += "<br/>";
myIntroMessage += "answer choices will be shown. if an answer";
myIntroMessage += "<br/>";
myIntroMessage += "choice is selected, the random answer ";
myIntroMessage += "<br/>";
myIntroMessage += "generation engine will include that answer ";
myIntroMessage += "<br/>";
myIntroMessage += "choice in it's pool of possible answer ";
myIntroMessage += "<br/>";
myIntroMessage += "choices it pick from ";
myIntroMessage += "<br/><br/>";
myIntroMessage += "note::: this tool was designed to work with  ";
myIntroMessage += "<br/>";
myIntroMessage += "surveys that contain multiple choice ";
myIntroMessage += "<br/>";
myIntroMessage += "questions and text questions. ";
myIntroMessage += "<br/><br/>";
myIntroMessage += "each text question will contain a random "
myIntroMessage += "<br/>";
myIntroMessage += "comment based on the chosen library. ";
myIntroMessage += "<br/<br/>";
myIntroMessage += "all other question types will be ignored ";
myIntroMessage += "<br/><br/>";
myIntroMessage += "now, buckle up and have some data fun!<br/>";

