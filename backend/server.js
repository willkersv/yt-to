const express = require("express");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");
const app = express();
const port = 5000;
const cors = require("cors");

app.use(cors());
app.use(express.json());

// Função para baixar o vídeo ou áudio usando yt-dlp
const downloadVideo = (url, format, res) => {
  // Diretório de downloads
  const downloadDir = path.join(__dirname, "downloads");

  if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir); // Cria o diretório, se não existir
  }

  // Escolher o formato correto
  const formatOption = format === "mp3" ? "bestaudio" : "b"; // Melhor áudio para mp3, ou "b" para vídeo

  // Comando para baixar o arquivo
  const command = `yt-dlp -f "${formatOption}" -o "${downloadDir}/%(title)s.%(ext)s" ${url}`;

  // Executa o comando yt-dlp
  exec(command, (err, stdout, stderr) => {
    if (err || stderr.includes("ERROR")) {
      console.error("Erro ao baixar o vídeo:", err || stderr);
      return res.status(500).send("Erro ao baixar o arquivo.");
    }

    console.log("Download concluído:", stdout);

    // Localizar o arquivo baixado
    fs.readdir(downloadDir, (readErr, files) => {
      if (readErr) {
        console.error("Erro ao listar os arquivos:", readErr);
        return res.status(500).send("Erro ao processar o arquivo baixado.");
      }

      // Encontra o arquivo baixado (provavelmente em .webm)
      const downloadedFile = files.find((file) =>
        file.match(/\.(webm|mp4|m4a|opus)$/) // Extensões comuns para áudio ou vídeo
      );

      if (!downloadedFile) {
        return res.status(500).send("Arquivo baixado não encontrado.");
      }

      const originalFilePath = path.join(downloadDir, downloadedFile);

      // Renomeia o arquivo para usar a extensão desejada, se for mp3
      if (format === "mp3") {
        const renamedFilePath = path.join(downloadDir, downloadedFile.replace(/\.\w+$/, ".mp3"));
        fs.renameSync(originalFilePath, renamedFilePath);
        return res.sendFile(renamedFilePath); // Envia o arquivo renomeado para o cliente
      }

      // Envia o arquivo original se for vídeo
      res.sendFile(originalFilePath);
    });
  });
};

// Rota para fazer o download do vídeo ou áudio
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
