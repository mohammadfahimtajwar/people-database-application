const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const PORT = process.env.PORT || 3000;

const app = express();
const favicon = require('serve-favicon');

app.use(favicon(__dirname + '/public/favicon.ico'));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));

const db_name = path.join(__dirname, ".data", "people.db");
const db = new sqlite3.Database(db_name, err => {
    if (err) {
        return console.error(err.message);
    }
    console.log("Successful connection to the People database!");
});

const sql_create = `CREATE TABLE IF NOT EXISTS People (
  Person_ID INTEGER PRIMARY KEY AUTOINCREMENT,
  First_Name VARCHAR(40),
  Middle_Name VARCHAR(40),
  Last_Name VARCHAR(40) NOT NULL
);`;
db.run(sql_create, err => {
    if (err) {
        return console.error(err.message);
    }
    console.log("Successful creation of the 'People' table!");
});

app.listen(PORT, () => {
    console.log(`Application running successfully on ${ PORT }`);
});

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/people", (req, res) => {
    const sql = "SELECT * FROM People ORDER BY First_Name";
    db.all(sql, [], (err, rows) => {
        if (err) {
            return console.error(err.message);
        }
        res.render("people", { model: rows });
    });
});

app.get("/create", (req, res) => {
    res.render("create", { model: {} });
});

app.post("/create", (req, res) => {
    const sql = "INSERT INTO People (First_Name, Middle_Name, Last_Name) VALUES (?, ?, ?)";
    const book = [req.body.First_Name, req.body.Middle_Name, req.body.Last_Name];
    db.run(sql, book, err => {
        if (err) {
            return console.error(err.message);
        }
        res.redirect("/people");
    });
});

app.get("/edit/:id", (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM People WHERE Person_ID = ?";
    db.get(sql, id, (err, row) => {
        if (err) {
            return console.error(err.message);
        }
        res.render("edit", { model: row });
    });
});

app.post("/edit/:id", (req, res) => {
    const id = req.params.id;
    const person = [req.body.First_Name, req.body.Middle_Name, req.body.Last_Name, id];
    const sql = "UPDATE People SET First_Name = ?, Middle_Name = ?, Last_Name = ? WHERE (Person_ID = ?)";
    db.run(sql, person, err => {
        if (err) {
            return console.error(err.message);
        }
        res.redirect("/people");
    });
});

app.get("/delete/:id", (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM People WHERE Person_ID = ?";
    db.get(sql, id, (err, row) => {
        if (err) {
            return console.error(err.message);
        }
        res.render("delete", { model: row });
    });
});

app.post("/delete/:id", (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM People WHERE Person_ID = ?";
    db.run(sql, id, err => {
        if (err) {
            return console.error(err.message);
        }
        res.redirect("/people");
    });
});