require("dotenv").config();
const mongoose = require("mongoose");
const path = require("path");
const express = require('express')
const cors = require("cors")
const bodyParser = require("body-parser")
const app = express()

let PORT = process.env.PORT || 8080

const allowedOrigins = [
    'http://localhost:3000', 
    'http://localhost:3001', 
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }, credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

//* extend body limit to 50MB
app.use(bodyParser.json({ limit: process.env.LimitbodyParser }))
app.use(bodyParser.urlencoded({ limit: process.env.LimitbodyParser, extended: true }))
app.use(express.static(path.join(__dirname, "public"))); // For serving static files

app.get("/health", async (req, res) => {
    res.status(200).json({
        status: "ok",
        message: "Server is running",
        time: new Date().toISOS - tring()
    });
});
app.use("/", require("./routes/index.route"));

//* Connect to MONGODB Database -> listen on PORT
mongoose
    .connect(process.env.DATABASE_CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((__, err) => {
        if (!err) {
            console.log("Connected to Database")
        } else {
            console.log(err)
        }
    })
    .finally(() => { })

app.listen(PORT, () => console.log(`listening on PORT ${PORT}!`))