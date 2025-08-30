import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Image 
} from 'react-native';
import axios from 'axios';

export default function App() {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sua chave API do OpenWeatherMap
  const API_KEY = 'SUA_CHAVE_API_AQUI'; // Substitua pela sua chave
  const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

  // Buscar dados do tempo
  const fetchWeatherData = async () => {
    if (!city.trim()) {
      Alert.alert('Erro', 'Por favor, digite o nome de uma cidade');
      return;
    }

    setLoading(true);
    setError('');
    setWeatherData(null);

    try {
      const response = await axios.get(API_URL, {
        params: {
          q: city,
          appid: API_KEY,
          units: 'metric', // Para temperatura em Celsius
          lang: 'pt_br' // Para textos em português
        }
      });

      setWeatherData(response.data);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      
      if (error.response) {
        // Erro da API
        if (error.response.status === 404) {
          setError('Cidade não encontrada. Verifique o nome e tente novamente.');
        } else if (error.response.status === 401) {
          setError('Chave API inválida. Verifique sua configuração.');
        } else {
          setError('Erro ao buscar dados da cidade.');
        }
      } else if (error.request) {
        // Erro de rede
        setError('Erro de conexão. Verifique sua internet e tente novamente.');
      } else {
        // Outros erros
        setError('Ocorreu um erro inesperado.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Função para converter temperatura
  const convertTemp = (temp) => {
    return Math.round(temp);
  };

  // Função para obter ícone do tempo
  const getWeatherIcon = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.container}>
        <Text style={styles.title}>🌤️ Previsão do Tempo</Text>
        <Text style={styles.subtitle}>Descubra como está o tempo em qualquer cidade! 🌍</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>🏙️ Nome da Cidade:</Text>
          <TextInput
            style={styles.input}
            value={city}
            onChangeText={setCity}
            placeholder="Ex: São Paulo, Rio de Janeiro..."
            placeholderTextColor="#999"
            onSubmitEditing={fetchWeatherData}
          />
        </View>

        <TouchableOpacity 
          style={styles.button} 
          onPress={fetchWeatherData}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>🔍 Buscar Previsão</Text>
          )}
        </TouchableOpacity>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        ) : null}

        {weatherData && (
          <View style={styles.weatherContainer}>
            <Text style={styles.cityName}>📍 {weatherData.name}, {weatherData.sys.country}</Text>
            
            {weatherData.weather[0]?.icon && (
              <Image 
                source={{ uri: getWeatherIcon(weatherData.weather[0].icon) }}
                style={styles.weatherIcon}
              />
            )}

            <Text style={styles.weatherDescription}>
              {weatherData.weather[0]?.description}
            </Text>

            <View style={styles.weatherInfo}>
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>🌡️ Temperatura</Text>
                <Text style={styles.infoValue}>{convertTemp(weatherData.main.temp)}°C</Text>
                <Text style={styles.infoSub}>
                  Sensação: {convertTemp(weatherData.main.feels_like)}°C
                </Text>
              </View>

              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>💧 Umidade</Text>
                <Text style={styles.infoValue}>{weatherData.main.humidity}%</Text>
              </View>
            </View>

            <View style={styles.additionalInfo}>
              <View style={styles.additionalItem}>
                <Text style={styles.additionalLabel}>📈 Pressão</Text>
                <Text style={styles.additionalValue}>{weatherData.main.pressure} hPa</Text>
              </View>

              <View style={styles.additionalItem}>
                <Text style={styles.additionalLabel}>💨 Vento</Text>
                <Text style={styles.additionalValue}>{weatherData.wind.speed} m/s</Text>
              </View>

              <View style={styles.additionalItem}>
                <Text style={styles.additionalLabel}>👀 Visibilidade</Text>
                <Text style={styles.additionalValue}>
                  {(weatherData.visibility / 1000).toFixed(1)} km
                </Text>
              </View>
            </View>
          </View>
        )}

        {!weatherData && !loading && !error && (
          <Text style={styles.instruction}>
            Digite o nome de uma cidade acima e clique em "Buscar Previsão" para ver o tempo! ⬆️
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f8ff',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#34495e',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#2c3e50',
  },
  button: {
    backgroundColor: '#3498db',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: '#ffeaea',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
    marginBottom: 20,
  },
  errorText: {
    color: '#c0392b',
    fontSize: 14,
  },
  weatherContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cityName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 15,
  },
  weatherIcon: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 10,
  },
  weatherDescription: {
    fontSize: 18,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 20,
    textTransform: 'capitalize',
  },
  weatherInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: '#ecf0f1',
    padding: 15,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  infoSub: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 4,
  },
  additionalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  additionalItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    margin: 5,
    minWidth: '30%',
    alignItems: 'center',
  },
  additionalLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  additionalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  instruction: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
    marginTop: 40,
    fontStyle: 'italic',
  },
});