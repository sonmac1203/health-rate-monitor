//Initialize flags for validation
let passwordValid = false;
let pLength = false;
let pLower = false;
let pUpper = false;
let pDigit = false;

//added to singup.html : <div id = "passwordError" ><ul> </ul></div>

let ulNode = $('ul');
let errorElement = $('#passwordError');
let password = $('#passwordEntry').val();
password.trim();

const lower = /[a-z]/;
const upper = /[A-Z]/;
const digit = /[0-9]/;

//Jquery Event Listeners:
//$('#passwordEntry').on('change', checkPassword);


password.addEventListener("focus", checkPassword);
password.addEventListener("input", checkPassword);
password.addEventListener("blur", removeError);


//Verify password as user enters it. ("focus"/"input")
function checkPassword() {
  const lower = /[a-z]/;
  const upper = /[A-Z]/;
  const digit = /[0-9]/;

  ulNode.innerHTML = '';
  errorElement.style.setProperty("display", "block");
  ulNode.style.setProperty("text-align", "left");
  ulNode.style.setProperty("font-size", "2vh");
  ulNode.style.setProperty("color", "red");

  password.style.border="2px solid red";
  
  let listNode1= document.createElement('li');
  let listNode2= document.createElement('li');
  let listNode3= document.createElement('li');
  let listNode4= document.createElement('li');
  
  let textNode1 = document.createTextNode("Password must be between 10 and 20 characters.");
  let textNode2 = document.createTextNode("Password must contain at least one lowercase character.");
  let textNode3 = document.createTextNode("Password must contain at least one uppercase character.");
  let textNode4 = document.createTextNode("Password must contain at least one digit.");
  
  listNode1.appendChild(textNode1);
  listNode2.appendChild(textNode2);
  listNode3.appendChild(textNode3);
  listNode4.appendChild(textNode4);
  
  ulNode.appendChild(listNode1); 
  ulNode.appendChild(listNode2); 
  ulNode.appendChild(listNode3); 
  ulNode.appendChild(listNode4); 
  
  let pass = password.value;
  pass = pass.trim();
  
  if ((password.value.length > 10) && (password.value.length < 20)) {
      pLength = true;
      ulNode.removeChild(listNode1); 
  }

  if (lower.test(password.value)) {
      pLower = true;
      ulNode.removeChild(listNode2); 
  }

  if (upper.test(password.value)) {
      pUpper = true;
      ulNode.removeChild(listNode3); 
  }

  if (digit.test(password.value)) {
      pDigit = true;
      ulNode.removeChild(listNode4); 
  }

  //changes border color from red to black when all flags are true.
  if((pLength)&&(pLower)&&(pUpper)&&(pDigit)) {
    passwordValid = true;
    password.style.border = "2px solid #aaa";
  }
  
}

//Removes error messages when out of focus ("blur")
function removeError() {
    errorElement.style.setProperty("display", "none");
  }