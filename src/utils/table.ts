import db from './db';
export const createTables = async () => {
    try {
        // Users table
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                user_type ENUM('user', 'speaker') NOT NULL,
                is_verified BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Speakers table
        await db.query(`
            CREATE TABLE IF NOT EXISTS speakers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                expertise VARCHAR(255),
                price_per_session DECIMAL(10, 2),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `);

        // bookings table
        await db.query(`
            CREATE TABLE IF NOT EXISTS bookings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                speaker_id INT NOT NULL,
                slot INT NOT NULL,
                booking_date DATE NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (speaker_id) REFERENCES speakers(id),
                UNIQUE (speaker_id, slot, booking_date)
            );
            `)

        console.log('Tables initialized successfully.');
    } catch (error) {
        console.error('Error initializing tables:', error);
        throw error;
    }
};

