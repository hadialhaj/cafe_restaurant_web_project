<?php
session_start();
require_once __DIR__ . '/config.php';

$conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
$conn->set_charset("utf8mb4");
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

$lemail = trim($_POST['lemail'] ?? '');
$lpassword = trim($_POST['lpassword'] ?? '');


$sql = "SELECT email, password FROM users WHERE email = ?";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "s", $lemail);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

if($result && mysqli_num_rows($result) === 1) {
    $row = mysqli_fetch_assoc($result);
    if (password_verify($lpassword, $row['password'])) {
        $_SESSION['user_email'] = $row['email'];
        echo '<script>window.location.href = "../frontend/home.html";</script>';
        exit;
    } else {
        echo '<script>alert("Incorrect password");window.location.href = "../frontend/login.html";</script>';
        exit;
    }
} else {
    echo '<script>alert("Email not found");window.location.href = "../frontend/login.html";</script>';
    exit;
}
   


echo '<script>window.location.href = "../frontend/login.html";</script>';
exit;

mysqli_close($conn);
?>