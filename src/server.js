const express = require('express');
const { NmapScan } = require('node-nmap');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/devices', (req, res) => {
  const nmapScan = new NmapScan('192.168.0.1/24'); // Replace with your network range

  nmapScan.on('complete', (data) => {
    res.json(data);
  });

  nmapScan.on('error', (error) => {
    res.status(500).json({ error: error.message });
  });

  nmapScan.startScan();
});

const port = 8000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
