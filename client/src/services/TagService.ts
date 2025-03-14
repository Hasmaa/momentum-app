import { v4 as uuidv4 } from 'uuid';
import { Tag } from '../types';

// Predefined tag colors for enterprise use
export const TAG_COLORS = [
  '#FF5733', // Red
  '#33FF57', // Green
  '#3357FF', // Blue
  '#FF33A8', // Pink
  '#33FFF6', // Cyan
  '#F6FF33', // Yellow
  '#FF8333', // Orange
  '#8333FF', // Purple
  '#33FFAA', // Mint
  '#AA33FF', // Violet
  '#FFD633', // Gold
  '#33D6FF', // Sky Blue
];

// Default tags that may be useful for most users
export const DEFAULT_TAGS: Tag[] = [
  { id: uuidv4(), name: 'Work', color: '#FF5733' },
  { id: uuidv4(), name: 'Personal', color: '#33FF57' },
  { id: uuidv4(), name: 'Urgent', color: '#FF8333' },
  { id: uuidv4(), name: 'Important', color: '#F6FF33' },
  { id: uuidv4(), name: 'Meeting', color: '#3357FF' },
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

  // Get a random color for a new tag
  static getRandomColor(): string {
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