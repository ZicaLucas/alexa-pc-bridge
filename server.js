import "dotenv/config";              
import express from "express";
import { exec } from "child_process";
import wol from "wol";

const app = express();
const TOKEN = process.env.PC_TOKEN;  /
const MAC = "PREENCHER_NO_PC_PESSOAL"; // <- coloca o MAC 

app.use((req, res, next) => {
  if (req.headers["x-token"] !== TOKEN) return res.status(401).send("nope");
  next();
});

// desliga o PC
app.post("/shutdown", (req, res) => {
  exec("shutdown /s /t 0", (err) => {  
    if (err) return res.status(500).send("erro ao desligar");
    res.send("desligando");
  });
});

// Wake-on-LAN
app.post("/wake", (req, res) => {
  wol.wake(MAC, (err) => {
    if (err) return res.status(500).send("erro no WoL");
    res.send("acordando");
  });
});

app.listen(3000, () => console.log("PC bridge na porta 3000"));