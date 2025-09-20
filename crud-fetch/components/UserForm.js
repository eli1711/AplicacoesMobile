import {useState} from "react";
import { View, TextInput, Button, StyleSheet } from "react-native";

export default function userForm({onUserAdded}){
    const [name, setName] = useState ("");
    const [email, setEmail] = useState ("");


    const addUser = async () => {
        if (!name || !email) return ;
        try{
            await fetch("http:10.110.12.39:3000/users",{
                method: "POST",
                headers:{"Content-Type": "application/json"},
                body: JSON.stringify({name, email})
            });
            setName("");
            setEmail("");
            onUserAdded();



        }catch (error){
            console.error("error POST: ", error.message);


        }

    };
    return(
        <View style= {styles.form}>
            <TextInput
            style = {styles.imput}
            placeholder="Nome"
            value={name}
            onChangeText={setName}
            />
            <TextInput
            style = {styles.imput}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            />
            <Button title = "Adicione um usuario" onPress={addUser}/>

        </View>
    )


}

const style = StyleSheet.create({
    form: {marginBottom: 20},
    input:{
        borderWidth:1,
        borderColor: "#ccc",
        padding: 8,
        marginBottom: 10,
        borderRadius: 5
    }
    
});