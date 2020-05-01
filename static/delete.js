jQuery('#btnLoadInfoFromLocalStorage').click(function () {
    loadUserData();
});

jQuery('#btnSaveInfoToLocalStorage').click(function () {
    saveUserData();
});



// var element = $("#html-content-holder");
// var getCanvas;

jQuery('#btnPrintTraveler').unbind('click').bind('click', function (e) {
    console.log("btnPrintTraveler");

//this.element.get(0)
// var convertMeToImg = $('#divTravelerPrintArea')[0];
// var element = $("#html-content-holder");
//  html2canvas(element, {
//                     onrendered: function(canvas) {
//                         $("#previewImage").append(canvas);
//                         getCanvas = canvas;
//                     }
//                 });

//   html2canvas(document.getElementById("divTravelerPrintArea"), {
//              onrendered: function (canvas) {
//                     $("#divTravelerPrintImage").append(canvas);
//                     getCanvas = canvas;
//                  }
//       });


    html2canvas(document.getElementById("divTravelerPrintArea")).then(function (canvas) {
        var canvasData = canvas.toDataURL("image/png");





// var pdf = new jsPDF('p', 'pt', 'letter');
// 		pdf.html(document.body, {
// 			callback: function (pdf) {
// 				var iframe = document.createElement('iframe');
// 				iframe.setAttribute('style', 'position:absolute;right:0; top:0; bottom:0; height:100%; width:500px');
// 				document.body.appendChild(iframe);
// 				iframe.src = pdf.output(canvasData);
// 			}
// 		});






        popup = window.open();
        popup.document.write('<img src="' + canvasData + '">');
        setTimeout(function () {
            // popup.focus(); //required for IE
            popup.print();
        }, 2000);
    });
    // return;
});

