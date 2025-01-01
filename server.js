const express = require("express");
const bodyParser = require("body-parser");

const app = express();

/** Middleware */
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/** Routes */
const viewersRoutes = require("./routes/Viewers");

app.use("/viewers", viewersRoutes);

const port = 3000;

app.listen(port, () => {
    console.log(`Listening on PORT: ${port}`);
});