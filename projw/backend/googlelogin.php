<?php
session_start();

$db_host = 'localhost';
$db_user = 'root';
$db_pass = '';
$db_name = 'shopdb';

$google_client_id = '919553337092-6ln4pa52t229f09nn8d0224g6l4fbbjb.apps.googleusercontent.com';

// Connect to database
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
if ($conn->connect_error) {
    die("Database connection failed. Check your credentials.");
}

error_log("POST data: " . print_r($_POST, true));

$action = '';
if (isset($_POST['action'])) {
    $action = $_POST['action'];
} elseif (isset($_POST['credential'])) {
    $action = 'google';
}

error_log("Action detected: " . $action);

switch ($action) {
    
    case 'register':
        $name = trim($_POST['name'] ?? '');
        $email = trim($_POST['email'] ?? '');
        $password = $_POST['password'] ?? '';
        
        if (empty($name) || empty($email) || empty($password)) {
            die("Error: All fields are required.");
        }
        
        $check = $conn->prepare("SELECT id FROM userz WHERE email = ?");
        $check->bind_param("s", $email);
        $check->execute();
        
        if ($check->get_result()->num_rows > 0) {
            die("Error: Email already registered. Try logging in.");
        }
        
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $conn->prepare("INSERT INTO userz (name, email, password) VALUES (?, ?, ?)");
        $stmt->bind_param("sss", $name, $email, $hashed_password);
        
        if ($stmt->execute()) {
            $_SESSION['user_id'] = $stmt->insert_id;
            $_SESSION['user_name'] = $name;
            $_SESSION['user_email'] = $email;
            header("Location: ../frontend/home.html");
            exit;
        } else {
            die("Registration failed: " . $conn->error);
        }
        break;
        
    case 'login':
        $email = trim($_POST['email'] ?? '');
        $password = $_POST['password'] ?? '';
        
        $stmt = $conn->prepare("SELECT id, name, email, password FROM userz WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            die("Error: User not found. Please register first.");
        }
        
        $user = $result->fetch_assoc();
        
        if (password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_name'] = $user['name'];
            $_SESSION['user_email'] = $user['email'];
            header("Location: ../frontend/home.html");
            exit;
        } else {
            die("Error: Wrong password.");
        }
        break;
        
    case 'google':
        $token = $_POST['credential'] ?? '';
        
        if (empty($token)) {
            die("Error: No Google token received.");
        }
        
        $url = "https://oauth2.googleapis.com/tokeninfo?id_token=" . urlencode($token);
        
        $options = [
            'http' => [
                'method' => 'GET',
                'timeout' => 10
            ],
            'ssl' => ['verify_peer' => false]
        ];
        
        $context = stream_context_create($options);
        $response = @file_get_contents($url, false, $context);
        
        if (!$response) {
            if (function_exists('curl_init')) {
                $ch = curl_init();
                curl_setopt($ch, CURLOPT_URL, $url);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_TIMEOUT, 10);
                curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
                $response = curl_exec($ch);
                curl_close($ch);
            }
        }
        
        if (!$response) {
            die("Error: Cannot verify Google token. Check internet connection.");
        }
        
        $google_user = json_decode($response, true);
        
        if (!$google_user || !isset($google_user['aud']) || $google_user['aud'] !== $google_client_id) {
            die("Error: Invalid Google token.");
        }
        
        $email = $google_user['email'];
        $name = $google_user['name'] ?? $email;
        $google_id = $google_user['sub'] ?? '';
        
        $stmt = $conn->prepare("SELECT id, name FROM userz WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $user = $result->fetch_assoc();
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_name'] = $user['name'];
            $_SESSION['user_email'] = $email;
        } else {
            $stmt = $conn->prepare("INSERT INTO userz (name, email, google_id) VALUES (?, ?, ?)");
            $stmt->bind_param("sss", $name, $email, $google_id);
            
            if ($stmt->execute()) {
                $_SESSION['user_id'] = $stmt->insert_id;
                $_SESSION['user_name'] = $name;
                $_SESSION['user_email'] = $email;
            } else {
                die("Error: Cannot create user. " . $conn->error);
            }
        }
        
        header("Location: ../frontend/home.html");
        exit;
        break;
        
    default:
        echo "Error: No action specified or invalid action.<br>";
        echo "Received POST data: <pre>" . print_r($_POST, true) . "</pre>";
        echo '<a href="../frontend/login.html">Go back to login</a>';
        exit;
}

$conn->close();
?>