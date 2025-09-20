import { View, Text, Button, StyleSheet  } from "react-native";

export default function UserList({users, onUserChaged}){
    const updateUser = async (id) => {
        try{
            const response = await fetch(`http://10.110.12.39:3000/users/${id}`, 
                {
                    method: "PUT",
                    headers: {"Content-Type": "application/json"},
                    body : JSON.stringify({
                        name: "Nome Atualizado",
                        email: "atualizado@gmail.om"
                    })
                });
                await response.json();
                onUserChaged();

        }catch (error){
            console.error("Error PUT: ", error.message);

        }
    };
    const deleteUser = async (id) =>{
        try{
            await fetch(`http://10.110.12.39:3000/users/${id}`,{
                method: "DELETE"});
            onUserChaged();
        }catch(error){
            console.error("Error DELETE: ", error.message);
        }
    };
    return(
        <View>
            {users.map((u)=> (
                <View key={u.id} style={styles.card}>

                    <Text style= {styles.text}>
                        {u.nome} - {u.email}
                    </Text>

            <View style={styles.buttons}>
                <Button title="Editar" onPress={()=> updateUser(u.id)}/>
                <Button title="Excluir" onPress={()=> deleteUser(u.id)}/>
            </View>
        
                </View>

            ))}
        </View>
    );
}
const styles = StyleSheet.create({
    card:{
        padding:10,
        marginBottom:10,
        backgroundColor: "#f2f2f2",
        borderRadius:5
    },
    text: {fontSize:10, marginBottom: 5},
    buttons: {flexDirection: "row", justifyContent:"space-between"}
});