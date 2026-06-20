export interface Project {
  id: number;
  ownerUserId: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PublicProject {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectInput {
  ownerUserId: number;
  name: string;
  description: string | null;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string | null;
}
