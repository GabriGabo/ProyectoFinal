// este es el codigo que implementa singelton
class TaskManager {
    constructor() {
        if (TaskManager.instance) {
            return TaskManager.instance;
        }
        this.tasks = this.loadFromLocalStorage();
        this.observers = [];
        TaskManager.instance = this;
    }

    addTask(task) {
        this.tasks.push(task);
        this.saveToLocalStorage();
        this.notify();
    }

    removeTask(index) {
        if (index > -1 && index < this.tasks.length) {
            this.tasks.splice(index, 1);
            this.saveToLocalStorage();
            this.notify();
        }
    }

    getTasks() {
        return this.tasks;
    }

    // Observer: Añadir observadores
    addObserver(observer) {
        this.observers.push(observer);
    }

    // Observer: Notificar a los observadores
    notify() {
        this.observers.forEach(observer => observer.update(this.tasks));
    }

    //LocalStorage(gracias a videos descubri que esta funcion te permite almacenar los datos dentro del navegador sin necesidad de una base de datos(funciona de manera muy similar) aunque no es muy recomendado para proyectos que tengan una buena demanda de recusos(nada recomendado y poco seguro ya que los datos se almacenan en el mismo navegador))
    saveToLocalStorage() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    // este codigo me permite almacenar los datos en el LocalStorage(este codigo me apoye de los videos de referencia y de chat gpt para poder integrarlo(ya se como funciona aunque aun esta un pco ))
    loadFromLocalStorage() {
        const tasks = localStorage.getItem('tasks');
        return tasks ? JSON.parse(tasks) : [];
    }
}

// Observador: Vista de la lista de tareas
class TaskView {
    constructor(taskListElement) {
        this.taskListElement = taskListElement;
    }

    update(tasks) {
        // Limpiar la lista de tareas
        this.taskListElement.innerHTML = '';

        // Mostrar las tareas actualizadas
        tasks.forEach((task, index) => {
            const taskItem = document.createElement('div');
            taskItem.className = 'todo-item';
            taskItem.innerHTML = `
                <label>
                    <input type="checkbox" ${task.done ? 'checked' : ''}>
                </label>
                <div class="todo-content">
                    <input type="text" value="${task.content}" readonly>
                </div>
                <div class="actions">
                    <button class="edit">Editar</button>
                    <button class="delete">Eliminar</button>
                </div>
            `;

            // Marcar tarea como completada
            const checkbox = taskItem.querySelector('input[type="checkbox"]');
            if (task.done) {
                taskItem.classList.add('done');
            }
            checkbox.addEventListener('change', () => {
                task.done = checkbox.checked;
                taskManager.saveToLocalStorage();
                if (task.done) {
                    taskItem.classList.add('done');
                } else {
                    taskItem.classList.remove('done');
                }
            });

            // Botón de eliminar
            const deleteBtn = taskItem.querySelector('.delete');
            deleteBtn.addEventListener('click', () => {
                taskManager.removeTask(index);
            });

            // Botón de editar
            const editBtn = taskItem.querySelector('.edit');
            const taskInput = taskItem.querySelector('.todo-content input');
            editBtn.addEventListener('click', () => {
                if (editBtn.textContent.toLowerCase() === 'editar') {
                    taskInput.removeAttribute('readonly');
                    taskInput.focus();
                    editBtn.textContent = 'Guardar';
                } else {
                    taskInput.setAttribute('readonly', true);
                    task.content = taskInput.value;
                    taskManager.saveToLocalStorage();
                    editBtn.textContent = 'Editar';
                }
            });

            this.taskListElement.appendChild(taskItem);
        });
    }
}

// Inicializar TaskManager y TaskView
const taskManager = new TaskManager();
const taskListElement = document.getElementById('taskList');
const taskView = new TaskView(taskListElement);

// Añadir TaskView como observador de TaskManager
taskManager.addObserver(taskView);

// Inicializar la vista con las tareas existentes
taskView.update(taskManager.getTasks());

// Manejador de eventos para agregar tareas
document.getElementById('addTaskBtn').addEventListener('click', () => {
    const taskInput = document.getElementById('taskInput');
    const taskContent = taskInput.value.trim();

    if (taskContent) {
        const newTask = {
            content: taskContent,
            done: false
        };
        taskManager.addTask(newTask);
        taskInput.value = '';
    }
});

