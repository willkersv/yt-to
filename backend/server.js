const express = require("express");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");  // Para executar o comando yt-dlp
const app = express();
const port = 5000;

// Middleware para permitir o envio de dados em JSON
app.use(express.json());

// Função para baixar o vídeo usando yt-dlp
const downloadVideo = (url, format, res) => {
  // Definir o diretório de downloads
  const downloadDir = path.join(__dirname, "downloads");

  if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir); // Cria o diretório de downloads, se não existir
  }

  const fileName = `video.${format}`;
  const outputPath = path.join(downloadDir, fileName);

  const formatOption = format === "mp3" ? "bestaudio/best" : "bestvideo+bestaudio";  // Definir formato de vídeo ou áudio

  // Comando para executar o yt-dlp
  const command = `yt-dlp -f "${formatOption}" -o "${outputPath}" ${url}`;

  // Executa o comando yt-dlp
  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error("Erro ao baixar o vídeo:", err);
      return res.status(500).send("Erro ao baixar o vídeo.");
    }

    if (stderr) {
      console.error("Erro no yt-dlp:", stderr);
      return res.status(500).send("Erro ao processar o vídeo.");
    }

    console.log("Download concluído:", stdout);
    res.sendFile(outputPath);  // Envia o arquivo para o cliente
  });
};

// Rota para fazer o download do vídeo
app.post("/download", (req, res) => {
  const { url, format } = req.body;

  if (!url || !format) {
    return res.status(400).send("URL e formato são obrigatórios.");
  }

  try {
    downloadVideo(url, format, res);
  } catch (err) {
    console.error("Erro no processo de download:", err);
    res.status(500).send("Erro ao processar o download.");
  }
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor backend rodando na porta ${port}`);
});
