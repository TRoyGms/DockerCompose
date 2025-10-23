import os
import mysql.connector
from mysql.connector import Error
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

# from dotenv import load_dotenv
# load_dotenv()

# --- Configuración de la App ---
app = FastAPI(
    title="API de Lista de Tareas (To-Do List)",
    description="API para gestionar tareas (CRUD) y cumplir con los requisitos de la clase.",
    version="1.0.0"
)

# --- Modelos de Datos (Pydantic) ---
# Modelo para crear una nueva tarea (solo necesita el texto)
class TodoCreate(BaseModel):
    task: str

# Modelo para representar una tarea que sale de la BD (con ID, etc.)
class Todo(BaseModel):
    id: int
    task: str
    is_completed: bool

# Modelo para recibir el texto actualizado
class TodoUpdate(BaseModel):
    task: str

# --- Configuración de CORS ---
origins = [
    "http://localhost:3000", # Para desarrollo local
    "http://localhost:5173",
    "http://localhost",      # Para el deploy en EC2 (puerto 80)
    "http://52.91.116.113",
    # Si usas la IP de EC2, también deberías agregarla
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Conexión a la Base de Datos ---
def get_db_connection():
    try:
        # Leemos las variables de entorno
        conn = mysql.connector.connect(
            host=os.getenv("DB_HOST"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_NAME")
        )
        return conn
    except Error as e:
        print(f"Error conectando a MySQL: {e}")
        return None

# --- Endpoints de la Tarea ---

# 1. Endpoint con tu apellido (Requisito)
@app.get(
    "/vazquez",
    summary="Obtener mi nombre",
    description="Endpoint de requisito de la tarea. Devuelve el nombre completo del desarrollador (Rodrigo Vazquez Reyes)."
)
def get_full_name():
    return {
        "nombre_completo": "Rodrigo Vazquez Reyes",
        "mensaje": "Endpoint con mi apellido funcionando correctamente. :D"
    }

# --- Endpoints CRUD para "To-Do List" ---

# CREATE
@app.post(
    "/todos", 
    response_model=Todo,
    summary="Crear una nueva tarea",
    description="Añade una nueva tarea a la base de datos. Solo necesita el texto de la tarea."
)
def create_todo(todo: TodoCreate):
    conn = get_db_connection()
    if conn is None:
        raise HTTPException(status_code=503, detail="No se pudo conectar a la base de datos")
    
    cursor = conn.cursor(dictionary=True)
    query = "INSERT INTO todos (task) VALUES (%s)"
    cursor.execute(query, (todo.task,))
    conn.commit()
    
    new_id = cursor.lastrowid
    cursor.close()
    conn.close()
    
    return {"id": new_id, "task": todo.task, "is_completed": False}

# READ (All)
@app.get(
    "/todos", 
    response_model=List[Todo],
    summary="Obtener todas las tareas",
    description="Devuelve una lista de todos los objetos 'todo' presentes en la base de datos, ordenados por ID descendente."
)
def read_todos():
    conn = get_db_connection()
    if conn is None:
        raise HTTPException(status_code=503, detail="No se pudo conectar a la base de datos")
        
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, task, is_completed FROM todos ORDER BY id DESC")
    todos = cursor.fetchall()
    cursor.close()
    conn.close()
    return todos

# UPDATE (Marcar como completada - PUT)
@app.put(
    "/todos/{todo_id}", 
    response_model=Todo,
    summary="Marcar/Desmarcar tarea como completada",
    description="Actualiza el estado 'is_completed' de una tarea. Si está en 'false', la cambia a 'true' y viceversa."
)
def update_todo_status(todo_id: int):
    conn = get_db_connection()
    if conn is None:
        raise HTTPException(status_code=503, detail="No se pudo conectar a la base de datos")

    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT is_completed FROM todos WHERE id = %s", (todo_id,))
    current = cursor.fetchone()
    if not current:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
    
    new_status = not current['is_completed']
    query = "UPDATE todos SET is_completed = %s WHERE id = %s"
    cursor.execute(query, (new_status, todo_id))
    conn.commit()
    
    cursor.execute("SELECT id, task, is_completed FROM todos WHERE id = %s", (todo_id,))
    updated_todo = cursor.fetchone()
    cursor.close()
    conn.close()
    return updated_todo

# UPDATE (Editar texto - PATCH)
@app.patch(
    "/todos/{todo_id}", 
    response_model=Todo,
    summary="Editar el texto de una tarea",
    description="Actualiza el contenido/texto de una tarea específica, identificada por su ID. Este endpoint no modifica el estado de 'completado'."
)
def edit_todo_text(todo_id: int, todo_update: TodoUpdate):
    conn = get_db_connection()
    if conn is None:
        raise HTTPException(status_code=503, detail="No se pudo conectar a la base de datos")

    cursor = conn.cursor(dictionary=True)
    
    query = "UPDATE todos SET task = %s WHERE id = %s"
    cursor.execute(query, (todo_update.task, todo_id))
    
    if cursor.rowcount == 0:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
        
    conn.commit()
    
    cursor.execute("SELECT id, task, is_completed FROM todos WHERE id = %s", (todo_id,))
    updated_todo = cursor.fetchone()
    cursor.close()
    conn.close()
    return updated_todo

# DELETE
@app.delete(
    "/todos/{todo_id}", 
    response_model=dict,
    summary="Eliminar una tarea",
    description="Elimina permanentemente una tarea de la base de datos usando su ID."
)
def delete_todo(todo_id: int):
    conn = get_db_connection()
    if conn is None:
        raise HTTPException(status_code=503, detail="No se pudo conectar a la base de datos")
        
    cursor = conn.cursor()
    query = "DELETE FROM todos WHERE id = %s"
    cursor.execute(query, (todo_id,))
    conn.commit()
    
    if cursor.rowcount == 0:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
        
    cursor.close()
    conn.close()
    return {"mensaje": "Tarea eliminada exitosamente"}