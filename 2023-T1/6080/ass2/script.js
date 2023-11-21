let simpleForm = document.forms.inputform;

let street = document.getElementsByName("street");
let suburb = document.getElementsByName("suburb");
let postcode = document.getElementsByName("postcode");
let birthday = document.getElementsByName("birthday");

let buildingType = document.getElementsByName("type")
let features = document.getElementsByName("check");

let selectButton = document.getElementById("select-button")

let reset = document.getElementById("reset");
let output = document.getElementsByTagName("textarea");

// get age by using input date
function getAge(date){
    const current = new Date();
    const birth = new Date(date);
    const currentYear = current.getFullYear();
    const currentMonth = current.getMonth();
    const currentDay = current.getDate();
    const birthYear = birth.getFullYear();
    const birthMonth = birth.getMonth();
    const birthDay = birth.getDate();
    let age = currentYear-birthYear;
    if(age > 0){
        if(currentMonth < birthMonth){
            age--;
        }else if(currentMonth === birthMonth && currentDay < birthDay){
            age--;
        }
    }
    return age;
}

// remove all of text in the textarea 
// and reset all of the form elements to their default state
reset.addEventListener("click", () => {
    location.reload();
});

// checkbox button change(scenario 1)
selectButton.addEventListener('click', () => {
    if (document.getElementById('select-button').value === "Deselect All") {
        for(let i = 0;i < 4;i++){
            document.getElementsByName("check")[i].checked = false;
        }
        document.getElementById('select-button').value = "Select All";
    } else {
        for(let i = 0;i < 4;i++){
            document.getElementsByName("check")[i].checked = true;
        }
        document.getElementById('select-button').value = "Deselect All";
    }
});

// checkbox button change(scenario 2)
let i = 0;
while (i < 4) {
    features[i].addEventListener('click', () => {
        if (document.getElementsByName("check")[0].checked === true &&
            document.getElementsByName("check")[1].checked === true &&
            document.getElementsByName("check")[2].checked === true &&
            document.getElementsByName("check")[3].checked === true) {
                document.getElementById('select-button').value = "Deselect All";
        } else if (document.getElementsByName("check")[0].checked === false ||
            document.getElementsByName("check")[1].checked === false ||
            document.getElementsByName("check")[2].checked === false ||
            document.getElementsByName("check")[3].checked === false) {
                document.getElementById('select-button').value = "Select All";
        }
    });
    i++;
}

// Check validation of each input and give output
function main() {
    const streetText = simpleForm.elements.street.value;
    const suburbText = simpleForm.elements.suburb.value;
    const postcodeText = simpleForm.elements.postcode.value;
    const birthdayText = simpleForm.elements.birthday.value;
    const buildingTypeText = simpleForm.elements.type.value;
    const letters = /^[A-Za-z]+$/;
    const numbers = /^[0-9]+$/;
    const validbirthday = /^[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/;
    birthday_stadand_format = birthdayText.substring(3,6) + birthdayText.substring(0, 3) + birthdayText.substring(6)

    const streetError = "Please input a valid street name";
    const suburbError = "Please input a valid suburb";
    const postcodeError = "Please input a valid postcode";
    const birthdayError = "Please enter a valid date of birth";

    if (streetText === '' || !streetText.match(letters) || streetText.length < 3 || streetText.length > 50) {
        document.getElementById('output').textContent = streetError;
    } else if (suburbText === '' || !suburbText.match(letters) || suburbText.length < 3 || suburbText.length > 50) {
        document.getElementById('output').textContent = suburbError;
    } else if (postcodeText === '' || !postcodeText.match(numbers) || postcodeText.length !== 4) {
        document.getElementById('output').textContent = postcodeError;
    } else if (birthdayText === '' || !birthdayText.match(validbirthday) || isNaN(Date.parse(birthday_stadand_format))) {
        document.getElementById('output').textContent = birthdayError;
    } else {
        age = getAge(birthday_stadand_format);
        let building_type = "";
        if (buildingTypeText === "House") {
            building_type = "a house";
        }else if(buildingTypeText === "Apartment"){
            building_type = "an apartment";
        }
        let i = 0;
        let count = 0;
        let featuresSummary = "";
        for(let i = 0;i < 4;i++){
            if(document.getElementsByName("check")[i].checked === true){
                count++;
            }
        }
        if (count === 0) {
            featuresSummary = "no features."
        } else if (count === 1) {
            for(let i = 0;i < 4;i++){
                if(document.getElementsByName("check")[i].checked === true){
                    featuresSummary = document.getElementsByName("check")[i].value + ".";
                }
            }
        } else {
            let output_count = 0;
            for(i = 0;i < 4;i++){
                if(document.getElementsByName("check")[i].checked === true){
                    featuresSummary += document.getElementsByName("check")[i].value;
                    output_count++;
                    if (output_count <= count - 1) {
                        featuresSummary += ", ";
                    }
                    if (output_count === count - 1) {
                        featuresSummary += "and ";
                    }
                    if (output_count === count) {
                        featuresSummary += ".";
                    }
                }
            } 
        }
        summary = "Your are " + age + " years old, and your address is " + streetText + " St, " + suburbText + ", " + postcodeText +", Australia. Your building is " + building_type + ", and it has " + featuresSummary
        document.getElementById('output').textContent = summary;
    }
}

simpleForm.addEventListener('keyup', main);
simpleForm.addEventListener('change', main);
for(let i = 0; i < 4; i++) {
    features[i].addEventListener('click', main);
}
selectButton.addEventListener('click', main);
