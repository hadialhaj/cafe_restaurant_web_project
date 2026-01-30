<?php
require_once __DIR__ . '/config.php';

$conn = mysqli_connect(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
if (!$conn) { 
    die("Connection failed: " . mysqli_connect_error()); 
}

$logined = $_POST['logined'] ?? '';



$fname = $_POST['cfirstName'] ?? '';
$lname = $_POST['clastName'] ?? '';
$email = $_POST['cemail'] ?? '';
$address = $_POST['caddress'] ?? '';
$phone = $_POST['cphone'] ?? '';
$cardNumber = $_POST['cardNumber'] ?? '';
$cardName = $_POST['cardName'] ?? '';
$expDate = $_POST['expiry'] ?? '';
$cvv = $_POST['cvv'] ?? '';
$cartItems = $_POST['cart-items'] ?? '';

if (empty($fname) || empty($lname) || empty($email) || empty($address) || 
    empty($phone) || empty($cardNumber) || empty($cardName) || 
    empty($expDate) || empty($cvv)) {
    die("Please fill all fields");
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    die("Invalid email format");
}

$sql = "INSERT INTO orders (firstName, lastName, email, address, phone, cardName, cardNumber, cvv, expiry, cart_items) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

$stmt = mysqli_prepare($conn, $sql);
if (!$stmt) {
    die("Prepare failed: " . mysqli_error($conn));
}

mysqli_stmt_bind_param(
    $stmt, 
    "ssssssssss", 
    $fname, $lname, $email, $address, $phone, 
    $cardName, $cardNumber, $cvv, $expDate, $cartItems
);

if (mysqli_stmt_execute($stmt)&&$logined==='true') {
    
  echo '
    <script>
       
        localStorage.removeItem("cafeCristalCart");
        
     
        
        alert("Order placed successfully! Redirecting to home...");
        window.location.href = "../frontend/home.html";
    </script>
    ';
    exit();
} else {
    echo "Error: " . mysqli_stmt_error($stmt);

}

mysqli_stmt_close($stmt);
mysqli_close($conn);
?>