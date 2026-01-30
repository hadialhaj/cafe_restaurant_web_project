
function validationl() {
    const email = document.getElementById("lemail");
    const password = document.getElementById("lpassword");
    const emailError = document.getElementById("lemailError");
    const passwordError = document.getElementById("lpasswordError");

    emailError.textContent = "";
    passwordError.textContent = "";

    let isValid = true;

    if (!email.value.trim()) {
        emailError.textContent = "Email is required";
        isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        emailError.textContent = "Email is invalid";
        isValid = false;
    }

    if (!password.value) {
        passwordError.textContent = "Password is required";
        isValid = false;
    }

    return isValid;
}

function logout(){
    window.location.href = "../backend/logout.php";
}