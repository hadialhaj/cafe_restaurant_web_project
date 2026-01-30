<?php
require_once __DIR__ . '/config.php';

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
$conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
$conn->set_charset("utf8mb4");

$fname = trim($_POST['fullname'] ?? '');
$email = strtolower(trim($_POST['email'] ?? ''));
$password = trim($_POST['password'] ?? '');
$confirm = trim($_POST['confirmPassword'] ?? '');
$phone = trim($_POST['phone'] ?? '');

if (!$fname  || !$email || !$password || !$confirm || !$phone) {
    exit('<script>alert("All fields required");location.href="../frontend/register.html";</script>');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    exit('<script>alert("Invalid email");location.href="../frontend/register.html";</script>');
}

if ($password !== $confirm) {
    exit('<script>alert("Passwords do not match");location.href="../frontend/register.html";</script>');
}

$hashed = password_hash($password, PASSWORD_DEFAULT);

$stmt = $conn->prepare("SELECT * FROM users WHERE LOWER(email) = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    exit('<script>alert("Email already exists");location.href="../frontend/login.html";</script>');
}
$stmt->close();

$stmt = $conn->prepare(
    "INSERT INTO users (fname,  email, password, phone)
     VALUES (?,  ?, ?, ?)"
);
$stmt->bind_param("ssss", $fname,  $email, $hashed, $phone);
$stmt->execute();

header("Location: ../frontend/login.html");
exit;
?>