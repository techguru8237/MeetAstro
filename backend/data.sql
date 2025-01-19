CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    level INT DEFAULT 1 CHECK (level >= 1 AND level <= 60),
    xp INT DEFAULT 0,
    windchance INT DEFAULT 80,
    fee FLOAT DEFAULT 1.0,
    gold INT DEFAULT 0,
    diamond INT DEFAULT 0,
    credit INT DEFAULT 0 CHECK (credit >= 0 AND credit <= 9000)
);


CREATE TABLE missions (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    start_at TIMESTAMP NOT NULL,
    end_at TIMESTAMP NOT NULL,
    mission_type VARCHAR(100) NOT NULL,
    chest_number INT NOT NULL,
    able_to_open_chest_at TIMESTAMP NOT NULL,
    opened_chest BOOLEAN DEFAULT FALSE,
    credit INT DEFAULT 0,
    gold INT DEFAULT 0,
    diamond INT DEFAULT 0,
    xp INT DEFAULT 0,
    diamond_to_open INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
