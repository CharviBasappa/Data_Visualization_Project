const express = require("express");
const app = express();
const path = require("path");

app.use(express.static(path.join(__dirname, "public")));

app.use("/q01", express.static(path.join(__dirname, "public/q01/public")));

app.use("/q02", express.static(path.join(__dirname, "public/q02/public")));

app.use("/q03", express.static(path.join(__dirname, "public/q03/public")));

app.use("/q04", express.static(path.join(__dirname, "public/q04/public")));
const port = 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
