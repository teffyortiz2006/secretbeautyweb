<?php
// Incluir archivo de conexión a la base de datos
require_once 'db_connection.php';

// Configurar cabeceras para respuesta JSON
header('Content-Type: application/json');

// Verificar si se recibieron los datos del pedido
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Obtener datos del pedido
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    // Verificar si los datos son válidos
    if (!$data || !isset($data['customer']) || !isset($data['shipping']) || !isset($data['payment']) || !isset($data['items'])) {
        echo json_encode(['success' => false, 'message' => 'Datos del pedido no válidos']);
        exit;
    }
    
    try {
        // Iniciar transacción
        $pdo->beginTransaction();
        
        // Insertar datos del cliente
        $stmt = $pdo->prepare("INSERT INTO customers (name, email, phone) VALUES (:name, :email, :phone)");
        $stmt->bindParam(':name', $data['customer']['name']);
        $stmt->bindParam(':email', $data['customer']['email']);
        $stmt->bindParam(':phone', $data['customer']['phone']);
        $stmt->execute();
        
        // Obtener ID del cliente insertado
        $customerId = $pdo->lastInsertId();
        
        // Insertar datos de envío
        $stmt = $pdo->prepare("INSERT INTO shipping_addresses (customer_id, address, city, postal_code) VALUES (:customer_id, :address, :city, :postal_code)");
        $stmt->bindParam(':customer_id', $customerId);
        $stmt->bindParam(':address', $data['shipping']['address']);
        $stmt->bindParam(':city', $data['shipping']['city']);
        $stmt->bindParam(':postal_code', $data['shipping']['postalCode']);
        $stmt->execute();
        
        // Obtener ID de la dirección de envío insertada
        $shippingId = $pdo->lastInsertId();
        
        // Generar número de pedido
        $orderNumber = 'ORD-' . time();
        
        // Insertar pedido
        $stmt = $pdo->prepare("INSERT INTO orders (order_number, customer_id, shipping_id, total, status, created_at) VALUES (:order_number, :customer_id, :shipping_id, :total, 'pending', NOW())");
        $stmt->bindParam(':order_number', $orderNumber);
        $stmt->bindParam(':customer_id', $customerId);
        $stmt->bindParam(':shipping_id', $shippingId);
        $stmt->bindParam(':total', $data['total']);
        $stmt->execute();
        
        // Obtener ID del pedido insertado
        $orderId = $pdo->lastInsertId();
        
        // Insertar items del pedido
        foreach ($data['items'] as $item) {
            $stmt = $pdo->prepare("INSERT INTO order_items (order_id, product_id, product_name, quantity, price, subtotal) VALUES (:order_id, :product_id, :product_name, :quantity, :price, :subtotal)");
            $stmt->bindParam(':order_id', $orderId);
            $stmt->bindParam(':product_id', $item['id']);
            $stmt->bindParam(':product_name', $item['name']);
            $stmt->bindParam(':quantity', $item['quantity']);
            $stmt->bindParam(':price', $item['price']);
            $subtotal = $item['price'] * $item['quantity'];
            $stmt->bindParam(':subtotal', $subtotal);
            $stmt->execute();
        }
        
        // Confirmar transacción
        $pdo->commit();
        
        // Enviar correo electrónico de confirmación
        $to = $data['customer']['email'];
        $subject = "Confirmación de tu pedido - Belleza & Elegancia";
        $message = "Hola " . $data['customer']['name'] . ",\n\n";
        $message .= "Gracias por tu pedido en Belleza & Elegancia.\n\n";
        $message .= "Número de pedido: " . $orderNumber . "\n\n";
        $message .= "Detalles del pedido:\n";
        
        foreach ($data['items'] as $item) {
            $message .= "- " . $item['quantity'] . " x " . $item['name'] . ": $" . ($item['price'] * $item['quantity']) . "\n";
        }
        
        $message .= "\nTotal: $" . $data['total'] . "\n\n";
        $message .= "Tu pedido será enviado a:\n";
        $message .= $data['shipping']['address'] . ", " . $data['shipping']['city'] . ", " . $data['shipping']['postalCode'] . "\n\n";
        $message .= "Te notificaremos cuando tu pedido haya sido enviado.\n\n";
        $message .= "Saludos,\n";
        $message .= "El equipo de Belleza & Elegancia";
        
        $headers = "From: info@bellezayelegancia.com\r\n";
        $headers .= "Reply-To: info@bellezayelegancia.com\r\n";
        
        // Enviar correo
        mail($to, $subject, $message, $headers);
        
        // Enviar notificación a la empresa
        $toCompany = 'info@bellezayelegancia.com';
        $subjectCompany = "Nuevo pedido recibido - " . $orderNumber;
        $messageCompany = "Se ha recibido un nuevo pedido:\n\n";
        $messageCompany .= "Número de pedido: " . $orderNumber . "\n";
        $messageCompany .= "Cliente: " . $data['customer']['name'] . "\n";
        $messageCompany .= "Email: " . $data['customer']['email'] . "\n";
        $messageCompany .= "Teléfono: " . $data['customer']['phone'] . "\n\n";
        $messageCompany .= "Dirección de envío:\n";
        $messageCompany .= $data['shipping']['address'] . ", " . $data['shipping']['city'] . ", " . $data['shipping']['postalCode'] . "\n\n";
        $messageCompany .= "Detalles del pedido:\n";
        
        foreach ($data['items'] as $item) {
            $messageCompany .= "- " . $item['quantity'] . " x " . $item['name'] . ": $" . ($item['price'] * $item['quantity']) . "\n";
        }
        
        $messageCompany .= "\nTotal: $" . $data['total'] . "\n";
        
        $headersCompany = "From: noreply@bellezayelegancia.com\r\n";
        $headersCompany .= "Reply-To: " . $data['customer']['email'] . "\r\n";
        
        // Enviar correo a la empresa
        mail($toCompany, $subjectCompany, $messageCompany, $headersCompany);
        
        // Respuesta exitosa
        echo json_encode(['success' => true, 'message' => 'Pedido procesado correctamente', 'order_number' => $orderNumber]);
        
    } catch(PDOException $e) {
        // Revertir transacción en caso de error
        $pdo->rollBack();
        
        // Error en la consulta
        echo json_encode(['success' => false, 'message' => 'Error al procesar el pedido: ' . $e->getMessage()]);
    }
} else {
    // Método de solicitud no válido
    echo json_encode(['success' => false, 'message' => 'Método de solicitud no válido']);
}
?>