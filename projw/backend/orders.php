<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT');
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
        // Get all orders or filter by status/date
        $status = $_GET['status'] ?? 'all';
        $date = $_GET['date'] ?? '';
        
        $sql = "SELECT o.*, 
                (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
                FROM orders o WHERE 1=1";
        
        $params = [];
        $types = '';
        
        if ($status !== 'all') {
            $sql .= " AND o.status = ?";
            $params[] = $status;
            $types .= 's';
        }
        
        if (!empty($date)) {
            $sql .= " AND DATE(o.order_date) = ?";
            $params[] = $date;
            $types .= 's';
        }
        
        $sql .= " ORDER BY o.order_date DESC";
        
        if (!empty($params)) {
            $stmt = $conn->prepare($sql);
            $stmt->bind_param($types, ...$params);
            $stmt->execute();
            $result = $stmt->get_result();
        } else {
            $result = $conn->query($sql);
        }
        
        $orders = [];
        while ($row = $result->fetch_assoc()) {
            // Get order items
            $order_id = $row['id'];
            $items_sql = "SELECT * FROM order_items WHERE order_id = ?";
            $items_stmt = $conn->prepare($items_sql);
            $items_stmt->bind_param("i", $order_id);
            $items_stmt->execute();
            $items_result = $items_stmt->get_result();
            
            $items = [];
            while ($item = $items_result->fetch_assoc()) {
                $items[] = $item;
            }
            
            $row['items'] = $items;
            $orders[] = $row;
            $items_stmt->close();
        }
        
        echo json_encode(['success' => true, 'data' => $orders]);
        break;
        
    case 'POST':
        // Create new order
        $data = json_decode(file_get_contents('php://input'), true);
        
        $customer_name = $data['customer_name'] ?? '';
        $customer_email = $data['customer_email'] ?? '';
        $customer_phone = $data['customer_phone'] ?? '';
        $total_amount = $data['total_amount'] ?? 0;
        $items = $data['items'] ?? [];
        $notes = $data['notes'] ?? '';
        
        if (empty($customer_name) || $total_amount <= 0 || empty($items)) {
            echo json_encode(['success' => false, 'message' => 'Invalid order data']);
            exit;
        }
        
        // Start transaction
        $conn->begin_transaction();
        
        try {
            // Insert order
            $stmt = $conn->prepare("INSERT INTO orders (customer_name, customer_email, customer_phone, total_amount, notes) VALUES (?, ?, ?, ?, ?)");
            $stmt->bind_param("sssds", $customer_name, $customer_email, $customer_phone, $total_amount, $notes);
            $stmt->execute();
            $order_id = $conn->insert_id;
            $stmt->close();
            
            // Insert order items
            $item_stmt = $conn->prepare("INSERT INTO order_items (order_id, item_name, quantity, price) VALUES (?, ?, ?, ?)");
            
            foreach ($items as $item) {
                $item_name = $item['name'];
                $quantity = $item['quantity'];
                $price = $item['price'];
                $item_stmt->bind_param("isid", $order_id, $item_name, $quantity, $price);
                $item_stmt->execute();
            }
            
            $item_stmt->close();
            
            // Commit transaction
            $conn->commit();
            
            echo json_encode([
                'success' => true,
                'message' => 'Order created successfully',
                'order_id' => $order_id
            ]);
        } catch (Exception $e) {
            $conn->rollback();
            echo json_encode(['success' => false, 'message' => 'Failed to create order: ' . $e->getMessage()]);
        }
        break;
        
    case 'PUT':
        // Update order status
        $data = json_decode(file_get_contents('php://input'), true);
        
        $id = $data['id'] ?? 0;
        $status = $data['status'] ?? '';
        
        if ($id <= 0 || empty($status)) {
            echo json_encode(['success' => false, 'message' => 'Invalid data']);
            exit;
        }
        
        $stmt = $conn->prepare("UPDATE orders SET status = ? WHERE id = ?");
        $stmt->bind_param("si", $status, $id);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Order status updated']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to update order']);
        }
        
        $stmt->close();
        break;
        
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid request method']);
        break;
}

$conn->close();
?>