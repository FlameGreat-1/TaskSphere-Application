// TasksComponents.js

import React, { useState } from 'react';
import { toast } from 'react-toastify';
import {
  Section,
  SectionTitle,
  FormGroup,
  Label,
  Select,
  Input,
  Button,
} from '../components/ProfileHomeStyles';

// Import necessary API functions
import {
  filterTasks,
  createCategory,
  deleteCategory,
  createTag,
  deleteTag,
  assignTask,
  snoozeReminder,
  sendTaskReminder,
} from '../services/api';

export const FilterTasks = ({ tasks, setTasks, categories, tags }) => {
  const [filterPriority, setFilterPriority] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [filterDeadline, setFilterDeadline] = useState('');

  const handleFilterTasks = async () => {
    try {
      const filteredTasks = await filterTasks(filterPriority, filterTag, filterDeadline);
      setTasks(filteredTasks.data);
      toast.success('Tasks filtered successfully');
    } catch (error) {
      toast.error('Error filtering tasks');
    }
  };

  return (
    <Section>
      <SectionTitle>Filter Tasks</SectionTitle>
      <FormGroup>
        <Label>Priority</Label>
        <Select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
        >
          <option value="">All</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </Select>

        <Label>Tag</Label>
        <Select
          value={filterTag}
          onChange={(e) => setFilterTag(e.target.value)}
        >
          <option value="">All</option>
          {tags.map(tag => (
            <option key={tag.id} value={tag.id}>{tag.name}</option>
          ))}
        </Select>

        <Label>Deadline</Label>
        <Input
          type="date"
          value={filterDeadline}
          onChange={(e) => setFilterDeadline(e.target.value)}
        />

        <Button onClick={handleFilterTasks}>
          Apply Filters
        </Button>
      </FormGroup>
    </Section>
  );
};

export const ManageCategories = ({ categories, setCategories }) => {
  const [newCategory, setNewCategory] = useState('');

  const handleCreateCategory = async () => {
    if (!newCategory.trim()) return;
    
    try {
      const createdCategory = await createCategory({ name: newCategory });
      setCategories([...categories, createdCategory.data]);
      setNewCategory('');
      toast.success('Category created successfully');
    } catch (error) {
      toast.error('Error creating category');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    
    try {
      await deleteCategory(categoryId);
      setCategories(categories.filter(category => category.id !== categoryId));
      toast.success('Category deleted successfully');
    } catch (error) {
      toast.error('Error deleting category');
    }
  };

  return (
    <Section>
      <SectionTitle>Manage Categories</SectionTitle>
      <Input
        type="text"
        value={newCategory}
        onChange={(e) => setNewCategory(e.target.value)}
        placeholder="New Category Name"
      />
      <Button onClick={handleCreateCategory}>Create Category</Button>
      {categories.map(category => (
        <div key={category.id}>
          <span>{category.name}</span>
          <Button onClick={() => handleDeleteCategory(category.id)}>Delete</Button>
        </div>
      ))}
    </Section>
  );
};

export const ManageTags = ({ tags, setTags }) => {
  const [newTag, setNewTag] = useState('');

  const handleCreateTag = async () => {
    if (!newTag.trim()) return;
    
    try {
      const createdTag = await createTag({ name: newTag });
      setTags([...tags, createdTag.data]);
      setNewTag('');
      toast.success('Tag created successfully');
    } catch (error) {
      toast.error('Error creating tag');
    }
  };

  const handleDeleteTag = async (tagId) => {
    if (!window.confirm('Are you sure you want to delete this tag?')) return;
    
    try {
      await deleteTag(tagId);
      setTags(tags.filter(tag => tag.id !== tagId));
      toast.success('Tag deleted successfully');
    } catch (error) {
      toast.error('Error deleting tag');
    }
  };

  return (
    <Section>
      <SectionTitle>Manage Tags</SectionTitle>
      <Input
        type="text"
        value={newTag}
        onChange={(e) => setNewTag(e.target.value)}
        placeholder="New Tag Name"
      />
      <Button onClick={handleCreateTag}>Create Tag</Button>
      {tags.map(tag => (
        <div key={tag.id}>
          <span>{tag.name}</span>
          <Button onClick={() => handleDeleteTag(tag.id)}>Delete</Button>
        </div>
      ))}
    </Section>
  );
};

export const AssignTasks = ({ tasks, setTasks }) => {
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');

  const handleAssignTask = async () => {
    if (!selectedTaskId || !selectedUserId) return;
    
    try {
      await assignTask(selectedTaskId, selectedUserId);
      // Update the task in the local state
      setTasks(tasks.map(task => 
        task.id === selectedTaskId 
          ? { ...task, assigned_to: selectedUserId } 
          : task
      ));
      toast.success('Task assigned successfully');
    } catch (error) {
      toast.error('Error assigning task');
    }
  };

  return (
    <Section>
      <SectionTitle>Assign Tasks</SectionTitle>
      <Select
        value={selectedTaskId}
        onChange={(e) => setSelectedTaskId(e.target.value)}
      >
        <option value="">Select a task</option>
        {tasks.map(task => (
          <option key={task.id} value={task.id}>{task.title}</option>
        ))}
      </Select>
      <Input
        type="text"
        value={selectedUserId}
        onChange={(e) => setSelectedUserId(e.target.value)}
        placeholder="Enter user ID"
      />
      <Button onClick={handleAssignTask}>Assign Task</Button>
    </Section>
  );
};

export const TaskReminders = ({ tasks }) => {
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [snoozeTime, setSnoozeTime] = useState('');

  const handleSnoozeReminder = async () => {
    if (!selectedTaskId || !snoozeTime) return;
    
    try {
      await snoozeReminder(selectedTaskId, snoozeTime);
      toast.success('Reminder snoozed successfully');
    } catch (error) {
      toast.error('Error snoozing reminder');
    }
  };

  const handleSendTaskReminder = async () => {
    if (!selectedTaskId) return;
    
    try {
      await sendTaskReminder(selectedTaskId);
      toast.success('Reminder sent successfully');
    } catch (error) {
      toast.error('Error sending reminder');
    }
  };

  return (
    <Section>
      <SectionTitle>Task Reminders</SectionTitle>
      <Select
        value={selectedTaskId}
        onChange={(e) => setSelectedTaskId(e.target.value)}
      >
        <option value="">Select a task</option>
        {tasks.map(task => (
          <option key={task.id} value={task.id}>{task.title}</option>
        ))}
      </Select>
      <Input
        type="datetime-local"
        value={snoozeTime}
        onChange={(e) => setSnoozeTime(e.target.value)}
      />
      <Button onClick={handleSnoozeReminder}>Snooze Reminder</Button>
      <Button onClick={handleSendTaskReminder}>Send Reminder</Button>
    </Section>
  );
};
