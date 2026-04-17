# Social Media App

A modern social media application built with Node.js, Express.js, and TypeScript.

## 🚀 Features

- **TypeScript**: Full TypeScript support for better development experience
- **Express.js**: Fast, unopinionated web framework
- **Security**: Helmet for security headers, CORS support
- **Rate Limiting**: Protection against abuse with express-rate-limit
- **Error Handling**: Comprehensive error handling with custom middleware
- **Logging**: Structured logging utility
- **Modular Architecture**: Clean, maintainable code structure

## 📁 Project Structure

```
social-media-app/
├── src/
│   ├── config/           # Configuration files
│   │   └── config.service.ts
│   ├── controllers/      # Route controllers
│   │   └── app.controller.ts
│   ├── middlewares/      # Custom middlewares
│   │   ├── error.middleware.ts
│   │   └── rate-limit.middleware.ts
│   ├── routes/          # Route definitions
│   │   └── index.routes.ts
│   ├── utils/           # Utility functions
│   │   └── logger.util.ts
│   ├── app.ts           # Express app configuration
│   ├── server.ts        # Server startup
│   └── index.ts         # Application entry point
├── .env                 # Environment variables
├── package.json
├── tsconfig.json
└── README.md
```

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd social-media-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Copy `.env` file and configure your environment variables:
   ```bash
   cp .env.example .env
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Build and Run
```bash
npm run build
npm start
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Welcome message |
| GET | `/ping` | Health check |
| GET | `/test-error` | Test error handling |

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run linter (when configured)
npm run lint
```

## 🔧 Configuration

The application uses the following environment variables:

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (development/production)

## 📦 Dependencies

### Production
- `express`: Web framework
- `cors`: Cross-origin resource sharing
- `helmet`: Security middleware
- `express-rate-limit`: Rate limiting
- `dotenv`: Environment variables

### Development
- `typescript`: TypeScript compiler
- `ts-node`: TypeScript execution
- `@types/*`: TypeScript type definitions
- `concurrently`: Run multiple commands

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 📞 Support

For questions or support, please open an issue in the repository.