const BACKEND_ROOT_URL ='http://localhost:3001'

const list = <HTMLUListElement>document.querySelector('#todolist')
const input = <HTMLInputElement>document.querySelector('#newtodo')

input.disabled = true

fetch(BACKEND_ROOT_URL)
.then(response => response.json())
.then((response) => {
    response.forEach(node => {
        renderTask(node.description)
    });
    input.disabled = false
},(error) => {
    alert(error)
})

input.addEventListener('keypress', event => {
    if(event.key === "Enter") {
        event.preventDefault()
        const text = input.value.trim()
        if(text !== '') {
            const list_item = document.createElement('li')
            list_item.setAttribute('class','list-group-item')
            list_item.innerHTML = text
            list.append(list_item)
            input.value = ''
        }
    }
})

input.addEventListener('keypress', event => {
    if(event.key === "Enter") {
        event.preventDefault()
        const text = input.value.trim()
        if(text !== '') {
            renderTask (text) 
            input.value = ''
        }
    }
})

const renderTask = (text) => {
    const list_item = document.createElement('li')
    list_item.setAttribute('class','list-group-item')
    list_item.innerHTML = text
    list.append(list_item)
}

