const express = require('express');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs-extra');
const gradient = require('gradient-string');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/status', (req, res) => {
    res.json({
        status: 'running',
        uptime: process.uptime(),
        bot: 'Sagor Telegram Bot',
        version: '2.0.0',
        author: 'JAHIDUL ISLAM SAGOR'
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(gradient.pastel(`🌐 Server running on port ${PORT}`));
});

function startProject() {
    console.log(gradient.rainbow('\n🚀 Starting Suika Bot...\n'));
    
    const child = spawn("node", ["main.js"], {
        cwd: __dirname,
        stdio: "inherit",
        shell: true
    });

    child.on("close", (code) => {
        if (code === 2) {
            console.log(gradient.pastel("♻️ Restarting Bot..."));
            startProject();
        }
    });

    child.on("error", (err) => {
        console.error(gradient.passion(`❌ Error: ${err.message}`));
        setTimeout(() => startProject(), 3000);
    });
}

startProject();
