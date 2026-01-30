document.addEventListener('DOMContentLoaded', function () {

    const form = document.getElementById('signup');

    form.addEventListener('submit', function (event) {
        event.preventDefault(); 

        const fullname = document.getElementById("fullname");
        const email = document.getElementById("email");
        const password = document.getElementById("password");
        const confirmPassword = document.getElementById("confirmPassword");
        const phone = document.getElementById("phone");

        const fullnameerr = document.getElementById("fullnameError");
        const emailError = document.getElementById("emailError");
        const passwordError = document.getElementById("passwordError");
        const confirmPasswordError = document.getElementById("confirmPasswordError");
        const phoneError = document.getElementById("phoneError");

        fullnameerr.textContent = "";
        emailError.textContent = "";
        passwordError.textContent = "";
        confirmPasswordError.textContent = "";
        phoneError.textContent = "";

        let isValid = true;

        if (!fullname.value.trim()) {
            fullnameerr.textContent = "Full name is required";
            isValid = false;
        }

       

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
        } else if (password.value.length < 8) {
            passwordError.textContent = "Password must be at least 8 characters";
            isValid = false;
        } else if (!/[A-Z]/.test(password.value)) {
            passwordError.textContent = "Password must contain an uppercase letter";
            isValid = false;
        } else if (!/\d/.test(password.value)) {
            passwordError.textContent = "Password must contain a number";
            isValid = false;
        } else if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password.value)) {
            passwordError.textContent = "Password must contain a special character";
            isValid = false;
        }

        if (!confirmPassword.value) {
            confirmPasswordError.textContent = "Please confirm your password";
            isValid = false;
        } else if (password.value !== confirmPassword.value) {
            confirmPasswordError.textContent = "Passwords do not match";
            isValid = false;
        }

        if (phone.value.trim()) {
            const phoneRe = /^[0-9+\s()\-]{7,20}$/;
            if (!phoneRe.test(phone.value.trim())) {
                phoneError.textContent = "Enter a valid phone number";
                isValid = false;
            }
        }

        if (isValid) {
            document.getElementById("jsValidated").value = "true"; 
            form.submit();
        }

    });

});