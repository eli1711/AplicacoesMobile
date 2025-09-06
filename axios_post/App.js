import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from "react-native";
import axios from "axios";

// Declarar a função componente principal
export default function App() {
  // definimos a variavel de estado users
  const [users, setUsers] = useState([]);
  // definir as variaveis estado new name e new email
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");

  // definir nossa uRL do JSON-SERVER
  const API = "http://10.110.12.39:3000/users";

  // Declarar a função assincrona para adicionar um novo usuário
  const addUser = async () => { // Corrigido: addUser (não addYsser)
    try {
      // Faz uma requisição de POST para a API usando o axios diretamente
      const response = await axios.post(API, { // Adicionado: await
        name: newName,
        email: newEmail
      });
      setUsers([...users, response.data]);
      setNewName("");
      setNewEmail("");
    } catch (error) {
      console.log("Error POST:", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>POST - Adicionar Usuário</Text>
      <TextInput
        style={styles.input} // Corrigido: input (não imput)
        placeholder="Name"
        value={newName}
        onChangeText={setNewName}
      />
      {/* Definimos a entrada do email - Corrigido: comentário JSX */}
      <TextInput
        style={styles.input} // Corrigido: input (não imput)
        placeholder="email@dominio.com"
        value={newEmail}
        onChangeText={setNewEmail}
        keyboardType="email-address"
      />

      <Button
        title="Adicionar Usuario"
        onPress={addUser} // Corrigido: addUser (não addYsser)
      />
      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text>{item.name} - {item.email}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    marginTop: 40 
  },
  title: { 
    fontSize: 22, 
    fontWeight: "bold", 
    marginBottom: 10,
    textAlign: "center" 
  },
  input: { // Corrigido: input (não imput)
    borderWidth: 1, 
    borderColor: '#ccc', // Corrigido: aspas em '#ccc'
    padding: 8, 
    marginBottom: 8,
    borderRadius: 5
  },
  listItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 5
  }
});