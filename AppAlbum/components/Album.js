import React, { useState, useEffect, useRef } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    FlatList, 
    TouchableOpacity, 
    Image, 
    Alert,
    Modal,
    TextInput,
    Button 
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system/legacy';


const API_URL = 'http://10.110.12.19:3000';

// Componente da Câmera
function CameraComponent({ onPhotoTaken, onCancel }) {
    const [facing, setFacing] = useState('back');
    const [permission, requestPermission] = useCameraPermissions();
    const [capturedPhoto, setCapturedPhoto] = useState(null);
    const [photoTitle, setPhotoTitle] = useState('');
    const [photoDescription, setPhotoDescription] = useState('');
    const cameraRef = useRef(null);

    useEffect(() => { requestPermission(); }, []);

    if (!permission) return <View />;
    if (!permission.granted) {
        return (
            <View style={cameraStyles.container}>
                <Text style={{ textAlign: 'center' }}>Precisamos da sua permissão para acessar a câmera</Text>
                <Button onPress={requestPermission} title='Conceder Permissão!' />
            </View>
        )
    }

    function toggleCameraFacing() { setFacing(current => (current === 'back' ? 'front' : 'back')); }

    async function takePicture() {
        if (cameraRef.current) {
            const photo = await cameraRef.current.takePictureAsync();
            setCapturedPhoto(photo);
        }
    }

    async function savePhoto() {
        if (!photoTitle.trim()) { Alert.alert('Erro', 'Por favor, insira um título para a foto'); return; }
        if (capturedPhoto) {
            const fileName = `photo_${Date.now()}.jpg`;
            const newPath = `${FileSystem.documentDirectory}${fileName}`;
            try {
                await FileSystem.moveAsync({ from: capturedPhoto.uri, to: newPath });
                onPhotoTaken({ uri: newPath, title: photoTitle, description: photoDescription, date: new Date().toISOString() });
                setCapturedPhoto(null); setPhotoTitle(''); setPhotoDescription('');
            } catch (error) { console.error('Erro ao salvar foto:', error); Alert.alert('Erro', 'Não foi possível salvar a foto'); }
        }
    }

    function cancelPhoto() { setCapturedPhoto(null); setPhotoTitle(''); setPhotoDescription(''); if (onCancel) onCancel(); }

    if (capturedPhoto) {
        return (
            <View style={cameraStyles.container}>
                <Image source={{ uri: capturedPhoto.uri }} style={cameraStyles.preview} />
                <View style={cameraStyles.formContainer}>
                    <TextInput style={cameraStyles.input} placeholder="Título da foto" value={photoTitle} onChangeText={setPhotoTitle} />
                    <TextInput style={[cameraStyles.input, cameraStyles.textArea]} placeholder="Descrição da foto" value={photoDescription} onChangeText={setPhotoDescription} multiline numberOfLines={3} />
                    <View style={cameraStyles.buttonRow}>
                        <Button title="Cancelar" onPress={cancelPhoto} color="#666" />
                        <Button title="Salvar Foto" onPress={savePhoto} />
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={cameraStyles.container}>
            <CameraView style={cameraStyles.camera} facing={facing} ref={cameraRef} />
            <View style={cameraStyles.overlayContainer}>
                <TouchableOpacity style={cameraStyles.overlayButton} onPress={toggleCameraFacing}>
                    <Text style={cameraStyles.buttonText}>🔄 Virar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={cameraStyles.captureButton} onPress={takePicture}>
                    <Text style={cameraStyles.captureButtonText}>📷</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// Componente Principal do Álbum
function Album() {
    const [photos, setPhotos] = useState([]);
    const [showCamera, setShowCamera] = useState(false);
    const [editingPhoto, setEditingPhoto] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');

    // Carregar fotos do servidor
    const loadPhotos = async () => {
        try {
            console.log('Tentando carregar fotos de:', API_URL);
            const response = await fetch(`${API_URL}/fotos`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            console.log('Fotos carregadas com sucesso:', data.length, 'fotos');
            setPhotos(data);
        } catch (error) {
            console.error('Erro ao carregar fotos do servidor. Usando dados locais...', error);
            setPhotos([
                { id: 1, titulo_foto: "Bem-vindo ao Álbum!", descricao_foto: "Toque em 'Nova Foto' para adicionar suas fotos", data_foto: new Date().toISOString(), uri: "https://via.placeholder.com/300x200/4CAF50/FFFFFF?text=App+Album" }
            ]);
        }
    };

    useEffect(() => { loadPhotos(); }, []);

    const handlePhotoTaken = async (photoData) => {
        try {
            const newPhoto = { titulo_foto: photoData.title, descricao_foto: photoData.description, data_foto: photoData.date, uri: photoData.uri };
            console.log('Salvando foto no servidor...');
            const response = await fetch(`${API_URL}/fotos`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newPhoto) });
            if (response.ok) {
                const savedPhoto = await response.json();
                setPhotos(prev => [...prev, savedPhoto]);
                setShowCamera(false);
                Alert.alert('Sucesso', 'Foto salva com sucesso no servidor!');
            } else { throw new Error('Servidor não respondeu'); }
        } catch (error) {
            console.error('Erro ao salvar no servidor. Salvando localmente...', error);
            const localPhoto = { id: Date.now(), titulo_foto: photoData.title, descricao_foto: photoData.description, data_foto: photoData.date, uri: photoData.uri };
            setPhotos(prev => [...prev, localPhoto]);
            setShowCamera(false);
            Alert.alert('Sucesso', 'Foto salva localmente!');
        }
    };

    const deletePhoto = (photo) => {
        Alert.alert(
            'Confirmar exclusão',
            `Deseja excluir a foto "${photo.titulo_foto}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                { 
                    text: 'Excluir', style: 'destructive',
                    onPress: async () => {
                        try {
                            if (photo.id && typeof photo.id === 'number' && photo.id > 1) await fetch(`${API_URL}/fotos/${photo.id}`, { method: 'DELETE' });
                            if (photo.uri && !photo.uri.includes('placeholder')) try { await FileSystem.deleteAsync(photo.uri); } catch (fileError) { console.warn('Arquivo físico não encontrado:', fileError); }
                            setPhotos(prev => prev.filter(p => p.id !== photo.id));
                            Alert.alert('Sucesso', 'Foto excluída!');
                        } catch (error) {
                            console.error('Erro ao excluir do servidor:', error);
                            setPhotos(prev => prev.filter(p => p.id !== photo.id));
                            Alert.alert('Sucesso', 'Foto excluída localmente!');
                        }
                    }
                }
            ]
        );
    };

    const startEdit = (photo) => { setEditingPhoto(photo); setEditTitle(photo.titulo_foto); setEditDescription(photo.descricao_foto); };

    const saveEdit = async () => {
        if (!editTitle.trim()) { Alert.alert('Erro', 'Por favor, insira um título para a foto'); return; }
        const updatedPhoto = { ...editingPhoto, titulo_foto: editTitle, descricao_foto: editDescription };
        try {
            if (editingPhoto.id && typeof editingPhoto.id === 'number' && editingPhoto.id > 1) await fetch(`${API_URL}/fotos/${editingPhoto.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedPhoto) });
            setPhotos(prev => prev.map(p => p.id === updatedPhoto.id ? updatedPhoto : p));
            setEditingPhoto(null);
            Alert.alert('Sucesso', 'Foto atualizada!');
        } catch (error) {
            console.error('Erro ao atualizar no servidor:', error);
            setPhotos(prev => prev.map(p => p.id === updatedPhoto.id ? updatedPhoto : p));
            setEditingPhoto(null);
            Alert.alert('Sucesso', 'Foto atualizada localmente!');
        }
    };

    const renderPhotoItem = ({ item }) => (
        <View style={styles.photoCard}>
            <Image source={{ uri: item.uri }} style={styles.photoImage} />
            <View style={styles.photoInfo}>
                <Text style={styles.photoTitle}>{item.titulo_foto}</Text>
                <Text style={styles.photoDescription}>{item.descricao_foto}</Text>
                <Text style={styles.photoDate}>{new Date(item.data_foto).toLocaleDateString('pt-BR')}</Text>
            </View>
            <View style={styles.photoActions}>
                <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => startEdit(item)}>
                    <Text style={styles.actionButtonText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => deletePhoto(item)}>
                    <Text style={styles.actionButtonText}>Excluir</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Meu Álbum de Fotos</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => setShowCamera(true)}>
                    <Text style={styles.addButtonText}>+ Nova Foto</Text>
                </TouchableOpacity>
            </View>

            {photos.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>Nenhuma foto no álbum</Text>
                    <Text style={styles.emptyStateSubtext}>Toque em "Nova Foto" para começar</Text>
                </View>
            ) : (
                <FlatList
                    data={photos}
                    renderItem={renderPhotoItem}
                    keyExtractor={item => item.id?.toString()}
                    contentContainerStyle={styles.listContent}
                />
            )}

            <Modal visible={showCamera} animationType="slide">
                <CameraComponent onPhotoTaken={handlePhotoTaken} onCancel={() => setShowCamera(false)} />
            </Modal>

            <Modal visible={!!editingPhoto} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Editar Foto</Text>
                        <TextInput style={styles.input} placeholder="Título da foto" value={editTitle} onChangeText={setEditTitle} />
                        <TextInput style={[styles.input, styles.textArea]} placeholder="Descrição da foto" value={editDescription} onChangeText={setEditDescription} multiline numberOfLines={3} />
                        <View style={styles.modalButtons}>
                            <Button title="Cancelar" onPress={() => setEditingPhoto(null)} color="#666" />
                            <Button title="Salvar" onPress={saveEdit} />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

