import { v4 as uuidv4 } from 'uuid';
import { Tag } from '../types';

// Updated tag colors using Chakra UI theme colors
export const TAG_COLORS = [
  '#3182CE', // blue.500
  '#38A169', // green.500
  '#E53E3E', // red.500
  '#DD6B20', // orange.500
  '#805AD5', // purple.500
  '#D69E2E', // yellow.500
  '#00B5D8', // cyan.500
  '#ED64A6', // pink.500
  '#667EEA', // indigo.500
  '#9F7AEA', // purple.400
  '#4FD1C5', // teal.400
  '#718096', // gray.500
];

// Default tags that may be useful for most users
export const DEFAULT_TAGS: Tag[] = [
  { id: uuidv4(), name: 'Work', color: '#3182CE' }, // blue.500
  { id: uuidv4(), name: 'Personal', color: '#38A169' }, // green.500
  { id: uuidv4(), name: 'Urgent', color: '#E53E3E' }, // red.500
  { id: uuidv4(), name: 'Important', color: '#D69E2E' }, // yellow.500
  { id: uuidv4(), name: 'Meeting', color: '#805AD5' }, // purple.500
];

// Local storage key for tags
const TAGS_STORAGE_KEY = 'todo-app-tags';

export class TagService {
  // Get all tags from storage or initialize with defaults
  static getTags(): Tag[] {
    const tagsJson = localStorage.getItem(TAGS_STORAGE_KEY);
    if (tagsJson) {
      return JSON.parse(tagsJson);
    }
    
    // Initialize with default tags
    this.saveTags(DEFAULT_TAGS);
    return DEFAULT_TAGS;
  }

  // Save tags to storage
  static saveTags(tags: Tag[]): void {
    localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(tags));
  }

  // Create a new tag
  static createTag(name: string, color: string = this.getRandomColor()): Tag {
    const newTag: Tag = {
      id: uuidv4(),
      name,
      color,
    };
    
    const tags = this.getTags();
    tags.push(newTag);
    this.saveTags(tags);
    
    return newTag;
  }

  // Update an existing tag
  static updateTag(updatedTag: Tag): Tag {
    const tags = this.getTags();
    const index = tags.findIndex(tag => tag.id === updatedTag.id);
    
    if (index !== -1) {
      tags[index] = updatedTag;
      this.saveTags(tags);
    }
    
    return updatedTag;
  }

  // Delete a tag
  static deleteTag(tagId: string): void {
    const tags = this.getTags();
    const filteredTags = tags.filter(tag => tag.id !== tagId);
    this.saveTags(filteredTags);
  }

  // Get a random color from the predefined colors
  static getRandomColor(): string {
    // Make sure we return a color from our predefined Chakra UI theme colors
    return TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];
  }

  // Find a tag by name (case insensitive)
  static findTagByName(name: string): Tag | undefined {
    const tags = this.getTags();
    return tags.find(tag => tag.name.toLowerCase() === name.toLowerCase());
  }

  // Get tag by ID
  static getTagById(id: string): Tag | undefined {
    const tags = this.getTags();
    return tags.find(tag => tag.id === id);
  }
} 