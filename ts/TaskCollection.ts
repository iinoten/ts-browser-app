import { Status, Task, TaskObject } from "./Task";

const STORAGE_KEY = 'TASKS'

export class TaskCollection {
    private readonly storage
    private tasks

    constructor() {
        this.storage = localStorage
        this.tasks = this.getStoredTasks()
    }
    
    add(task: Task) {
        this.tasks.push(task)
        this.updateStorage()
    }
    
    delete(task: Task) {
        this.tasks = this.tasks.filter(({id}) => id !== task.id)
    }
    
    find(id: string) {
        return this.tasks.find((task) => task.id === id)
    }
    
    filter(filterStatus: Status) {
        return this.tasks.filter(({status}) => status === filterStatus)
    }
    
    private getStoredTasks() {
        const jsonString = this.storage.getItem(STORAGE_KEY)

        if (!jsonString) return []
    
        try {
            const storedTasks = JSON.parse(jsonString)

            assertIsTaskObjects(storedTasks)
      
            const tasks = storedTasks.map((task) => new Task(task))
      
            return tasks
        } catch {
          this.storage.removeItem(STORAGE_KEY)
          return []
        }
    }
    

    

    private updateStorage() {
        this.storage.setItem(STORAGE_KEY, JSON.stringify(this.tasks))
    }

    update(task: Task) {
        this.tasks = this.tasks.map((item) => {
            if (item.id === this.tasks) return task
            return item
        })
    }
}

function assertIsTaskObjects(value: any): asserts value is TaskObject[] {
    if (!Array.isArray(value) || !value.every((item) => Task.validate(item))) {
      throw new Error('引数「value」は TaskObject[] 型と一致しません。')
    }
  }