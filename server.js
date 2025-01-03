const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

class AuthServer {
    constructor() {
        this.app = express();
        this.JWT_SECRET = "lebronjamesnikolajokicgiannisantetokoumpovictorwemby2025";
        this.setupDatabase();
        this.setupMiddleware();
        this.setupRoutes();
    }

    setupDatabase() {
        this.db = new Pool({
            user: 'postgres',
            host: 'localhost',
            database: 'userDB',
            password: 'maaaaaarrrrrrviiiiiinnnn',
            port: 5432,
        });
    }

    setupMiddleware() {
        this.app.use(bodyParser.json());
    }

    setupRoutes() {
        this.app.post('/register', this.register.bind(this));
        this.app.post('/login', this.login.bind(this));
        this.app.get('/protected', this.protectedRoute.bind(this));

        this.app.post('/api/users', this.createUser.bind(this));
        this.app.get('/api/users', this.getAllUsers.bind(this));
        this.app.get('/api/users/:id', this.getUserById.bind(this));
        this.app.put('/api/users/:id', this.updateUser.bind(this));
        this.app.delete('/api/users/:id', this.deleteUser.bind(this));
    }

    async register(req, res) {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        this.users = this.users || [];
        this.users.push({ username, password: hashedPassword });
        res.status(201).json({ message: "User registered successfully!" });
    }

    async login(req, res) {
        const { username, password } = req.body;
        const user = this.users?.find(u => u.username === username);
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password!" });
        }

        const token = jwt.sign({ username }, this.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    }

    protectedRoute(req, res) {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: "Access denied!" });
        }

        try {
            const decoded = jwt.verify(token, this.JWT_SECRET);
            res.json({ message: "Welcome to the protected route!", user: decoded });
        } catch (error) {
            res.status(403).json({ message: "Invalid or expired token!" });
        }
    }

    async createUser(req, res) {
        const { firstname, lastname, email, mobile, age } = req.body;

        try {
            const result = await this.db.query(
                'INSERT INTO users (firstname, lastname, email, mobile, age) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [firstname, lastname, email, mobile, age]
            );
            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error creating user" });
        }
    }

    async getAllUsers(req, res) {
        try {
            const result = await this.db.query('SELECT * FROM users');
            res.json(result.rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error retrieving users" });
        }
    }

    async getUserById(req, res) {
        const { id } = req.params;

        try {
            const result = await this.db.query('SELECT * FROM users WHERE id = $1', [id]);
            if (result.rows.length === 0) {
                return res.status(404).json({ message: "User not found" });
            }
            res.json(result.rows[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error retrieving user" });
        }
    }

    async updateUser(req, res) {
        const { id } = req.params;
        const { firstname, lastname, email, mobile, age } = req.body;

        try {
            const result = await this.db.query(
                'UPDATE users SET firstname = $1, lastname = $2, email = $3, mobile = $4, age = $5 WHERE id = $6 RETURNING *',
                [firstname, lastname, email, mobile, age, id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ message: "User not found" });
            }
            res.json(result.rows[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error updating user" });
        }
    }

    async deleteUser(req, res) {
        const { id } = req.params;

        try {
            const result = await this.db.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
            if (result.rows.length === 0) {
                return res.status(404).json({ message: "User not found" });
            }
            res.json({ message: "User deleted successfully" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error deleting user" });
        }
    }

    start(port) {
        this.app.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`);
        });
    }
}

const server = new AuthServer();
server.start(3000);
