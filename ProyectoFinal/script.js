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

    // Observer: hey este esta bien facil de explicar con propias palabras 
    //literalmente funciona como un observer del maicra, esta puesto para ver los cambios que pasan por el codigo
    // y luego envia los datos a un notify...
    addObserver(observer) {
        this.observers.push(observer);
    }

    // Observer: Este es como decir que tenemos un bloque de musica que se activa con el observer
    //recibe los datos y envia una señal que al mismo tiempo actualiza los datos por medio del forEach.
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

// probe el cambiar algunas partes de ewte codigo (no funciono asi que lo deje igualito)
// este es donde lit se hace toda la magia de las tareas.
class TaskView {
    constructor(taskListElement) {
        this.taskListElement = taskListElement;
    }

    update(tasks) {
        // va, empezamos viendo que obvio necesitamos subir las tareas tons lo hacemos aqui.
        this.taskListElement.innerHTML = '';

        // hey este si me enchibolo en el video asi que lo corregi usando un truquito -_°
        //pero estan facil como entender las funcionalidades de cada elemento y es que es solo la estrucutra al momento de hacer y terminar una tarea, este codigo es importante porque tambien es el que pasa y activa el observer para que se puedan actualizar los datos.
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

            // este es pa poder decir"hey ya  termine" y guardar la respuesta y lo importante es que aqui esta lo que explicaba el el codigo anterios, aqui es donde mandamos a llamar al "saveToLocalStorage" y de esa manera permite que se guarden los elementos.
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

            // este sirve pa dos cosas
            // o bien terminaste la tarea o ya teaburriste de verla y sabes que ni la vas a hacer.
            const deleteBtn = taskItem.querySelector('.delete');
            deleteBtn.addEventListener('click', () => {
                taskManager.removeTask(index);
            });

            // Botón de editar (ni voy a explicar para que sirve) perooooooooo...
            //las funciones tampoco las explicare porque no lo veo necesario, pero si el if else, 
            const editBtn = taskItem.querySelector('.edit');
            const taskInput = taskItem.querySelector('.todo-content input');
            //gracias a este codigo no es necesario enviar los datos al inicio y hacer el mismo proceso, si no solo accedemos a la informacion que ya esta guardada y nos permite editarla.
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

// Añadir TaskView como observador de TaskManager, este si lo dejo asi porque es el que llama al observer para asi actualizar los datos(el observer lo ve todo)
taskManager.addObserver(taskView);

// literal solo hace un llamado de emergencia del sistema 9-1-1 hombre moribundo con aparente ataque cardiaco necesitamos asistencia de inmediato en el area
taskView.update(taskManager.getTasks());

// es la presa que almacena los datos sin que todo se convierta en un desastre como mi organizacion.
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

