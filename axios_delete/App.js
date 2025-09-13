import React, {useState, useEffect} from "react";
import { View, Text, Button, FlatList, StyleSheet } from "react-native";
import axios from "axios";

export default function App(){
  const [users, setUsers] = useState([]);

  const API = "http://10.110.12.39:3000/users";

  const fetchUsers = async () => {
    try{
      const response = await axios.get(API);
      setUsers(response.data);
    }catch(error) {
      console.error("Erro GET: ", error.message);
    }
  };

  const deleteUser = async(id) => {
    try{
      await axios.delete(`${API}/${id}`);
      setUsers(users.filter((u)=> u.id !== id));
    }catch(error){
      console.error("Erro DELETE ", error.message);
    }
  };

  useEffect(()=>{
    fetchUsers();
  }, []);

  return(
    <View style={styles.container}>
      <Text style={styles.title}>DELETE - REMOVER Usuarios</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({item})=>(
          <View style={styles.userItem}>
            <Text>
              {item.name} - {item.email}
            </Text>
            <Button title="deletar" onPress={() => deleteUser(item.id)}/>
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