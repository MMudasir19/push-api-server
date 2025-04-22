const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors());
app.use(express.json());

const store = new Map();

app.post("/api/push", (req, res) => {
  const id = uuidv4();
  store.set(id, req.body);
  res.json({ id });
});


app.get("/api/fetch/:id", (req, res) => {
  const data = store.get(req.params.id);
  if (!data) return res.status(404).json({ error: "Not found" });
  res.json(data);
});

app.listen(3000, () => console.log("Server running on port 3000"));
