export interface User {
  _id: string;
  nome: string;
  email: string;
  telefone?: string;
  cpf?: string;
  avatar?: string;
  role: 'admin' | 'user';
  createdAt?: string;
}

export interface ContentItem {
  _id: string;
  titulo: string;
  subtitulo: string;
  descricao: string;
  categoria: string; // TELA 01, TELA 02, TELA 03, TELA 04, TELA 05
  imagem: string;
  ano?: number;
  temporada?: number;
  episodio?: number;
  duracao?: string;
  classificacao?: string;
  criadoPor?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseStatus {
  connectedToRemoteMongo: boolean;
  databaseType: string;
  databaseName: string;
  collections: {
    users: number;
    contents: number;
  };
}
