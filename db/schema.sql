CREATE DATABASE prestaqui;
USE prestaqui;
CREATE TABLE service_provider (
    id INT AUTO_INCREMENT PRIMARY KEY,
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
    avatar_path BLOB
);
CREATE TABLE customer (
    id INT AUTO_INCREMENT PRIMARY KEY,
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
    avatar_path BLOB
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
CREATE TABLE has_category (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    service_provider_id INT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (service_provider_id) REFERENCES service_provider(id)
);
CREATE TABLE service_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_provider_id INT NOT NULL,
    customer_id INT NOT NULL,
    title VARCHAR(30) NOT NULL,
    description_ VARCHAR(255) NOT NULL,
    start_time TIME NOT NULL,
    ending_time TIME NOT NULL,
    shift_code ENUM('Manhã', 'Tarde', 'Noite') NOT NULL,
    FOREIGN KEY (service_provider_id) REFERENCES service_provider(id),
    FOREIGN KEY (customer_id) REFERENCES customer(id)
);
CREATE TABLE scheduling (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    service_provider_id INT NOT NULL,
    category_id INT NOT NULL,
    service_info_id INT NOT NULL,
    date_time DATETIME NOT NULL,
    status_ ENUM(
        'Em aberto',
        'Em andamento',
        'Concluído',
        'Cancelado',
        'Aguardando validação'
    ) NOT NULL,
    FOREIGN KEY (service_provider_id) REFERENCES service_provider(id),
    FOREIGN KEY (customer_id) REFERENCES customer(id),
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (service_info_id) REFERENCES service_info(id)
);