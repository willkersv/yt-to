const downloadVideo = (url, format, res) => {
  // Diretório de downloads
  const downloadDir = path.join(__dirname, "downloads");

  if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir); // Cria o diretório, se não existir
  }

  // Escolher o formato correto
  const formatOption = format === "mp3" ? "bestaudio" : "b"; // Melhor áudio para mp3, ou "b" para vídeo

  // Caminho absoluto para o yt-dlp
  const ytDlpPath = '/usr/local/bin/yt-dlp';  // Caminho absoluto

  // Comando para baixar o arquivo
  const command = `${ytDlpPath} -f "${formatOption}" -o "${downloadDir}/%(title)s.%(ext)s" ${url}`;

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
