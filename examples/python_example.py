"""
A simple task management system for demonstration purposes
"""

class Task:
    def __init__(self, id, title, description=None, status="pending"):
        self.id = id
        self.title = title
        self.description = description
        self.status = status
    
    def mark_complete(self):
        self.status = "completed"
    
    def mark_in_progress(self):
        self.status = "in_progress"
    
    def __str__(self):
        return f"Task {self.id}: {self.title} ({self.status})"


class TaskManager:
    def __init__(self):
        self.tasks = {}
        self.next_id = 1
    
    def add_task(self, title, description=None):
        task = Task(self.next_id, title, description)
        self.tasks[self.next_id] = task
        self.next_id += 1
        return task.id
    
    def get_task(self, task_id):
        if task_id in self.tasks:
            return self.tasks[task_id]
        print(f"Task {task_id} not found")
        return None
    
    def update_task(self, task_id, title=None, description=None, status=None):
        task = self.get_task(task_id)
        if not task:
            return False
        
        if title:
            task.title = title
        if description:
            task.description = description
        if status:
            task.status = status
        
        return True
    
    def delete_task(self, task_id):
        if task_id in self.tasks:
            del self.tasks[task_id]
            return True
        print(f"Task {task_id} not found")
        return False
    
    def list_tasks(self, status=None):
        if status:
            return [task for task in self.tasks.values() if task.status == status]
        return list(self.tasks.values())
    
    def summary(self):
        statuses = {}
        for task in self.tasks.values():
            if task.status in statuses:
                statuses[task.status] += 1
            else:
                statuses[task.status] = 1
        
        return {
            "total": len(self.tasks),
            "by_status": statuses
        }


# Example usage
if __name__ == "__main__":
    manager = TaskManager()
    
    # Add some tasks
    task1_id = manager.add_task("Implement login functionality")
    task2_id = manager.add_task("Fix navigation bug", "Users report the back button not working")
    task3_id = manager.add_task("Update documentation")
    
    # Update task status
    manager.update_task(task1_id, status="in_progress")
    manager.update_task(task2_id, status="completed")
    
    # Print tasks
    for task in manager.list_tasks():
        print(task)
    
    # Print summary
    print("\nSummary:")
    summary = manager.summary()
    print(f"Total tasks: {summary['total']}")
    for status, count in summary['by_status'].items():
        print(f"{status}: {count}") 