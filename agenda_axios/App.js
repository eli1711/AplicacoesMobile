import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, Modal, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';

// URL base da API para os compromissos
const API_BASE_URL = "http://10.110.12.39:3000/appointments";

// Componente principal da aplicação
export default function App() {

  // Estado para armazenar a lista de compromissos
  const [appointments, setAppointments] = useState([]);

  // Estado para controlar a visibilidade do modal
  const [modalVisible, setModalVisible] = useState(false);

  // Estado para armazenar o compromisso que está sendo editado (null se for um novo)
  const [editingAppointment, setEditingAppointment] = useState(null);
  
  // Estados para os campos do formulário
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [status, setStatus] = useState('pendente');
  // Estados para controlar a exibição dos seletores de data e hora
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Função para buscar todos os compromissos da API
  const fetchAppointments = async () => {
    try {
      // Faz uma requisição GET para a API
      const response = await axios.get(API_BASE_URL);
      // Atualiza o estado com os dados recebidos
      setAppointments(response.data);
    } catch (error) {
      // Exibe erro no console caso ocorra algum problema
      console.error("Erro ao buscar compromissos:", error.message);
    }
  };

  // Função para criar um novo compromisso
  const createAppointment = async () => {
    try {
      // Prepara os dados do compromisso para enviar à API
      const appointmentData = {
        title,
        notes,
        // Formata a data para o formato AAAA-MM-DD
        date: date.toISOString().split('T')[0],
        // Formata a hora para o formato HH:MM
        time: time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        status
      };

      // Faz uma requisição POST para criar o compromisso
      await axios.post(API_BASE_URL, appointmentData);
      // Limpa o formulário
      resetForm();
      // Fecha o modal
      setModalVisible(false);
      // Recarrega a lista de compromissos
      fetchAppointments();
    } catch (error) {
      // Exibe erro no console caso ocorra algum problema
      console.error("Erro ao criar compromisso:", error.message);
    }
  };

  // Função para atualizar um compromisso existente
  const updateAppointment = async () => {
    try {
      // Prepara os dados atualizados do compromisso
      const appointmentData = {
        title,
        notes,
        // Formata a data para o formato AAAA-MM-DD
        date: date.toISOString().split('T')[0],
        // Formata a hora para o formato HH:MM
        time: time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        status
      };

      // Faz uma requisição PUT para atualizar o compromisso
      await axios.put(`${API_BASE_URL}/${editingAppointment.id}`, appointmentData);
      // Limpa o formulário
      resetForm();
      // Fecha o modal
      setModalVisible(false);
      // Recarrega a lista de compromissos
      fetchAppointments();
    } catch (error) {
      // Exibe erro no console caso ocorra algum problema
      console.error("Erro ao atualizar compromisso:", error.message);
    }
  };

  // Função para excluir um compromisso
  const deleteAppointment = async (id) => {
    try {
      // Faz uma requisição DELETE para remover o compromisso
      await axios.delete(`${API_BASE_URL}/${id}`);
      // Recarrega a lista de compromissos
      fetchAppointments();
    } catch (error) {
      // Exibe erro no console caso ocorra algum problema
      console.error("Erro ao excluir compromisso:", error.message);
    }
  };

  // Função para limpar o formulário
  const resetForm = () => {
    setTitle('');
    setNotes('');
    setDate(new Date());
    setTime(new Date());
    setStatus('pendente');
    setEditingAppointment(null);
  };

  // Função para abrir o modal no modo de edição
  const openEditModal = (appointment) => {
    // Preenche o formulário com os dados do compromisso selecionado
    setEditingAppointment(appointment);
    setTitle(appointment.title);
    setNotes(appointment.notes);
    // Converte a string de data para um objeto Date
    setDate(new Date(appointment.date));
    // Converte a string de hora para um objeto Date (usa uma data fixa como base)
    setTime(new Date(`2000-01-01T${appointment.time}`));
    setStatus(appointment.status);
    // Abre o modal
    setModalVisible(true);
  };

  // Função para fechar o modal e limpar o formulário
  const closeModal = () => {
    setModalVisible(false);
    resetForm();
  };

  // Função para formatar a data para exibição
  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  // Função para obter a cor correspondente ao status
  const getStatusColor = (status) => {
    switch (status) {
      case 'pendente': return '#FFA500'; // Laranja
      case 'agendado': return '#1E90FF'; // Azul
      case 'concluído': return '#32CD32'; // Verde
      default: return '#666'; // Cinza
    }
  };

  // useEffect para carregar os compromissos quando o componente é montado
  useEffect(() => {
    fetchAppointments();
  }, []);

  // Renderização do componente
  return (
    <View style={styles.container}>
      {/* Cabeçalho da aplicação */}
      <Text style={styles.header}>Agenda de Compromissos</Text>
      
      {/* Botão para abrir o modal de novo compromisso */}
      <Button title="Novo Compromisso" onPress={() => setModalVisible(true)} />
      
      {/* Lista de compromissos */}
      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
        renderItem={({ item }) => (
          <View style={styles.appointmentItem}>
            {/* Cabeçalho do item com título e status */}
            <View style={styles.appointmentHeader}>
              <Text style={styles.appointmentTitle}>{item.title}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>
            
            {/* Anotações do compromisso */}
            <Text style={styles.appointmentNotes}>{item.notes}</Text>
            
            {/* Detalhes do compromisso (data e hora) */}
            <View style={styles.appointmentDetails}>
              <Text style={styles.detailText}>Data: {formatDate(item.date)}</Text>
              <Text style={styles.detailText}>Hora: {item.time}</Text>
            </View>
            
            {/* Ações do compromisso (editar e excluir) */}
            <View style={styles.appointmentActions}>
              <Button title="Editar" onPress={() => openEditModal(item)} />
              <Button title="Excluir" color="#FF4500" onPress={() => deleteAppointment(item.id)} />
            </View>
          </View>
        )}
      />

      {/* Modal para adicionar/editar compromissos */}
      <Modal visible={modalVisible} animationType="slide">
        <ScrollView style={styles.modalContainer}>
          <Text style={styles.modalTitle}>
            {editingAppointment ? 'Editar Compromisso' : 'Novo Compromisso'}
          </Text>
          
          {/* Campo de entrada para o título */}
          <TextInput
            style={styles.input}
            placeholder="Título do compromisso"
            value={title}
            onChangeText={setTitle}
          />
          
          {/* Campo de entrada para as anotações (multilinha) */}
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Anotações"
            value={notes}
            onChangeText={setNotes}
            multiline
          />
          
          {/* Seletor de data */}
          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Data:</Text>
            <Button 
              title={date.toLocaleDateString('pt-BR')} 
              onPress={() => setShowDatePicker(true)} 
            />
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setDate(selectedDate);
                }}
              />
            )}
          </View>
          
          {/* Seletor de hora */}
          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Hora:</Text>
            <Button 
              title={time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} 
              onPress={() => setShowTimePicker(true)} 
            />
            {showTimePicker && (
              <DateTimePicker
                value={time}
                mode="time"
                display="default"
                onChange={(event, selectedTime) => {
                  setShowTimePicker(false);
                  if (selectedTime) setTime(selectedTime);
                }}
              />
            )}
          </View>
          
          {/* Seletor de status */}
          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Status:</Text>
            <Picker
              selectedValue={status}
              onValueChange={(itemValue) => setStatus(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Pendente" value="pendente" />
              <Picker.Item label="Agendado" value="agendado" />
              <Picker.Item label="Concluído" value="concluído" />
            </Picker>
          </View>
          
          {/* Botões de ação do modal */}
          <View style={styles.modalButtons}>
            <Button
              title={editingAppointment ? "Atualizar" : "Criar"}
              onPress={editingAppointment ? updateAppointment : createAppointment}
            />
            <Button title="Cancelar" color="#666" onPress={closeModal} />
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
}

// Estilos da aplicação
const styles = StyleSheet.create({
  // Container principal
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  // Estilo do cabeçalho
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  // Estilo da lista
  list: {
    marginTop: 20,
  },
  // Estilo do item de compromisso
  appointmentItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  // Estilo do cabeçalho do item
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  // Estilo do título do compromisso
  appointmentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  // Estilo do badge de status
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  // Estilo do texto do status
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Estilo das anotações
  appointmentNotes: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  // Estilo dos detalhes (data e hora)
  appointmentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  // Estilo do texto dos detalhes
  detailText: {
    fontSize: 12,
    color: '#888',
  },
  // Estilo das ações (botões editar e excluir)
  appointmentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  // Estilo do container do modal
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  // Estilo do título do modal
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  // Estilo dos campos de entrada
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  // Estilo da área de texto (anotações)
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  // Estilo do container dos seletores
  pickerContainer: {
    marginBottom: 15,
  },
  // Estilo dos rótulos
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '500',
  },
  // Estilo do seletor (Picker)
  picker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  // Estilo dos botões do modal
  modalButtons: {
    marginTop: 20,
    gap: 10,
  },
});