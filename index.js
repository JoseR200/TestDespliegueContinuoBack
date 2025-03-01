const { connection } = require("./database/connection");
const express = require("express");
const cors = require("cors");
const dotenv = require('dotenv');
dotenv.config();
const { spawn } = require('child_process');

console.log("Test despliegue continuo backend api started");

connection(process.env.MONGO_URI);

const app = express();
const port = process.env.PORT;
app.use(cors());
app.use(express.json());

const UserRoutes = require("./routes/UserRoutes");
app.use("/api/users", UserRoutes);

app.get("/test-route", (_req, res) => {
    return res.status(200).json({
        "version": "7.7.7"
    });
});

app.post('/webhook', (req, res) => {
    const ref = req.body.ref;

    if (ref === 'refs/heads/main') {
        const deployProcess = spawn('bash', ['/home/bitnami/deployTestDC.sh'], {
            detached: true,
            stdio: 'ignore'
        });

        deployProcess.unref();

        res.status(200).send('Despliegue exitoso.');
    } else {
        res.status(200).send('No se desplegará, ya que no fue un push a main o master.');
    }
});

app.listen(port, () => {
    console.log("Node server running in port:", port); 
});