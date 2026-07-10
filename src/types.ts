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

