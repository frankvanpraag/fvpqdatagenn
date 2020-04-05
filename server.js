// server.js

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
var myTextQuestionIndex = new Object();
var myNPSQID;
var myListofTextQuestions = [];
var mySurveyQuestions;
var myAnswerChoicesCandidatesObject = new Object();
var myAnswerChoicesCandidatesArray = [];
var myCommentPartsLibrary;
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
var myRowString;
var mySessionID;
var myNumberOfResponsesPerCall = 100000;
var myQandAs;
var myListofTextQuestions;
var myStartDate;
var myEndDate;
var myAPIToken;
var mySurveyID;
var myDatacenter;
var myTotalNumberOfResponsesToGenerate;
var GSheetID = '1gXvHT5qSdyxl_Pf0bVU2TkxZQL32TizQz_Ws2plASWM';
var mySentimentThresholds;

var fs = require('fs');
var http = require('http');
var https = require('https');
var express = require('express');
var request = require('request');
var cors = require('cors')
var got = require('got');
var path = require('path');
const detectCharacterEncoding = require('detect-character-encoding');
var bodyParser = require('body-parser');
var format = require('date-format');
const { Parser } = require('json2csv');
const csv = require('csv')
// const csv = require('fast-csv');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const utf8 = require('utf8');
// var curl = new Curl();
var app = express();
var jsonParser = bodyParser.json()
app.use(bodyParser.urlencoded({
    extended: true
}));
var textParser = bodyParser.text();

let google = require('googleapis');
let privatekey = require("./service_account.json");
const GOOGLE_CLIENT_ID = '1009684851713'
const GOOGLE_CLIENT_SECRET = 'DpBMlDSScaltPg2l8hBWo7lE'
const GOOGLE_DISCOVERY_URL = ("https://accounts.google.com/.well-known/openid-configuration")
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']
const { GoogleSpreadsheet } = require('google-spreadsheet');
const creds = require('./service_account.json');
// const compute = google.compute('v1');

app.use(express.static('static'));

app.all('/', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

loadStringReplacementFunction();

app.use(cors())
app.use(bodyParser.raw({ limit: '10mb' }))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/img', express.static(__dirname + '/img'));
app.use('/fonts', express.static(__dirname + '/fonts'));
app.use('/tmp', express.static(__dirname + '/tmp'));





var router = express.Router();
router.get('/', function (req, res) {
    res.json({ message: 'hooray! welcome to our api!' });
});

app.use('/api', router);
const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
    console.log(`Our app is running on port ${PORT}`);
});

router.route('/surveys')
    .get(function (req, res, next) {
        var myAPIToken = req.query.apitoken;
        var myDatacenter = req.query.datacenter;
        var myQAPIurl = "https://{}.qualtrics.com/API/v3/surveys".format(myDatacenter)
        const myOptions = {
            url: myQAPIurl,
            method: 'GET',
            json: true,
            headers: {
                'x-api-token': myAPIToken,
                'accept': "application/json",
                'content-type': "application/json"
            }
        };

        request(myOptions, (err, response, body) => {
            if (response.statusCode === 200) {
                res.json(response)
            }
            else if (err) {
                console.log("err get /surveys = ", response);
            } else {
                console.log("else get /surveys = ", response);
            }
        });
    });


