<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

// Create connection
$conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

// Check connection
if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Connection failed: ' . $conn->connect_error]));
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Get all menu items or filter by category
        $category = $_GET['category'] ?? 'all';
        
        if ($category === 'all') {
            $sql = "SELECT * FROM menu_items ORDER BY category, name";
            $result = $conn->query($sql);
        } else {
            $stmt = $conn->prepare("SELECT * FROM menu_items WHERE category = ? ORDER BY name");
            $stmt->bind_param("s", $category);
            $stmt->execute();
            $result = $stmt->get_result();
        }
        
        $items = [];
        while ($row = $result->fetch_assoc()) {
            $items[] = $row;
        }
        
        echo json_encode(['success' => true, 'data' => $items]);
        break;
        
    case 'POST':
        // Add new menu item
        $data = json_decode(file_get_contents('php://input'), true);
        
        $name = $data['name'] ?? '';
        $category = $data['category'] ?? '';
        $price = $data['price'] ?? 0;
        $description = $data['description'] ?? '';
        $status = $data['status'] ?? 'active';
        
        if (empty($name) || empty($category) || $price <= 0) {
            echo json_encode(['success' => false, 'message' => 'Invalid data']);
            exit;
        }
        
        $stmt = $conn->prepare("INSERT INTO menu_items (name, category, price, description, status) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("ssdss", $name, $category, $price, $description, $status);
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Item added successfully',
                'id' => $conn->insert_id
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to add item']);
        }
        
        $stmt->close();
        break;
        
    case 'PUT':
        // Update menu item
        $data = json_decode(file_get_contents('php://input'), true);
        
        $id = $data['id'] ?? 0;
        $name = $data['name'] ?? '';
        $category = $data['category'] ?? '';
        $price = $data['price'] ?? 0;
        $description = $data['description'] ?? '';
        $status = $data['status'] ?? 'active';
        
        if ($id <= 0 || empty($name) || empty($category) || $price <= 0) {
            echo json_encode(['success' => false, 'message' => 'Invalid data']);
            exit;
        }
        
        $stmt = $conn->prepare("UPDATE menu_items SET name = ?, category = ?, price = ?, description = ?, status = ? WHERE id = ?");
        $stmt->bind_param("ssdssi", $name, $category, $price, $description, $status, $id);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Item updated successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to update item']);
        }
        
        $stmt->close();
        break;
        
    case 'DELETE':
        // Delete menu item
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? 0;
        
        if ($id <= 0) {
            echo json_encode(['success' => false, 'message' => 'Invalid ID']);
            exit;
        }
        
        $stmt = $conn->prepare("DELETE FROM menu_items WHERE id = ?");
        $stmt->bind_param("i", $id);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Item deleted successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to delete item']);
        }
        
        $stmt->close();
        break;
        
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid request method']);
        break;
}

$conn->close();
?>