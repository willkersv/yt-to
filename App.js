import React, { useState } from "react";
import { StyleSheet, View, TextInput, Button, Text, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";

export default function App() {
  const [link, setLink] = useState("");
  const [format, setFormat] = useState("mp4");

  const handleDownload = async () => {
    if (!link) {
      Alert.alert("Erro", "Por favor, insira um link do YouTube.");
      return;
    }

    try {
      const response = await axios.post("https://yt-to-production.up.railway.app/download", {
        url: link,
        format: format,
      });

      // Alerta de sucesso
      Alert.alert("Sucesso", response.data.message || "Download iniciado com sucesso!");
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Houve um erro ao baixar o vídeo.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>YouTube Downloader</Text>
      <TextInput
        style={styles.input}
        placeholder="Cole o link do vídeo do YouTube"
        value={link}
        onChangeText={setLink}
      />
      <Text style={styles.label}>Escolha o formato:</Text>
      <Picker
        selectedValue={format}
        style={styles.picker}
        onValueChange={(itemValue) => setFormat(itemValue)}
      >
        <Picker.Item label="MP4" value="mp4" />
        <Picker.Item label="MP3" value="mp3" />
        {/* Removido o formato AVI pois não é suportado pelo backend */}
      </Picker>
      <Button title="Baixar Vídeo" onPress={handleDownload} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f0f0f0",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  picker: {
    height: 50,
    backgroundColor: "#fff",
    marginBottom: 15,
  },
});
