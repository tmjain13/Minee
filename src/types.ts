export interface ImageTag {
  id: string;
  imageId: string;
  tag: string;
  userId: string;
  createdAt: any;
}

export interface QA {
  id: string;
  category?: string;
  question: string;
  answer?: string;
  explanation?: string;
}

export interface SubTask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  tag?: string;
  category?: string;
  categoryColor?: string;
  notes?: string;
  completedAt?: number;
  dueTime?: string;
  impact?: 'Low' | 'Medium' | 'High';
  subtasks?: SubTask[];
}

