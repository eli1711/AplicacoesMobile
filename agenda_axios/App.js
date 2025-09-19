import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, Modal, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
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
    if (!title.trim()) {
      Alert.alert('Atenção', 'Por favor, informe um título para o compromisso.');
      return;
    }
    
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
    if (!title.trim()) {
      Alert.alert('Atenção', 'Por favor, informe um título para o compromisso.');
      return;
    }
    
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
    Alert.alert(
      "Confirmar exclusão",
      "Tem certeza que deseja excluir este compromisso?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        { 
          text: "Excluir", 
          onPress: async () => {
            try {
              // Faz uma requisição DELETE para remover o compromisso
              await axios.delete(`${API_BASE_URL}/${id}`);
              // Recarrega a lista de compromissos
              fetchAppointments();
            } catch (error) {
              // Exibe erro no console caso ocorra algum problema
              console.error("Erro ao excluir compromisso:", error.message);
            }
          } 
        }
      ]
    );
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

  // Função para obter o emoji correspondente ao status
  const getStatusEmoji = (status) => {
    switch (status) {
      case 'pendente': return '⏰';
      case 'agendado': return '📅';
      case 'concluído': return '✅';
      default: return '❓';
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
      <View style={styles.headerContainer}>
        <Text style={styles.header}>📅 Agenda de Compromissos</Text>
        <Text style={styles.subHeader}>Organize seus compromissos de forma simples</Text>
      </View>
      
      {/* Botão para abrir o modal de novo compromisso */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>➕ Novo Compromisso</Text>
      </TouchableOpacity>
      
      {/* Lista de compromissos */}
      {appointments.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateEmoji}>📅</Text>
          <Text style={styles.emptyStateText}>Nenhum compromisso agendado</Text>
          <Text style={styles.emptyStateSubText}>Toque no botão acima para adicionar um novo compromisso</Text>
        </View>
      ) : (
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
                  <Text style={styles.statusEmoji}>{getStatusEmoji(item.status)}</Text>
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>
              
              {/* Anotações do compromisso */}
              {item.notes ? (
                <Text style={styles.appointmentNotes}>{item.notes}</Text>
              ) : null}
              
              {/* Detalhes do compromisso (data e hora) */}
              <View style={styles.appointmentDetails}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailEmoji}>📆</Text>
                  <Text style={styles.detailText}> {formatDate(item.date)}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailEmoji}>⏰</Text>
                  <Text style={styles.detailText}> {item.time}</Text>
                </View>
              </View>
              
              {/* Ações do compromisso (editar e excluir) */}
              <View style={styles.appointmentActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => openEditModal(item)}
                >
                  <Text style={[styles.actionButtonText, { color: '#1E90FF' }]}>✏️ Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => deleteAppointment(item.id)}
                >
                  <Text style={[styles.actionButtonText, { color: '#FF4500' }]}>🗑️ Excluir</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Modal para adicionar/editar compromissos */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView style={styles.modalScrollView}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingAppointment ? '✏️ Editar Compromisso' : '➕ Novo Compromisso'}
                </Text>
                <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
              
              {/* Campo de entrada para o título */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Título *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Digite o título do compromisso"
                  value={title}
                  onChangeText={setTitle}
                />
              </View>
              
              {/* Campo de entrada para as anotações (multilinha) */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Anotações</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Adicione observações sobre o compromisso"
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={4}
                />
              </View>
              
              {/* Seletor de data */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>📆 Data</Text>
                <TouchableOpacity 
                  style={styles.dateTimeButton}
                  onPress={() => setShowDatePicker(true)} 
                >
                  <Text style={styles.dateTimeButtonText}>{date.toLocaleDateString('pt-BR')}</Text>
                </TouchableOpacity>
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
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>⏰ Hora</Text>
                <TouchableOpacity 
                  style={styles.dateTimeButton}
                  onPress={() => setShowTimePicker(true)} 
                >
                  <Text style={styles.dateTimeButtonText}>
                    {time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </TouchableOpacity>
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
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>📊 Status</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={status}
                    onValueChange={(itemValue) => setStatus(itemValue)}
                    style={styles.picker}
                  >
                    <Picker.Item label="⏰ Pendente" value="pendente" />
                    <Picker.Item label="📅 Agendado" value="agendado" />
                    <Picker.Item label="✅ Concluído" value="concluído" />
                  </Picker>
                </View>
              </View>
              
              {/* Botões de ação do modal */}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={editingAppointment ? updateAppointment : createAppointment}
                >
                  <Text style={styles.modalButtonText}>
                    {editingAppointment ? "📝 Atualizar" : "✅ Criar"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={closeModal}
                >
                  <Text style={[styles.modalButtonText, { color: '#666' }]}>❌ Cancelar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Estilos da aplicação
const styles = StyleSheet.create({
  // Container principal
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  // Cabeçalho
  headerContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2c3e50',
  },
  subHeader: {
    fontSize: 16,
    textAlign: 'center',
    color: '#7f8c8d',
    marginTop: 5,
  },
  // Botão de adicionar
  addButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Estado vazio
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7f8c8d',
    marginBottom: 8,
  },
  emptyStateSubText: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
  },
  // Estilo da lista
  list: {
    marginTop: 10,
  },
  // Estilo do item de compromisso
  appointmentItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
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
    color: '#2c3e50',
  },
  // Estilo do badge de status
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusEmoji: {
    marginRight: 4,
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
    marginBottom: 12,
    lineHeight: 20,
  },
  // Estilo dos detalhes (data e hora)
  appointmentDetails: {
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  detailEmoji: {
    marginRight: 5,
  },
  // Estilo do texto dos detalhes
  detailText: {
    fontSize: 14,
    color: '#555',
  },
  // Estilo das ações (botões editar e excluir)
  appointmentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  actionButton: {
    marginLeft: 16,
  },
  actionButtonText: {
    fontWeight: '500',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalScrollView: {
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  // Campos do formulário
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
    color: '#2c3e50',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  // Estilo da área de texto (anotações)
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  // Botões de data/hora
  dateTimeButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f8f9fa',
  },
  dateTimeButtonText: {
    fontSize: 16,
    color: '#333',
  },
  // Estilo do container dos seletores
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f8f9fa',
  },
  // Estilo do seletor (Picker)
  picker: {
    height: 50,
  },
  // Estilo dos botões do modal
  modalButtons: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: '#3498db',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  modalButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: 'white',
  },
});