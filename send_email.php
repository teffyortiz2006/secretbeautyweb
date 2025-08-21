<?php
// Incluir archivo de conexión a la base de datos
require_once 'db_connection.php';

// Configurar cabeceras para respuesta JSON
header('Content-Type: application/json');

// Verificar si se recibieron los datos del formulario
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Obtener y sanitizar datos del formulario
    $name = htmlspecialchars(trim($_POST['name']));
    $email = htmlspecialchars(trim($_POST['email']));
    $subject = htmlspecialchars(trim($_POST['subject']));
    $message = htmlspecialchars(trim($_POST['message']));
    
    // Validar datos
    if (empty($name) || empty($email) || empty($subject) || empty($message)) {
        echo json_encode(['success' => false, 'message' => 'Todos los campos son obligatorios']);
        exit;
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['success' => false, 'message' => 'El correo electrónico no es válido']);
        exit;
    }
    
    try {
        // Preparar consulta para insertar el mensaje en la base de datos
        $stmt = $pdo->prepare("INSERT INTO contact_messages (name, email, subject, message, created_at) VALUES (:name, :email, :subject, :message, NOW())");
        
        // Bind parameters
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':subject', $subject);
        $stmt->bindParam(':message', $message);
        
        // Ejecutar consulta
        $stmt->execute();
        
        // Enviar correo electrónico de notificación
        $to = 'info@bellezayelegancia.com'; // Correo de la empresa
        $email_subject = "Nuevo mensaje de contacto: $subject";
        $email_body = "Has recibido un nuevo mensaje de contacto:\n\n";
        $email_body .= "Nombre: $name\n";
        $email_body .= "Correo electrónico: $email\n";
        $email_body .= "Asunto: $subject\n\n";
        $email_body .= "Mensaje:\n$message\n";
        
        $headers = "From: $email\r\n";
        $headers .= "Reply-To: $email\r\n";
        
        // Enviar correo
        mail($to, $email_subject, $email_body, $headers);
        
        // Respuesta exitosa
        echo json_encode(['success' => true, 'message' => 'Mensaje enviado correctamente']);
        
    } catch(PDOException $e) {
        // Error en la consulta
        echo json_encode(['success' => false, 'message' => 'Error al guardar el mensaje: ' . $e->getMessage()]);
    }
} else {
    // Método de solicitud no válido
    echo json_encode(['success' => false, 'message' => 'Método de solicitud no válido']);
}
?>