var printTraveler = function () {
    console.log("function printTraveler");
    var myNumberTestKitSlotsPerTraveler = 48;
    var myMaxNumberTestKitsPerBatch = 46;
    var myNumberControlSpots = 2;
    var myTotalNumberTestKitSpots = myMaxNumberTestKitsPerBatch + myNumberControlSpots;
    var myNumberOfTravelerTableColumns = 6;
    var myNumberOfTravelerTableRows = 8;
    var myAllChoicesTextEntry = jQuery('#divAllChoicesTextEntry').text();
    var myTestKitIDArray = myAllChoicesTextEntry.split(',');
    var myCounter = 1;
    var myTableBody = '<table id="tblTraveler">';

var myAlphaList = ["A", "B", "C", "D", "E", "F", "G", "H" ];



for (var t = 0; t < myNumberOfTravelerTableRows; t++) {
    myTableBody += '<tr>';
    for (var a = 0; a < myNumberOfTravelerTableColumns; a++){
        var myCellNumber = a *  myNumberOfTravelerTableRows + 1 + (1 * t);
        var myAlphaCharacter = myAlphaList[t];
        var myColumnNumber = parseInt(a + 1);
        console.log(myAlphaCharacter +  myColumnNumber  + " [[]] " + myCellNumber);

////////////////////////
            myTableBody += '<td>';
            var myQRString;
            if (myCounter < 3) {
                myQRString = '<div class="testKitContainer"><div class="testKitNumber">' + myCounter + '&nbsp;</div><div class="testKitQRCodeTextOnly">NO QR CODE&nbsp;</div><div class="testKitLabel">TEST ' + myCounter + '</div></div>';

            }
            else {
                var myTestKitIDLength = myTestKitIDArray[myCounter - 3].length;
                        if (myTestKitIDLength >0){
                            // console.log("myTestKitIDLength = ", myTestKitIDLength);

                        myQRString = '<div class="testKitContainer"><div class="testKitAlphaNumber">' +  myAlphaCharacter +  myColumnNumber  + '</div><div class="testKitQRCode" id="' + myTestKitIDArray[myCounter - 3] + '"></div><div class="testKitNumber">' + myCellNumber  + '</div><br/><div class="testKitLabel">' + myTestKitIDArray[myCounter - 3] + '</div></div>';
                        }
                        else{
                            myQRString = '<div class="testKitContainer"><div class="testKitNumber">B' + myCounter + '</div><div class="testKitQRCode"></div><div class="testKitLabel">' + myTestKitIDArray[myCounter - 3] + '</div></div>';
                        };
            };
            myTableBody += myQRString;
            myTableBody += '</td>';
            myCounter++;
        }

 myTableBody += '</tr>';

////////////////////////

    }




    // for (var i = 0; i < myNumberOfTravelerTableColumns; i++) {
    //     myTableBody += '<tr>';
    //     for (var j = 0; j < myNumberOfTravelerTableColumns; j++) {
    //         myTableBody += '<td>';
    //         var myQRString;
    //         if (myCounter < 3) {
    //             myQRString = '<div class="testKitContainer"><div class="testKitNumber">' + myCounter + '&nbsp;</div><div class="testKitQRCodeTextOnly">NO QR CODE&nbsp;</div><div class="testKitLabel">TEST ' + myCounter + '</div></div>';

    //         }
    //         else {
    //             var myTestKitIDLength = myTestKitIDArray[myCounter - 3].length;
    //                     if (myTestKitIDLength >0){
    //                         console.log("myTestKitIDLength = ", myTestKitIDLength);

    //                     myQRString = '<div class="testKitContainer"><div class="testKitAlphaNumber">A' + myCounter + '</div><div class="testKitQRCode" id="' + myTestKitIDArray[myCounter - 3] + '"></div><div class="testKitNumber">' + myCounter + '</div><br/><div class="testKitLabel">' + myTestKitIDArray[myCounter - 3] + '</div></div>';
    //                     }
    //                     else{
    //                         myQRString = '<div class="testKitContainer"><div class="testKitNumber">B' + myCounter + '</div><div class="testKitQRCode"></div><div class="testKitLabel">' + myTestKitIDArray[myCounter - 3] + '</div></div>';
    //                     };
    //         };
    //         myTableBody += myQRString;
    //         myTableBody += '</td>';
    //         myCounter++;
    //     }
    //     myTableBody += '</tr>';
    // }
    myTableBody += '</table>';
    jQuery('#divTravelerPrintArea').append(myTableBody);
    jQuery.each(myTestKitIDArray, function (key, value) {
        var myIndex = key;
        var myTestKitID = value;
        var qrcode = new QRCode(document.getElementById(myTestKitIDArray[key]), {
            text: myTestKitIDArray[key],
            width: 50,
            height: 50,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    });

    //flip the table
    // jQuery("#tblTraveler").each(function () {
    //     var $this = jQuery(this);
    //     var newrows = [];
    //     $this.find("tr").each(function () {
    //         var i = 0;
    //         jQuery(this).find("td,th").each(function () {
    //             i++;
    //             if (newrows[i] === undefined) {
    //                 newrows[i] = jQuery("<tr></tr>");
    //             }
    //             newrows[i].append(jQuery(this));
    //         });
    //     });
    //     $this.find("tr").remove();
    //     jQuery.each(newrows, function () {
    //         $this.append(this);
    //     });
    // });
}

var loadUserData = function () {
    var QID = "QID37";
    var myLabID = window.localStorage.getItem("labID");
    var myNurseID = window.localStorage.getItem("nurseID");
    jQuery('.QR-QID37-1').val(myLabID);
    jQuery('.QR-QID37-2').val(myNurseID);
    jQuery('.QR-QID16-1').val(myLabID);
    jQuery('.QR-QID16-2').val(myNurseID);
}

var saveUserData = function () {
    var myLabID = jQuery('.QR-QID37-1').val();
    var myNurseID = jQuery('.QR-QID37-2').val();
    window.localStorage.setItem("labID", myLabID);
    window.localStorage.setItem("nurseID", myNurseID);
}

jQuery('#QID39 input').each(function () {
    var textboxes = jQuery('#QID39 input');
    this.addEventListener("keyup", function (e) {
         var testKitId = this.value;
            var testKitIDOK = validateTestKitId(testKitId);
            console.log("testKitIDOK = ", testKitIDOK);
		    //isTestKitIdValid = testKitId &&
 currentBoxNumber = textboxes.index(this);
            if (textboxes[currentBoxNumber + 1] != null && testKitIDOK) {
                nextBox = textboxes[currentBoxNumber + 1];
                nextBox.focus();
                //nextBox.select();
            }
            event.preventDefault();
            return false;

        var myLength = e.target.value.length
        if (myLength > 6) {
            // do something if seven or more characters in textbox
        };

        if (e.keyCode === 13) {  //checks whether the pressed key is "Enter"
            currentBoxNumber = textboxes.index(this);
            if (textboxes[currentBoxNumber + 1] != null) {
                nextBox = textboxes[currentBoxNumber + 1];
                console.log("nextBox = ", nextBox);
                nextBox.focus();
                //nextBox.select();
            }
            event.preventDefault();
            return false;
        }
    })
});

    function validateTestKitId(input) {
         nonWhiteSpaceId = input.trim();
        console.log("nonWhiteSpaceId = ", nonWhiteSpaceId);
        testKitIdValidCharacters = 'A1B2C3D4E5F6G7H8J9KLMNPQRSTUVWXYZ';
        var testKitIdcharacterToCodeMap = new Map([['A', 0], ['1', 1], ['B', 2], ['2', 3],
            ['C', 4], ['3', 5], ['D', 6], ['4', 7], ['E', 8], ['5', 9], ['F', 10],
            ['6', 11], ['G', 12], ['7', 13], ['H', 14], ['8', 15], ['J', 16],
            ['9', 17], ['K', 18], ['L', 19], ['M', 20], ['N', 21], ['P', 22],
            ['Q', 23], ['R', 24], ['S', 25], ['T', 26], ['U', 27], ['V', 28],
            ['W', 29], ['X', 30], ['Y', 31], ['Z', 32]]);

		if (nonWhiteSpaceId == "TEST123") {
			return true;
		}
        if (nonWhiteSpaceId.length < 6 || nonWhiteSpaceId.length > 7) {
            return false;
        }
        switch (nonWhiteSpaceId.length) {
            case 6:
                // console.log("case 6");
                return nonWhiteSpaceId.substring(0,4) == "A1A1" &&
                    testKitIdValidCharacters.includes(nonWhiteSpaceId.charAt(4)) &&
                    testKitIdValidCharacters.includes(nonWhiteSpaceId.charAt(5));
                    break;
            case 7:
                // console.log("case 7");
                var factor = 1;
                var sum = 0;
                var n = testKitIdValidCharacters.length;
                // All numbers and capital letters (0-9, A-Z)
                // Starting from the right, work leftwards
                // Now, the initial "factor" will always be "1"
                // since the last character is the check character.
                for (i = input.length - 1; i >= 0; i--) {
                    // console.log("input.charAt(i) = ", input.charAt(i));
                    var cp = testKitIdcharacterToCodeMap.get(input.charAt(i));
                    // console.log("i = ", i);
                    // console.log("cp = ", cp);
                    var addend = factor * cp;
                    //  console.log("addend = ", addend);
                    // Alternate the "factor" that each "codePoint" is multiplied by
                    factor = factor == 2 ? 1 : 2;
                    // Sum the digits of the "addend" as expressed in base "n"
                    addend = Math.floor(addend / n) + (addend % n);
                    sum += addend;
                }
                var remainder = sum % n;
                // console.log("remainder = ", remainder);
                //return remainder == 0;
                return remainder;
                break;
        }
    }


function onTestKitIDReady(){
    this.disableNextButton();
	var QID = this.questionId;
	var testKitIdInputBox = document.getElementById("QR~" + QID + "~1");
	var isTestKitIdValid = false;
    var that = this;
	jQuery(
		"<span style='padding-left:5px;' id='testKitIdValidationIcon'></span>"
	).insertAfter(testKitIdInputBox);

	testKitIdInputBox.on("change", function() {
		var testKitId = this.value;
		isTestKitIdValid = testKitId && validateTestKitId(testKitId);

		if (testKitId && isTestKitIdValid) {
			jQuery("#testKitIdValidationIcon").html("&#9989;");
            that.enableNextButton();
        } else {
            jQuery("#testKitIdValidationIcon").html("&#10060;");
            that.disableNextButton();
		}
	});
}

// jQuery('#QID38 input').each(function () {
//     // this.addEventListener("keyup", function (e) {
//     //     var myLength = e.target.value.length;
//     //     if (myLength > 6) {
//     //         //jQuery('#QID39 input').first().focus();
//     //     };
//     //     event.preventDefault();
//     //     return false;
//     // });
// });
