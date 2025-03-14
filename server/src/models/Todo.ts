import mongoose, { Schema, Document } from 'mongoose';

// Define Tag interface
export interface ITag {
  id: string;
  name: string;
  color: string;
}

export interface ITodo extends Document {
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  tags: ITag[]; // Add tags array
}

// Define Tag schema
const TagSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  color: { type: String, required: true }
}, { _id: false });

const TodoSchema: Schema = new Schema({
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'in-progress', 'completed'], 
    default: 'pending' 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high'], 
    default: 'medium' 
  },
  dueDate: { 
    type: Date, 
    default: Date.now 
  },
  userId: { 
    type: String, 
    required: true 
  },
  tags: { 
    type: [TagSchema], 
    default: [] 
  }
}, {
  timestamps: true
});

export default mongoose.model<ITodo>('Todo', TodoSchema); 