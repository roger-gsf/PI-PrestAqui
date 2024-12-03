<?php
// Configurações do banco de dados
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "prestaqui";


// Cria conexão com o banco de dados
$conn = new mysqli($servername, $username, $password, $dbname);


// Verifica a conexão
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error); // Para o código se a conexão falhar.
}


header('Content-Type: application/json'); // Configura o cabeçalho para JSON.
$input = json_decode(file_get_contents('php://input'), true); // Lê os dados enviados em JSON.


function clean_input($data) {
    global $conn;
    return mysqli_real_escape_string($conn, htmlspecialchars($data)); // Limpa os dados para evitar ataques.
}


if (isset($_GET['action'])) {
    $action = $_GET['action'];
}

if ($action == 'register') {
    $username = clean_input($input['username']);
    $password = password_hash(clean_input($input['password']), PASSWORD_DEFAULT);
    $email = clean_input($input['email']);
    
    $stmt = $conn->prepare("SELECT * FROM users WHERE username=?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        echo json_encode(['success' => false, 'message' => 'Username already exists']);
    } else {
        $stmt = $conn->prepare("INSERT INTO users (username, password, email) VALUES (?, ?, ?)");
        $stmt->bind_param("sss", $username, $password, $email);
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Registration successful']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error: ' . $stmt->error]);
        }
    }
    $stmt->close();

 elseif ($action == 'login') {
    $username = clean_input($input['username']);
    $password = clean_input($input['password']);
    
    $stmt = $conn->prepare("SELECT * FROM users WHERE username=?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        if (password_verify($password, $user['password'])) {
            echo json_encode(['success' => true, 'message' => 'Login successful', 'email' => $user['email']]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Incorrect password']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Username not found']);
    }
    $stmt->close();


} elseif ($action == 'update') {
    $username = clean_input($input['username']);
    $password = password_hash(clean_input($input['password']), PASSWORD_DEFAULT);
    $email = clean_input($input['email']);

    $stmt = $conn->prepare("UPDATE users SET password=?, email=? WHERE username=?");
    $stmt->bind_param("sss", $password, $email, $username);
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Update successful']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error: ' . $stmt->error]);
    }
    $stmt->close();
}


} elseif ($action == 'delete') {
    $username = clean_input($input['username']);
    
    $stmt = $conn->prepare("DELETE FROM users WHERE username=?");
    $stmt->bind_param("s", $username);
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'User deleted successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error: ' . $stmt->error]);
    }
    $stmt->close();
}


$conn->close();
