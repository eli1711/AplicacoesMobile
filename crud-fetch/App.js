
import {useState, useEffect} from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import UserList from "./components/UserList";
import userForm from "./components/UserForm";


export default function App(){
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () =>{
    try{
      setLoading(true);
      const response = await fetch("http:  :3000/users");
      const data = await response.json
        }catch(error){
           console.error("error get: ", error.message);
    }
    finally{
      setLoading(false);
    }
  }
  useEffect(() =>{
    fetchUsers();
  },[]);
  return(
    <View style={styles.container}>
      <Text style={styles.title}>crud com fetch</Text>
      <UserForm onUserAdded={fetchUsers}/>
      <ScrollView>
        (loading ? (<Text>Carregando</Text>)) :
        (<UserList users={users} onUserChaged={fetchUsers}/>)
      </ScrollView>
        </View>
  );
}
const styles = StyleSheet.create({
    container: {flex: 1, padding: 20, marginTop:10},
    title: {fontSize: 22, fontWeight:"bold", marginBottom: 20}

});
