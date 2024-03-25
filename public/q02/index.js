const express = require("express");
const app = express();
app.listen(3001, () => console.log("listening at 3001"));
app.use(express.static("public"));
