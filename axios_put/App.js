import React, {useState, useEffect} from "react";
import {View, Text, Button, FlatList, StyleSheet} from 'react-native';
import axios from "axios";

//definir componente principal da app
export default function App(){
  const [users, setUsers] = useState([]);
  const API = "http://10.110.12.39:3000/users";

  //criar a função assincrona para buscar os usuarios d API
  const fetchUsers = async() => {
    try{
      // Faz uso de um operador GET
      const response = await axios.get(API);
      setUsers(response.data);
    }catch(error){
      console.error("GET erro: "+error.message);
    }
  };

  const updateUser = async (id) => {
    try{
      const response = await axios.put(`${API}/${id}`,
        {name: "Nome Atualizado", email:"Email Atualizado"});
      setUsers(users.map((u) => (u.id === id ? response.data : u)));
    }catch (error){ 
      console.error("Error PUT: ", error.message);
    }
  };

  useEffect(()=>{
    fetchUsers();
  },[]);

  return(
    <View style={styles.container}>
      <Text style={styles.title}>PUT - Atualizar Usuarios</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({item})=>(
          <View style={styles.userItem}>
            <Text>
              {item.name} - {item.email}
            </Text>
            <Button title="Atualizar" onPress={() => updateUser(item.id)}/>
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
    marginBottom: 10
  },
  userItem: {
    marginVertical: 10
  }
});