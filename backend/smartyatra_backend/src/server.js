import { server } from './app.js';
// import { info } from './config/logger';

// Set port
const PORT = process.env.PORT || 5000;

// Start server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    // info(`Server is running on port ${PORT}`);
});