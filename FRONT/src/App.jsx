import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
// Importamos los iconos
import { FaPencilAlt, FaTrash } from 'react-icons/fa';

// --- Constantes y Setup ---
const MySwal = withReactContent(Swal);
// const API_URL = 'http://localhost:8000';
const API_URL = `http://${window.location.hostname}:8000`; // Para EC2

// --- Componente Principal ---
function App() {
  // --- Estados ---
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState('');
  const [nombreCompleto, setNombreCompleto] = useState('...'); // Se llenará al presionar el botón
  
  // ¡NUEVO ESTADO! Para controlar la visibilidad del botón
  const [isNameLoaded, setIsNameLoaded] = useState(false);
  
  // Estados para la edición
  const [editingTodoId, setEditingTodoId] = useState(null); // ID de la tarea en edición
  const [editText, setEditText] = useState('');           // Texto nuevo de esa tarea

  // --- Carga Inicial ---
  useEffect(() => {
    // ¡YA NO cargamos el nombre aquí!
    // Solo cargamos las tareas
    fetchTodos();
  }, []);

  // --- Funciones de API (CRUD) ---

  // REQUISITO: Cargar tu nombre (¡AHORA CONECTADO AL BOTÓN!)
  const fetchNombreCompleto = async () => {
    try {
      const response = await axios.get(`${API_URL}/vazquez`);
      setNombreCompleto(response.data.nombre_completo);
      setIsNameLoaded(true); // <--- ¡Ocultamos el botón!
    } catch (error) {
      console.error("Error cargando el nombre:", error);
      setIsNameLoaded(false); // Dejamos el botón por si quiere reintentar
      MySwal.fire({
        title: 'Error de Red',
        text: 'No se pudo cargar el nombre. ¿La API está encendida?',
        icon: 'error',
        background: '#2C2C2C',
        color: '#FFFFFF'
      });
    }
  };

  // READ (Leer todas)
  const fetchTodos = async () => {
    try {
      const response = await axios.get(`${API_URL}/todos`);
      setTodos(response.data);
    } catch (error) {
      console.error("Error cargando tareas:", error);
    }
  };

  // CREATE (Añadir nueva)
  const addTodo = async (e) => {
    e.preventDefault();
    if (!task) return;
    try {
      await axios.post(`${API_URL}/todos`, { task: task });
      setTask('');
      fetchTodos();
      MySwal.fire({
        title: '¡Agregada!',
        text: 'Tu nueva tarea está lista.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        background: '#2C2C2C',
        color: '#FFFFFF'
      });
    } catch (error) {
      console.error("Error creando tarea:", error);
    }
  };

  // UPDATE (Marcar/desmarcar)
  const toggleTodo = async (id) => {
    try {
      await axios.put(`${API_URL}/todos/${id}`);
      fetchTodos();
    } catch (error) {
      console.error("Error actualizando estado:", error);
    }
  };

  // DELETE (Borrar) - ¡CON CONFIRMACIÓN!
  const handleDelete = (id) => {
    MySwal.fire({
      title: '¿Estás seguro?',
      text: "¡No podrás revertir esto!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Sí, ¡bórrala!',
      cancelButtonText: 'Cancelar',
      background: '#2C2C2C',
      color: '#FFFFFF'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_URL}/todos/${id}`);
          fetchTodos();
          MySwal.fire({
            title: '¡Borrada!',
            text: 'Tu tarea ha sido eliminada.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
            background: '#2C2C2C',
            color: '#FFFFFF'
          });
        } catch (error) {
          console.error("Error eliminando tarea:", error);
          MySwal.fire('Error', 'No se pudo eliminar la tarea.', 'error');
        }
      }
    });
  };

  // --- Funciones de Edición ---

  // Inicia el modo edición
  const startEditing = (todo) => {
    setEditingTodoId(todo.id);
    setEditText(todo.task);
  };

  // Cancela la edición
  const cancelEditing = () => {
    setEditingTodoId(null);
    setEditText('');
  };

  // Guarda la edición (llama al PATCH)
  const saveEdit = async (id) => {
    if (!editText) return;
    try {
      await axios.patch(`${API_URL}/todos/${id}`, { task: editText });
      setEditingTodoId(null);
      setEditText('');
      fetchTodos();
      MySwal.fire({
        title: '¡Actualizada!',
        text: 'Tu tarea ha sido modificada.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        background: '#2C2C2C',
        color: '#FFFFFF'
      });
    } catch (error) {
      console.error("Error guardando edición:", error);
    }
  };


  // --- RENDERIZADO (HTML con Tailwind) ---
  return (
    // Fondo de toda la app
    <div className="bg-[#212121] min-h-screen p-4 sm:p-8 text-gray-200">
      <div className="max-w-3xl mx-auto">
        
        {/* Título (¡MODIFICADO!) */}
        <h1 className="text-4xl sm:text-5xl font-bold text-center text-[#EF4444] mb-10 flex items-center justify-center gap-3 flex-wrap">
          <span>Tareas de:</span>
          {
            isNameLoaded ? (
              // Si el nombre SÍ está cargado, muéstralo
              <span className="text-[#EF4444]">{nombreCompleto}</span>
            ) : (
              // Si NO está cargado, muestra el botón
              <button
                onClick={fetchNombreCompleto}
                className="text-2xl font-semibold bg-red-500/50 text-white px-4 py-2 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                Get Nombre
              </button>
            )
          }
        </h1>

        {/* Formulario para crear tareas */}
        <form className="flex gap-2 mb-8" onSubmit={addTodo}>
          <input 
            type="text" 
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="Escribe una nueva actividad..."
            className="flex-grow p-3 rounded-lg bg-[#2C2C2C] text-gray-200 placeholder-gray-500 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#c43a3a] transition-all"
          />
          <button 
            type="submit"
            className="bg-[#EF4444] text-white font-bold p-3 rounded-lg hover:bg-[#DC2626] transition-colors shadow-md"
          >
            Agregar
          </button>
        </form>

        {/* Lista de tareas */}
        <div className="space-y-4">
          {todos.map(todo => (
            <div key={todo.id}>
              
              {/* --- MODO EDICIÓN (Mini Formulario) --- */}
              {editingTodoId === todo.id ? (
                <div className="bg-[#212121] p-4 rounded-lg shadow-lg flex flex-col gap-3 ring-2 ring-[#EF4444]">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    autoFocus
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={cancelEditing}
                      className="px-4 py-2 bg-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-500 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => saveEdit(todo.id)}
                      className="px-4 py-2 bg-green-600 rounded-lg text-sm font-semibold hover:bg-green-500 transition-colors"
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              
              ) : (

                /* --- MODO VISTA NORMAL --- */
                <div className="bg-[#2C2C2C] p-4 rounded-lg shadow-lg flex items-center gap-4 transition-all hover:shadow-xl">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={todo.is_completed}
                    onChange={() => toggleTodo(todo.id)}
                    className="h-6 w-6 rounded text-[#EF4444] bg-gray-700 border-gray-600 focus:ring-[#EF4444] focus:ring-offset-[#212121]"
                  />
                  {/* Texto de la tarea */}
                  <span className={`flex-grow text-lg ${todo.is_completed ? 'line-through text-gray-500' : ''}`}>
                    {todo.task}
                  </span>
                  {/* Botones de Acción */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => startEditing(todo)}
                      className="text-gray-500 hover:text-yellow-400 transition-colors"
                      title="Editar"
                    >
                      <FaPencilAlt /> {/* Icono de React-Icons */}
                    </button>
                    <button
                      onClick={() => handleDelete(todo.id)}
                      className="text-gray-500 hover:text-[#EF4444] transition-colors"
                      title="Eliminar"
                    >
                      <FaTrash /> {/* Icono de React-Icons */}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
      </div>
    </div>
  );
}

export default App;