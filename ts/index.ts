import { EventListener } from "./EventListener"
import { Status, Task, statusMap } from "./Task"
import { TaskCollection } from "./TaskCollection"
import { TaskRenderer } from "./TaskRenderer"

class Application {
    private readonly eventListener = new EventListener()
    private readonly taskCollection = new TaskCollection()
    private readonly taskRenderer= new TaskRenderer(
        document.getElementById('todoList') as HTMLElement,
        document.getElementById('doingList') as HTMLElement,
        document.getElementById('doneList') as HTMLElement,
    )
    
    start() {
        const taskItems = this.taskRenderer.renderAll(this.taskCollection)
        const createForm = document.getElementById('createForm') as HTMLElement
        const deleteAllDoneTaskButton = document.getElementById('deleteAllDoneTask') as HTMLElement

        taskItems.forEach(({task, deleteButtonEl})=> {
            this.eventListener.add(task.id, 'click', deleteButtonEl, () => this.handleClickDeleteTask(task))
        })
        
        this.eventListener.add(
            'submit-handler', 'submit', createForm, this.handleSubmit
        )
        this.eventListener.add('click-handler', 'click', deleteAllDoneTaskButton, this.handleClickAllDoneTasks)

        this.taskRenderer.subscribeDragAndDrop(this.handleDragAndDrop)
    }

    private executeDeleteTask = (task: Task) => {
        this.eventListener.remove(task.id)
        this.taskCollection.delete(task)
        this.taskRenderer.remove(task)
    }

    private handleClickAllDoneTasks = () => {
        if(!window.confirm('DONEのタスクを一括削除してよろしいでしょうか？')) return
        const doneTasks = this.taskCollection.filter(statusMap.done)

        doneTasks.forEach((task) => this.executeDeleteTask(task))
    }

    private handleDragAndDrop = (el: Element, sibling: Element | null, newStatus: Status) => {
        const taskId = this.taskRenderer.getId(el)

        if(!taskId) return

        const task = this.taskCollection.find(taskId)

        if(!task) return

        task.update({status: newStatus})
        this.taskCollection.update(task)

        console.log(sibling)
    }

    private handleSubmit = (e: Event) => {
        e.preventDefault()
        const titleInput = document.getElementById('title') as HTMLInputElement

        if(!titleInput.value) return 
        const task = new Task({title: titleInput.value })

        this.taskCollection.add(task)
        const { deleteButtonEl } = this.taskRenderer.append(task)

        this.eventListener.add(
            task.id,
            'click',
            deleteButtonEl,
            () => this.handleClickDeleteTask(task)
        )
        
        titleInput.value = ''
    }

    private handleClickDeleteTask = (task: Task) => {
        if(!window.confirm(`「${task.title}」を削除してもよろしいですか？`)) return
        this.executeDeleteTask(task)
        console.log(this.taskCollection)
    }
}

window.addEventListener('load', () => {
    const app = new Application()
    app.start()
})