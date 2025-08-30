import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  TextInput, 
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar 
} from 'react-native';
import axios from 'axios';

export default function App() {
  const [dogImages, setDogImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageCount, setImageCount] = useState(1);

  // Buscar imagens de cachorro
  const fetchDogImages = async () => {
    if (imageCount < 1 || imageCount > 50) {
      Alert.alert('Erro', 'Por favor, insira um número entre 1 e 50');
      return;
    }

    setLoading(true);
    try {
      const requests = [];
      for (let i = 0; i < imageCount; i++) {
        requests.push(axios.get('https://dog.ceo/api/breeds/image/random'));
      }

      const responses = await Promise.all(requests);
      const newImages = responses.map(response => response.data.message);
      
      setDogImages(newImages);
    } catch (error) {
      console.error('Erro ao buscar imagens:', error);
      Alert.alert(
        'Erro de Conexão', 
        'Não foi possível carregar as imagens. Verifique sua conexão com a internet.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Carregar uma imagem inicial ao abrir o app
  useEffect(() => {
    fetchDogImages();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.container}>
        <Text style={styles.title}>🐶 DogsFinder 🐕</Text>
        <Text style={styles.subtitle}>📸 Encontre imagens fofas de cachorros para alegrar seu dia! 🎉</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>🔢 Quantidade de imagens (1-50):</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={String(imageCount)}
            onChangeText={(text) => setImageCount(Number(text) || 1)}
            placeholder="Digite o número de imagens"
            maxLength={2}
          />
        </View>

        <TouchableOpacity 
          style={styles.button} 
          onPress={fetchDogImages}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>🎯 Buscar Cachorros 🐾</Text>
          )}
        </TouchableOpacity>

        {dogImages.length > 0 && (
          <View style={styles.imagesContainer}>
            <Text style={styles.sectionTitle}>
              📷 {dogImages.length} {dogImages.length === 1 ? 'imagem encontrada' : 'imagens encontradas'} 🎊
            </Text>
            {dogImages.map((imageUrl, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Text style={styles.imageNumber}>🐕 Imagem {index + 1}</Text>
                <Image 
                  source={{ uri: imageUrl }} 
                  style={styles.dogImage}
                  resizeMode="cover"
                />
              </View>
            ))}
          </View>
        )}

        {!loading && dogImages.length > 0 && (
          <Text style={styles.footer}>✨ Espero que esses doguinhos tenham alegrado seu dia! 🥰</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ff6b6b',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4ecdc4',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  imagesContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  imageWrapper: {
    marginBottom: 25,
    width: '100%',
    alignItems: 'center',
  },
  imageNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff6b6b',
    marginBottom: 8,
  },
  dogImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ffd166',
  },
  footer: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 30,
    fontStyle: 'italic',
  },
});