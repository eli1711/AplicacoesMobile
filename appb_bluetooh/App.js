// @ts-nocheck
import React, { useState, useEffect } from "react";
import { View, Text, Button, FlatList, StyleSheet, PermissionsAndroid, Platform } from "react-native";
import { BleManager } from "react-native-ble-plx";

const manager = new BleManager();

function BleScannerComponent(){
  const [devices, setDevices] = useState([]);
  const [radioPowerOn, setRadioPowerOn] = useState(false);

  useEffect(() => {
    const subscription = manager.onStateChange((state) => {
      if(state === "PoweredOn"){
        setRadioPowerOn(true);
      }
    }, true);
    
    return () => {
      subscription.remove();
      manager.destroy();
    };
  }, []);

  const requestBluetoothPermission = async () => {
    const apiLevel = parseInt(Platform.Version.toString(), 10);
    if (apiLevel < 31){
      const grant = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Permissão de localização',
          message: 'O app precisa de acesso a sua localização para escanear dispositivos bluetooth',
          buttonPositive: 'OK'
        },
      );
      return grant === PermissionsAndroid.RESULTS.GRANTED;
    } else {
      const result = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      ]);
      return (
        result[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] === PermissionsAndroid.RESULTS.GRANTED && 
        result[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] === PermissionsAndroid.RESULTS.GRANTED &&
        result[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED 
      );
    }
  };

  const scanForDevices = async () => {
    const hasPermission = await requestBluetoothPermission();
    if(!hasPermission){
      alert('Permissão negada, o app não pode escanear dispositivos bluetooth');
      return;
    }
    if(!radioPowerOn){
      alert('Por favor ligue o bluetooth para escanear dispositivos');
      return;
    }
    setDevices([]);
    manager.startDeviceScan(null, null, (error, device) => {
      if(error){
        console.log('error: ', error);
        if(error.errorCode === 601){
          alert('Verifique as conexões');
        }
        manager.stopDeviceScan();
        return;
      }
      if(device && device.name){
        setDevices(prevDevices => {
          if(!prevDevices.some(d => d.id === device.id)){
            return [...prevDevices, device];
          }
          return prevDevices;
        });
      }
    });
    setTimeout(() => {
      manager.stopDeviceScan();
    }, 5000);
  };

  return(
    <View style={styles.container}>
      <Text>Dispositivos encontrados</Text>
      <Button title="Scan Devices" onPress={scanForDevices}/>
      <FlatList
        data={devices}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <Text style={styles.deviceText}>
            {item.name} --- ({item.id})
          </Text>
        )}
      />
    </View>
  );
};

export default BleScannerComponent;

const styles = StyleSheet.create({
  container: {flex: 1, padding: 20},
  deviceText: {fontSize: 16, padding: 10}
});