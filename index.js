const { connection } = require("./database/connection");
const express = require("express");
const cors = require("cors");
const dotenv = require('dotenv');
dotenv.config();
const crypto = require('crypto');
const { exec } = require('child_process');

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
        "version": "0.0.0"
    });
});

const secret = 'miSecreto123';

app.post('/webhook', (req, res) => {
    const signature = req.headers['x-hub-signature-256'];
    const hash = `sha256=${crypto.createHmac('sha256', secret).update(JSON.stringify(req.body)).digest('hex')}`;
    
    if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(hash))) {
        const ref = req.body.ref;

        if (ref === 'refs/heads/main') {
            exec('sh /home/bitnami/deploy.sh', (error, _stdout, _stderr) => {
                if (error) {
                    console.error(`Error al ejecutar el script: ${error}`);
                    return res.status(500).send('Error en el despliegue.');
                }
                res.status(200).send('Despliegue exitoso.');
            });
        } else {
            res.status(200).send('No se desplegará, ya que no fue un push a main o master.');
        }
    } else {
        res.status(401).send('No autorizado.');
    }
});

app.listen(port, () => {
    console.log("Node server running in port:", port); 
});