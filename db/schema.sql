CREATE DATABASE prestaqui;
USE prestaqui;

CREATE TABLE service_provider (
    id INT PRIMARY KEY,
    email_ VARCHAR(255) NOT NULL UNIQUE,
    password_ VARCHAR(255) NOT NULL, 
    name_ VARCHAR(255) NOT NULL,
    phone_ VARCHAR(14) NOT NULL,
    cep_ VARCHAR(9) NOT NULL,
    state_ VARCHAR(100) NOT NULL,
    city_ VARCHAR(100) NOT NULL,
    locality VARCHAR(100) NOT NULL,
    neighbornhood_ VARCHAR(100) NOT NULL,
    avatar_path_ BLOB
    description_ TEXT
);

CREATE TABLE customer (
    id INT PRIMARY KEY,
    email_ VARCHAR(255) NOT NULL UNIQUE,
    password_ VARCHAR(255) NOT NULL, 
    name_ VARCHAR(255) NOT NULL,
    phone_ VARCHAR(15) NOT NULL,
    cep_ VARCHAR(9) NOT NULL,
    state_ VARCHAR(100) NOT NULL,
    city_ VARCHAR(100) NOT NULL,
    locality VARCHAR(255) NOT NULL,
    neighbornhood_ VARCHAR(100) NOT NULL,
    avatar_path_ BLOB,
    description_ TEXT
);

CREATE TABLE categories (
    id INT PRIMARY KEY,
    name_ ENUM(
        'Eletricista',
        'Pintor',
        'Faxineiro',
        'Chaveiro',
        'Maquiador',
        'Fotógrafo'
    ) NOT NULL
);

CREATE TABLE provider_category (
    id INT PRIMARY KEY,
    category_id_ INT NOT NULL,
    service_provider_id_ INT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES Categories(id),
    FOREIGN KEY (service_provider_id) REFERENCES ServiceProvider(id)
);

CREATE TABLE availability_ (
    id INT PRIMARY KEY,
    service_provider_id_ INT NOT NULL,
    start_time_ TIME NOT NULL,
    ending_time_ TIME NOT NULL,
    shift_code_ ENUM('1', '2', '3') NOT NULL,
    duration_ INT NOT NULL,
    intervale_ INT NOT NULL,
    FOREIGN KEY (service_provider_id) REFERENCES ServiceProvider(id)
);

CREATE TABLE scheduling (
    id INT PRIMARY KEY,
    customer_id_ INT NOT NULL,
    service_provider_id_ INT NOT NULL,
    category_id_ INT NOT NULL,
    availability_id_ INT NOT NULL,
    dt_ DATETIME NOT NULL,
    status_ ENUM(
        'Pendente',
        'Concluído',
        'Cancelado',
        'Aguardando validação'
    ) NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES Customer(id),
    FOREIGN KEY (service_provider_id) REFERENCES ServiceProvider(id),
    FOREIGN KEY (category_id) REFERENCES Categories(id),
    FOREIGN KEY (availability_id) REFERENCES Availability(id)
);
