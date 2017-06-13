
function saveCreds() {
  var inputUsername = document.getElementById("username");
  localStorage.setItem("username", inputUsername.value);
  var inputPassword = document.getElementById("password");
  localStorage.setItem("password", inputPassword.value);
}

$(document).ready(function () {
  document.getElementById('username').value = localStorage.getItem("username");
  document.getElementById('password').value = localStorage.getItem("password");
});