function getSentimentThresholds() {
    var surveyIDData = {
        'GSheetID': GSheetID
    };
    $.ajax({
        contentType: "application/json; charset=utf-8",
        method: "GET",
        data: surveyIDData,
        url: "https://q.datagen.app/getSentimentThresholds",
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

router.route('/surveys/:surveyid')
    .get(function (req, res) {
        // authGoogle();
        var mySurveyID = req.params.surveyid;
        var myAPIToken = req.query.apitoken;
        var myDatacenter = req.query.datacenter;
        // console.log("surveys/:surveyid mySurveyID = ", mySurveyID);
        // console.log("surveys/:surveyid myAPIToken = ", myAPIToken);
        // console.log("surveys/:surveyid myDatacenter = ", myDatacenter);

        // getCommentLibraryListFromGoogleSheets();
        // var myTextCommentStructure = getTextCommentStructureFromGoogleSheets();
        // var mySentimentThresholds = getSentimentThresholds();

        res.setHeader('Content-Type', 'application/json');
        myQAPIurl = "https://{}.qualtrics.com/API/v3/survey-definitions/{}".format(
            myDatacenter, mySurveyID);

        const myOptions = {
            url: myQAPIurl,
            method: 'GET',
            json: true,
            headers: {
                'x-api-token': myAPIToken,
                'accept': "application/json",
                'content-type': "application/json"
            }
        };

        request(myOptions, (err, response, body) => {
            if (response.statusCode === 200) {
                res.json(response)
            }
            else
                if (err) {
                    console.log("err get /surveys = ", err);
                } else {
                    console.log("/surveys/:surveyidresponse.statusCode = ", response.statusCode);
                    console.log("else get /surveys/:surveyid = ");
                }
        });
    })

router.route('/surveysnext')
    .get(function (req, res) {
        var myAPIToken = req.query.apitoken;
        var myDatacenter = req.query.datacenter;
        var myNextPageURL = req.query.surveyListNextPageURL;
        // console.log("surveysnext myAPIToken = ", myAPIToken);
        // console.log("surveysnext myDatacenter = ", myDatacenter);

        const myOptions = {
            url: myNextPageURL,
            method: 'GET',
            json: true,
            headers: {
                'x-api-token': myAPIToken,
                'accept': "application/json",
                'content-type': "application/json"
            }
        };

        res.setHeader('Content-Type', 'application/json');
        request(myOptions, (err, response, body) => {
            if (response.statusCode === 200) {
                res.json(response)
            }
            else
                if (err) {
                    console.log("err get /surveys/next = ", response);
                } else {
                    console.log("else get /surveys/next = ", response);
                }
        });
    })

router.route('/getListOfTextCommentLibraries')
    .get(function (req, res) {
        console.log("getListOfTextCommentLibraries starting");
        // var mySheetID = req.query.mySheetID;
        var mySheetID = '1gXvHT5qSdyxl_Pf0bVU2TkxZQL32TizQz_Ws2plASWM';
        console.log("% % % % % % % % surveysnext myDatacenter = ", myDatacenter);

        // mySheetID = request.args.get('GSheetID');
        var User_SPREADSHEET_ID = mySheetID;
        var Default_SPREADSHEET_ID = '1gXvHT5qSdyxl_Pf0bVU2TkxZQL32TizQz_Ws2plASWM';
        if (User_SPREADSHEET_ID.length < 10) {
            User_SPREADSHEET_ID = Default_SPREADSHEET_ID;
            // mySheetID
        };

    })

async function authGoogle() {
    // var mySheetID = request.args.get('GSheetID')
    var mySheetID = '1gXvHT5qSdyxl_Pf0bVU2TkxZQL32TizQz_Ws2plASWM';
    var User_SPREADSHEET_ID = mySheetID;
    var Default_SPREADSHEET_ID = '1gXvHT5qSdyxl_Pf0bVU2TkxZQL32TizQz_Ws2plASWM';
    if (User_SPREADSHEET_ID.length < 10) {
        User_SPREADSHEET_ID = Default_SPREADSHEET_ID
    };
    const doc = new GoogleSpreadsheet(mySheetID);
    await doc.useServiceAccountAuth(creds);

    // This method looks for the GCLOUD_PROJECT and GOOGLE_APPLICATION_CREDENTIALS
    // environment variables.
    const auth = new google.auth.GoogleAuth({
        // Scopes can be specified either as an array or as a single, space-delimited string.
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    });
    const authClient = await auth.getClient();

    // obtain the current project Id
    const project = await auth.getProjectId();

    // Fetch the list of GCE zones within a project.
    const res = await compute.zones.list({ project, auth: authClient });
    // console.log(res.data);
}

router.route('/beginGenerateResponses')
    .post(function (req, res, next) {
        // console.log("beginGenerateResponses");
        generateResponses(req, function (err, csv) {
            if (error) {
                console.log("ERROR");
            } else {
                console.log("generateResponses success");
                // console.log("mystery csv = ", csv);
                res.setHeader('Content-disposition', 'attachment; filename=data.csv');
                res.set('Content-Type', 'text/csv');
                res.status(200).send("myCSVstring");
            }
        });
    })

function sendFile(myAPIToken, csvString, surveyId, datacenter) {
    myOutgoingQAPIurl = 'https://{}.qualtrics.com/API/v3/surveys/{}/import-responses'.format(datacenter, surveyId)
    var myOutgoingData = new Object();
    myOutgoingData['surveyID'] = surveyId;
    myOutgoingData['datacenter'] = datacenter;
    myOutgoingData['apiToken'] = myAPIToken;
    myOutgoingData['data'] = csvString;
    myOutgoingDataJSON = JSON.stringify(myOutgoingData);

    console.log("sendFile csvString = ", csvString);
    // 
    var myOutgoingOptions = {
        url: myOutgoingQAPIurl,
        method: 'POST',
        body: csvString,
        encoding: null,
        headers: {
            'accept': "application/json",
            'content-type': "application/json",
            'content-type': "text/csv; charset=UTF-8",
            'x-api-token': myAPIToken
        }
    };

    request(myOutgoingOptions, (err, response, body) => {
        if (response.statusCode === 200) {
            return (response.body);
        }
        else if (err) {
            console.log("err get /surveys = ", response);
        } else {
            console.log("else get /surveys = ", response);
        }
    });
}

function generateResponses(req, res) {
    // console.log("generateResponses req.body = ", req.body);
    var myAPIToken = req.body.apitoken;
    var mySurveyID = req.body.surveyID;
    var myDatacenter = req.body.datacenter;
    var includeTextResponses = req.body.includeTextResponses;
    var mySelectedTextTargetQID = req.body.mySelectedTextTargetQID;
    // console.log("generateResponses mySelectedTextTargetQID = ", mySelectedTextTargetQID);
    var myTotalNumberOfResponsesToGenerate = req.body.myTotalNumberOfResponsesToGenerate;
    myPositiveThreshold = req.body.myPositiveThreshold;
    myNegativeThreshold = req.body.myNegativeThreshold;
    // GSheetID = req.body.myGSheetID;
    // console.log("generateResponses GSheetID = ", GSheetID)

    myQandAs = req.body.myAnswerChoicesForAllQuestions;
    myListofTextQuestions = req.body.myListofTextQuestions;
    myStartDate = req.body.startdate;
    myEndDate = req.body.enddate;
    myAnswerChoicesForAllQuestions = req.body.myAnswerChoicesForAllQuestions;

    // var myNumberOfCalls = Math.floor(myTotalNumberOfResponsesToGenerate / myNumberOfResponsesPerCall);
    // console.log("myAnswerChoicesForAllQuestions = ", myAnswerChoicesForAllQuestions);
    // var myRemainder = myTotalNumberOfResponsesToGenerate % myNumberOfResponsesPerCall;

    if (includeTextResponses === true) {
        myCommentPartsLibrary = req.body.myCommentPartsLibrary;
        myTextCommentStructure = req.body.myTextCommentStructure;
        mySentimentThresholds = req.body.mySentimentThresholds;
        // var mySentimentThresholds = getSentimentThresholds(GSheetID);
        // console.log("myQandAs = ", myQandAs);
        // console.log("myCommentPartsLibrary = ", myCommentPartsLibrary);
    };

    // get survey details
    myQAPIurl = "https://{}.qualtrics.com/API/v3/survey-definitions/{}".format(
        myDatacenter, mySurveyID);
    const myOptions = {
        url: myQAPIurl,
        method: 'GET',
        json: true,
        headers: {
            'x-api-token': myAPIToken,
            'accept': 'application/json',
            'content-type': 'application/json; charset=utf-8'
        }
    };

    request(myOptions, (err, myRes, body) => {
        if (myRes.statusCode === 200) {
            mySurveyDetails = body.result;
            // console.log("mySurveyDetails = ", mySurveyDetails);
            var myResponse = myRes;
            // for (let a = 0; a < myNumberOfCalls; a++) {
            // console.log("uploading batch #{} ".format(a + 1));

            writeCSVStringHeaders(includeTextResponses);
            var myJSONPostResponsePayload = new Object();
            myJSONPostResponsePayload.apiToken = myAPIToken;
            myJSONPostResponsePayload.datacenter = myDatacenter;
            myJSONPostResponsePayload.surveyID = mySelectedSurveyID;

            // for (let c = 0; c < myNumberOfResponsesPerCall; c++) {
            for (let c = 0; c < myTotalNumberOfResponsesToGenerate; c++) {
                generateSingleRandomResponse(includeTextResponses, mySelectedTextTargetQID);
            };

            var myCleanedRowString = myRowString.replace(/[#]/g, '');
            var myCleanedRowStringUTF8 = utf8.encode(myCleanedRowString);
            sendFile(myAPIToken, myCleanedRowStringUTF8, mySurveyID, myDatacenter);
        }

        else
            if (err) {
                console.log("generateResponses err get /surveys = ", err);
            } else {
                console.log("generateResponses / surveys/:surveyidresponse.statusCode = ", response.statusCode);
                console.log("generateResponses else get /surveys/:surveyid = ");
            }
    });
}

function generateSingleRandomResponse(includeTextResponses, mySelectedTextTargetQID) {
    
    Object.keys(myQandAs).forEach(function (k, v) {
        var myCurrentQuestionID = k;
        // console.log("k = ", k);
        // console.log("v = ", v);

        var myCurrentQuestionAnswerChoices = myQandAs[myCurrentQuestionID];
        var myNumberOfAnswerChoicesAvailableForThisQuestion = Object.keys(myCurrentQuestionAnswerChoices).length;

        if (myNumberOfAnswerChoicesAvailableForThisQuestion > 0) {
            // console.log("generateSingleRandomResponse");
            // console.log("myNumberOfAnswerChoicesAvailableForThisQuestion = ", myNumberOfAnswerChoicesAvailableForThisQuestion);
            // console.log("myCurrentQuestionAnswerChoices = ", myCurrentQuestionAnswerChoices);
            // console.log("myCurrentQuestionID = ", myCurrentQuestionID);

            var myQuestionTypeSelector = mySurveyDetails.Questions[myCurrentQuestionID]['Selector'];
            var myFirstTwo = myQuestionTypeSelector.substring(0, 2).toLowerCase();
            var myMultipleAnswerPayload = [];
            if (myFirstTwo === "ma") {
                var myListOfAvailableAnswerChoices = myCurrentQuestionAnswerChoices;
                myCurrentQuestionAnswerChoices.forEach(function (a, c) {
                    myCoin = Math.round(Math.random());
                    if (myCoin === 1) {
                        myMultipleAnswerPayload.push(c);
                    }
                });
                var myMultipleAnswerPayloadString = myMultipleAnswerPayload.map(String);
                if (myMultipleAnswerPayloadString.length != 0) {
                    buildPostResponseDataString("mcmaQuestion", myCurrentQuestionID, '"' + myMultipleAnswerPayloadString + '"');
                }
                else {
                    buildPostResponseDataString("mcmaQuestion", myCurrentQuestionID, '');
                };
                return;
            } else {
                var myRandomAnswerIndex = getRandomNumber(1, myNumberOfAnswerChoicesAvailableForThisQuestion)
                var myRandomAnswerValueRaw = myCurrentQuestionAnswerChoices[myRandomAnswerIndex - 1];
                myRandomAnswerValue = myRandomAnswerValueRaw.split('|').pop();
                var myQuestionText = mySurveyDetails.Questions[myCurrentQuestionID]['QuestionText'];
                // var myRandomAnswerDisplayText = JSON.stringify(mySurveyDetails.Questions[myCurrentQuestionID]['Choices'][myRandomAnswerValue]['Display']).replace(/\"/g, "");
                // myObjectForTicketPayload[myQuestionText] = myRandomAnswerDisplayText;
                myDataPayload[myQuestionText] = myRandomAnswerValue.replace("&nbsp;", " ");
                console.log("myRandomAnswerValue = ", myRandomAnswerValue)
                buildPostResponseDataString("mcsaQuestion", myCurrentQuestionID, myRandomAnswerValue);
            }
        };
    });

    // //////// if enable text comments is checked
    var myRandomTextComment = "";
    if (includeTextResponses === false) {
        // myRowString = removeLastComma(myRowString) + "\n";
    } else {
        //////// get the question id that you want to associate text comments with
        var mySelectedTextTargetQID = mySelectedTextTargetQID;
        //////// based on the scale of the selected text target question
        //////// normalize selected value from 0-100 (in the normalize function)
        //////// and convert to the appropriate sentiment

        // console.log("$%$%$%$% $%$%$%$ myPostResponseAnswersToSubSubmitObjectPRE[mySelectedTextTargetQID] = ", myPostResponseAnswersToSubSubmitObjectPRE[mySelectedTextTargetQID]);

        var myTextSentiment = normalizeTextCommentScore(myPostResponseAnswersToSubSubmitObjectPRE[mySelectedTextTargetQID], mySelectedTextTargetQID);

        myListofTextQuestions.forEach(function (i, j) {
            myRandomTextComment = theTextMachine(myTextSentiment);
            if (+myRandomTextComment.length > +10) {
                buildPostResponseDataString("textInputQuestion", j, myRandomTextComment);
            } else { };
        });
        // myRowString = removeLastComma(myRowString);
        // };
    };
    // console.log("myRandomTextComment = " + myRandomTextComment);

    //////// Create a random date for the current survey response
    var myDateRangeStart = new Date(myStartDate);
    var myDateRangeEnd = new Date(myEndDate);

    if (isValidDate(myDateRangeEnd) == false) {
        myDateRangeEnd = myDateRangeStart;
    };
    var myNewRandomDate = randomDate(myDateRangeStart, myDateRangeEnd);
    // console.log("what's this format? myNewRandomDate = ", myNewRandomDate.toISOString());

    date = myNewRandomDate;
    year = date.getFullYear();
    month = date.getMonth() + 1;
    dt = date.getDate();

    if (dt < 10) {
        dt = '0' + dt;
    }
    if (month < 10) {
        month = '0' + month;
    }

    var myNewRandomDateString = year + '-' + month + '-' + dt;

    buildPostResponseDataString("startDate", "NA", myNewRandomDateString);
    // buildPostResponseDataString("startDate", "NA", myNewRandomDateString);

    //remove the final comma, make JSON endpoint call if enabled, then submit csv string to server
    myRowString = removeLastComma(myRowString) + "\n";


    // var includeTicketCreation1 = $("#chkIncludeTickets1").is(':checked');
    // //////// if create tickets1 is checked
    // var includeTicketCreation1 = $("#chkIncludeTickets1").is(':checked');
    // if (includeTicketCreation1 === true) {
    //     var myPercentageOfResponsesToCreateTicketsFor1 = $('#txtTicketPercentage1').val();
    //     myRandomNumber1 = Math.random() * 100;
    //     if (myRandomNumber1 < myPercentageOfResponsesToCreateTicketsFor1) {
    //         createTicket(myStringForTicketPayload, myNewRandomDate, myRandomTextComment, myObjectForTicketPayload);
    //     };
    // };
    // console.log("generateSingleRandomResponse myQandAs = ", myQandAs);
};

function theTextMachine(sentiment) {
    var myRandomComment = "";
    mySentiment = sentiment;
    let myListLength = myCommentPartsLibrary.length;
    var myListOfAvailableCommentParts = [];
    var myListOfAvailableSubCommentParts = [];

    myTextCommentStructure.forEach(function (key, data) {
        var mySentimentGroupLabel = mySentiment + key; // positive or negative + Intro or Segment 1 or....etc
        var myListOfAvailableSubCommentParts = [];
        myListOfAvailableSubCommentParts = myCommentPartsLibrary[mySentimentGroupLabel];
        var myRandomIndex = Math.floor(Math.random() * myListOfAvailableSubCommentParts.length);
        if (myListOfAvailableSubCommentParts[myRandomIndex].myCommentPartContent != "Undefined") {
            // myRandomComment += myListOfAvailableSubCommentParts[myRandomIndex].myCommentPartContent;
            myRandomComment += myListOfAvailableSubCommentParts[myRandomIndex];
            myRandomComment += " "; //adds a space between segments
        };
    });
    // recordSignal("randomCommentGenerated");
    return myRandomComment;
};

function getTextCommentStructureFromGoogleSheets() {
    var myURL = "https://q.datagen.app/getTextCommentStructure";

    var myOutgoingData = new Object();
    // myOutgoingData['surveyID'] = surveyId;
    // myOutgoingData['datacenter'] = datacenter;
    // myOutgoingData['apiToken'] = myAPIToken;
    myOutgoingData['GSheetID'] = GSheetID;
    myOutgoingDataJSON = JSON.stringify(myOutgoingData);
    // console.log("getTextCommentStructureFromGoogleSheets myOutgoingDataJSON = ", myOutgoingDataJSON);
    var myOutgoingOptions = {
        url: myURL,
        method: 'GET',
        body: myOutgoingDataJSON
    };

    request(myOutgoingOptions, (err, response, body) => {
        if (err) {
            console.log("err get /surveys = ", response);
        } else {
            console.log("else get /surveys = ", response);
        }
    });
}

function buildPostResponseDataString(type, questionID, value) {
    let myValue = value;
    switch (type) {
        case "mcsaQuestion":
            myRandomValue = parseInt(myValue);
            myPostResponseAnswersToSubSubmitObjectPRE[questionID] = myRandomValue;
            myRowString += myRandomValue + ",";
            break;
        case "mcmaQuestion":
            myRandomValue = myValue;
            myPostResponseAnswersToSubSubmitObjectPRE[questionID] = myRandomValue;
            myRowString += myRandomValue & ",";
            break;
        case "textInputQuestion":
            myRandomValue = myValue;
            myTextQuestionID = questionID + "_TEXT";
            myPostResponseAnswersToSubSubmitObjectPRE[myTextQuestionID] = " ''' " + myRandomValue + " ''' ";
            myRandomValue = myRandomValue.replace(/[,&#+()$%*?<>]/g, '');
            myRowString += myRandomValue + ",";
            break;
        case "startDate":
            myRandomValue = myValue;
            myPostResponseAnswersToSubSubmitObjectPRE['startDate'] = myRandomValue;
            myPostResponseAnswersToSubSubmitObjectPRE['endDate'] = myRandomValue;
            myRowString += myRandomValue + ",";
            break;
    }
}

function writeCSVStringHeaders(includeTextResponses) {
    myRowString = "";
    // $.each(myMCQuestionIndex, function (k, v) {
    Object.keys(myQandAs).forEach(function (k, v) {
        // console.log("k = ", k);
        // console.log("v = ", v);

        var myQuestionText = mySurveyDetails.Questions[k]['DataExportTag'];
        myRowString += replaceNbsps(myQuestionText) + ",";
    });

    if (includeTextResponses === false) {

     }
    else {
        if (Object.keys(myListofTextQuestions).length > 0) {
            myListofTextQuestions.forEach(function (a, b) {
                var myQuestionText = mySurveyDetails.Questions[a]['DataExportTag'];
                myQuestionText = myQuestionText.replace(",", " ");
                myQuestionText = myQuestionText.replace(/[,&#+()$%*?<>]/g, '');
                myRowString += replaceNbsps(myQuestionText) + ",";
            });
        };
    };
    myRowString += "StartDate \n";
    // myRowString = removeLastComma(myRowString) + "\n";

    // $.each(myMCQuestionIndex, function (k, v) {
    Object.keys(myQandAs).forEach(function (k, v) {
        var myQuestionText = mySurveyDetails.Questions[k]['QuestionDescription'];
        myQuestionText = replaceNbsps(myQuestionText);
        myQuestionText = myQuestionText.replace(",", " ");
        myQuestionText = myQuestionText.replace(/[,&#+()$%*?<>]/g, '');
        myQuestionText = myQuestionText;
        myRowString += myQuestionText + ",";
    });

    // var includeTextCommentsInResponses = $("#chkIncludeTextResponses").is(':checked');
    if (includeTextResponses === false) {

    }
    else {
        if (Object.keys(myListofTextQuestions).length > 0) {
            myListofTextQuestions.forEach(function (t, r) {
                var myQuestionText = mySurveyDetails.Questions[t]['QuestionDescription'];
                myQuestionText = replaceNbsps(myQuestionText);
                myQuestionText = myQuestionText.replace(",", " ");
                myQuestionText = myQuestionText.replace(/[,&#+()$%*?<>]/g, '');
                myQuestionText = myQuestionText;
                myRowString += myQuestionText + ",";
            });
        };
    };
    myRowString += "StartDate \n";
    // myRowString = removeLastComma(myRowString) + "\n";

    // $.each(myMCQuestionIndex, function (k, v) {
    Object.keys(myQandAs).forEach(function (k, v) {
        var myQuestionID = mySurveyDetails.Questions[k]['QuestionID'];
        var myString3 = '\"{\"\"ImportId\"\":\""{}\"\"}\"'.format(myQuestionID);
        myRowString += myString3 + ",";
        // myRowString += myString3;
    });

    // myRowString = removeLastComma(myRowString) +"\n";
    if (includeTextResponses === false) {
    }
    else {
        if (Object.keys(myListofTextQuestions).length > 0) {
            myListofTextQuestions.forEach(function (t, r) {
                var myQuestionID = mySurveyDetails.Questions[t]['QuestionID'] + "_TEXT";;
                var myString3 = '\"{\"\"ImportId\"\":\""{}\"\"}\"'.format(myQuestionID);
                myRowString += myString3 + ",";
            });
        };
    };
    myRowString += '\"{ \"\"ImportId\"\": \"\"startDate\"\", \"\"timeZone\"\": \"\"America/Denver\"\"}\"\n'
}

function normalizeTextCommentScore(rawScore, mySelectedTextTargetQID) {
    // var mySelectedTextTargetQID = $('#selectTextCommentTargetQuestion').val();
    
    var myOriginalQuestionIndex = myQandAs[mySelectedTextTargetQID];
    // console.log("***myOriginalQuestionIndex = ", myOriginalQuestionIndex);
    // console.log("***rawScore = ", rawScore);
    // var myTotalNumberOfAnswegenerateResponses GSheetIDrChoices = Object.keys(mySurveyDetails.Questions[myOriginalQuestionIndex]['Choices']).length;

    var myTotalNumberOfAnswerChoices = myOriginalQuestionIndex.length;
    var mySentimentGroup;
    var myNormalizedSentimentScore = 10 * (rawScore / myTotalNumberOfAnswerChoices);
    myNormalizedSentimentScore = Math.round(myNormalizedSentimentScore);


    // console.log("normalizeTextCommentScore myNormalizedSentimentScore = ", myNormalizedSentimentScore);
    // console.log("normalizeTextCommentScore myPositiveThreshold = ", myPositiveThreshold);
    // console.log("normalizeTextCommentScore myNegativeThreshold = ", myNegativeThreshold);
    if (parseInt(myNormalizedSentimentScore) >= parseInt(myPositiveThreshold)) {
        mySentimentGroup = "positive";
    } else if (myNormalizedSentimentScore <= myNegativeThreshold) {
        mySentimentGroup = "negative";
    } else {
        mySentimentGroup = "neutral";
    }

    // console.log("normalizeTextCommentScore rawScore = " + rawScore);
    // console.log("normalizeTextCommentScore myOriginalQuestionIndex = " + myOriginalQuestionIndex);
    // console.log("normalizeTextCommentScore myTotalNumberOfAnswerChoices = " + myTotalNumberOfAnswerChoices);
    // console.log("normalizeTextCommentScore mySentimentGroup = " + mySentimentGroup);
    // console.log("normalizeTextCommentScore myNormalizedSentimentScore = " + myNormalizedSentimentScore);

    return mySentimentGroup;
}

function removeLastComma(strng) {
    var n = strng.lastIndexOf(",");
    var a = strng.substring(0, n)
    return a;
}

function replaceNbsps(str) {
    var re = new RegExp(String.fromCharCode(160), "g");
    return str.replace(re, " ");
}

function randomDate(start, end) {
    var _myStartDate = start;
    var _myEndDate = end;
    var startHour = 0;
    var endHour = 23;
    var myRandom1 = Math.random();
    var myRandom2 = Math.random();
    var date = new Date(+ _myStartDate + myRandom1 * (_myEndDate - _myStartDate));
    var hour = startHour + myRandom2 * (endHour - startHour) | 0;
    date.setHours(hour);
    var myNewDate = new Date(start.getTime() + Math.random() * (_myEndDate.getTime() - _myStartDate.getTime()));
    return myNewDate;
}

function getRandomNumber(min, max) {
    var myRandomNumber = Math.random() * (max - min) + min;
    return Math.round(myRandomNumber);
}

function loadStringReplacementFunction() {
    // String replacement function for building URLs to post survey response to//
    String.prototype.format = function () {
        var i = 0,
            args = arguments;
        return this.replace(/{}/g, function () {
            return typeof args[i] != 'undefined' ? args[i++] : '';
        });
    };
}

function isValidDate(d) {
    return d instanceof Date && !isNaN(d);
}