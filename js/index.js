const BACKEND_ROOT_URL = 'http://localhost:3001';
import { Todos } from './class/Todos.js';
const todos = new Todos(BACKEND_ROOT_URL);
const list = document.querySelector('#feedbacklist');
const input = document.querySelector('#newfeedback');
const differentContainer = document.getElementById('different-container');
input.addEventListener('keypress', event => {
    if (event.key === "Enter") {
        event.preventDefault();
        const text = input.value.trim();
        if (text !== '') {
            const list_item = document.createElement('li');
            list_item.setAttribute('class', 'list-group-item');
            list_item.innerHTML = text;
            differentContainer.append(list_item); // append to different container
            input.value = '';
        }
    }
});
input.disabled = true;
fetch(BACKEND_ROOT_URL)
    .then(response => response.json())
    .then((response) => {
    response.forEach(node => {
        renderTask(node.description);
    });
    input.disabled = false;
}, (error) => {
    alert(error);
});
todos.getTasks().then((tasks) => {
    tasks.forEach((task) => {
        renderTask(task);
    });
    input.disabled = false;
}).catch(error => {
    alert(error);
});
input.addEventListener('keypress', event => {
    if (event.key === "Enter") {
        event.preventDefault();
        const text = input.value.trim();
        if (text !== '') {
            // renderTask(text)
            //input.value = ''
            todos.addTask(text).then((task) => {
                input.value = '';
                input.focus();
                renderTask(task);
            }).catch(error => {
                alert(error);
            });
        }
        //event.preventDefault()
    }
});
const renderTask = (task /*text*/) => {
    const list_item = document.createElement('li');
    list_item.setAttribute('class', 'list-group-item');
    list_item.setAttribute('data-key', task.id.toString());
    //list_item.innerHTML = task.text
    renderSpan(list_item, task.text);
    renderLink(list_item, task.id);
    list.append(list_item);
};
const renderSpan = (list_item, text) => {
    const span = list_item.appendChild(document.createElement('span'));
    span.innerHTML = text;
};
const renderLink = (list_item, id) => {
    const link = list_item.appendChild(document.createElement('a'));
    link.innerHTML = '<i class="bi bi-trash"></i>';
    link.setAttribute('style', 'float: right');
    link.addEventListener('click', (event) => {
        todos.removeTask(id)
            .then((id) => {
            const elementToRemove = document.querySelector(`[data-key='${id}']`);
            if (elementToRemove) {
                list.removeChild(elementToRemove);
            }
        }).catch((error) => {
            alert(error);
        });
    });
};
input.addEventListener('keypress', event => {
    if (event.key === "Enter") {
        event.preventDefault();
        const text = input.value.trim();
        if (text !== '') {
            const json = JSON.stringify({ description: text });
            fetch(BACKEND_ROOT_URL + '/new', {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: json
            })
                .then(response => response.json())
                .then((response) => {
                // renderTask(text)
                //input.value = ''
            }, (error) => {
                alert(error);
            });
        }
    }
});
