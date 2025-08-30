import { useState } from 'react';
import { Button, StyleSheet, View, ScrollView, Image, Text, ActivityIndicator } from 'react-native';
import api from "./src/service/api";

export default function App() {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(false);

  async function buscar() {
    setLoading(true);
    try {
      const result = await api.get('https://api.thecatapi.com/v1/images/search?limit=10');
      console.log('Dados recebidos:', result.data);
      setCats(result.data);
    } catch (error) {
      console.log('Erro:', error);
    } finally {
      setLoading(false);
    }
  }

  const renderCats = () => {
    if (cats.length === 0) {
      return (
        <Text style={styles.noCatsText}>
          Clique no botão para carregar imagens de gatos!
        </Text>
      );
    }

    return cats.map((item, index) => (
      <View style={styles.card} key={item.id || index}>
        <Image
          source={{ uri: item.url }}
          style={styles.image}
          resizeMode="cover"
          onError={(error) => console.log('Erro ao carregar imagem:', error.nativeEvent.error)}
        />
        <Text style={styles.imageInfo}>
          Imagem {index + 1} - {item.width}x{item.height}
        </Text>
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      <Button
        title={loading ? 'Carregando...' : 'Buscar Gatos'}
        onPress={buscar}
        disabled={loading}
      />
      
      {loading && (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      )}

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {renderCats()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50
  },
  scrollView: {
    width: '100%',
    marginTop: 20
  },
  scrollContent: {
    alignItems: 'center'
  },
  card: {
    marginBottom: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
    width: '90%'
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: 8,
    marginBottom: 10
  },
  imageInfo: {
    fontSize: 12,
    color: '#666',
    marginTop: 5
  },
  noCatsText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 50
  },
  loader: {
    marginVertical: 20
  }
});