// Estilos da câmera e gerais (mantidos sem alterações)
const cameraStyles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center' },
    camera: { flex: 1 },
    overlayContainer: { position: 'absolute', bottom: 30, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20 },
    overlayButton: { backgroundColor: 'rgba(0,0,0,0.5)', padding: 15, borderRadius: 10 },
    captureButton: { backgroundColor: '#fff', padding: 20, borderRadius: 50, width: 70, height: 70, justifyContent: 'center', alignItems: 'center' },
    buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    captureButtonText: { fontSize: 24 },
    preview: { flex: 1, resizeMode: 'cover' },
    formContainer: { padding: 20, backgroundColor: 'white' },
    input: { borderWidth: 1, borderColor: '#ddd', padding: 10, marginBottom: 15, borderRadius: 5 },
    textArea: { height: 80, textAlignVertical: 'top' },
    buttonRow: { flexDirection: 'row', justifyContent: 'space-between' }
});

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#ddd' },
    headerTitle: { fontSize: 20, fontWeight: 'bold' },
    addButton: { backgroundColor: '#007AFF', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 5 },
    addButtonText: { color: 'white', fontWeight: 'bold' },
    listContent: { padding: 10 },
    photoCard: { backgroundColor: 'white', borderRadius: 10, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    photoImage: { width: '100%', height: 200, borderTopLeftRadius: 10, borderTopRightRadius: 10 },
    photoInfo: { padding: 15 },
    photoTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
    photoDescription: { fontSize: 14, color: '#666', marginBottom: 5 },
    photoDate: { fontSize: 12, color: '#999' },
    photoActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#eee' },
    actionButton: { flex: 1, padding: 10, alignItems: 'center' },
    editButton: { backgroundColor: '#FFA500', borderBottomLeftRadius: 10 },
    deleteButton: { backgroundColor: '#FF3B30', borderBottomRightRadius: 10 },
    actionButtonText: { color: 'white', fontWeight: 'bold' },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    emptyStateText: { fontSize: 18, color: '#666', marginBottom: 10 },
    emptyStateSubtext: { fontSize: 14, color: '#999', textAlign: 'center' },
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%' },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
    input: { borderWidth: 1, borderColor: '#ddd', padding: 10, marginBottom: 15, borderRadius: 5 },
    textArea: { height: 80, textAlignVertical: 'top' },
    modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
});

export default Album;