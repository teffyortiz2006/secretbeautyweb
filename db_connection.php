<?php
// Configuración de la base de datos
$host = 'localhost';
$dbname = 'belleza_y_elegancia';
$username = 'root';
$password = '';

try {
    // Crear conexión PDO
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    
    // Configurar modo de error PDO para excepciones
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Configurar juego de caracteres
    $pdo->exec("SET NAMES utf8");
} catch(PDOException $e) {
    // En caso de error, mostrar mensaje
    echo "Error de conexión: " . $e->getMessage();
    die();
}
?>