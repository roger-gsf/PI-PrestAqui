CREATE DATABASE prestaqui;
USE prestaqui;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_type ENUM('Prestador de serviço', 'Cliente') NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_ VARCHAR(255) NOT NULL,
    name_ VARCHAR(255) NOT NULL,
    phone VARCHAR(14) NOT NULL,
    cep VARCHAR(9) NOT NULL,
    state_ VARCHAR(50) NOT NULL,
    city VARCHAR(100) NOT NULL,
    neighborhood VARCHAR(100) NOT NULL,
    address_line VARCHAR(255) NOT NULL,
    complement VARCHAR(255),
    avatar_path BLOB,
);
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name_ ENUM(
        'Eletricista',
        'Pintor',
        'Faxineiro',
        'Chaveiro',
        'Pedreiro',
        'Fotógrafo'
    ) NOT NULL
);
CREATE TABLE provider_category (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    service_provider_id INT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (service_provider_id) REFERENCES users(id)
);
CREATE TABLE availability_ (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_provider_id INT NOT NULL,
    start_time TIME NOT NULL,
    ending_time TIME NOT NULL,
    shift_code ENUM('1', '2', '3') NOT NULL,
    duration INT NOT NULL,
    interval_ INT NOT NULL,
    FOREIGN KEY (service_provider_id) REFERENCES users(id)
);
CREATE TABLE scheduling (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    service_provider_id INT NOT NULL,
    category_id INT NOT NULL,
    availability_id INT NOT NULL,
    date_time DATETIME NOT NULL,
    title VARCHAR(30) NOT NULL,
    description_ VARCHAR(50) NOT NULL,
    status_ ENUM(
        'Pendente',
        'Concluído',
        'Cancelado',
        'Aguardando validação'
    ) NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (service_provider_id) REFERENCES users(id),
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (availability_id) REFERENCES availability_(id)
);