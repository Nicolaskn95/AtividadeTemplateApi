import { MongoClient, Db, Collection, ObjectId as MongoObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface UserDocument {
  _id: string;
  nome: string;
  email: string;
  senhaHash: string;
  telefone?: string;
  cpf?: string;
  avatar?: string;
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt: string;
}

export interface ContentDocument {
  _id: string;
  titulo: string;
  subtitulo: string;
  descricao: string;
  categoria: string; // TELA 01, TELA 02, TELA 03, TELA 04, TELA 05
  imagem: string; // URL or base64 or SVG
  ano?: number;
  temporada?: number;
  episodio?: number;
  duracao?: string;
  classificacao?: string;
  criadoPor?: string;
  createdAt: string;
  updatedAt: string;
}

// Generate valid 24-character hexadecimal MongoDB ObjectId
export function createObjectId(): string {
  return crypto.randomBytes(12).toString('hex');
}

// Pre-seeded initial data inspired by the user's template
const SEED_USERS: UserDocument[] = [
  {
    _id: '65f1a1000000000000000001',
    nome: 'Emerson',
    email: 'emerson@email.com',
    senhaHash: hashPassword('senha123'),
    telefone: '(15) 99999-9999',
    cpf: '000.000.000-00',
    avatar: '',
    role: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const SEED_CONTENTS: ContentDocument[] = [
  {
    _id: '65f1c2000000000000000001',
    titulo: 'Breaking Bad',
    subtitulo: '1x01 - Pilot',
    descricao: 'Um professor de química do ensino médio diagnosticado com câncer de pulmão inoperável se volta para a fabricação e venda de metanfetamina para garantir o futuro financeiro de sua família.',
    categoria: 'TELA 01',
    imagem: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
    ano: 2008,
    temporada: 1,
    episodio: 1,
    duracao: '58 min',
    classificacao: '18+',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    _id: '65f1c2000000000000000002',
    titulo: 'Mr. Robot',
    subtitulo: '1x01 - eps1.0_hellofriend.mov',
    descricao: 'Elliot, um jovem engenheiro de cibersegurança que sofre de transtorno de ansiedade social, é recrutado por um misterioso líder hacker para derrubar a maior corporação do mundo.',
    categoria: 'TELA 02',
    imagem: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    ano: 2015,
    temporada: 1,
    episodio: 1,
    duracao: '65 min',
    classificacao: '16+',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    _id: '65f1c2000000000000000003',
    titulo: 'Black Mirror',
    subtitulo: '3x01 - Nosedive',
    descricao: 'Em uma sociedade obcecada por pontuações de redes sociais onde o status pessoal determina o acesso a comodidades, uma mulher tenta impressionar a elite em um casamento luxuoso.',
    categoria: 'TELA 03',
    imagem: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    ano: 2016,
    temporada: 3,
    episodio: 1,
    duracao: '63 min',
    classificacao: '16+',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    _id: '65f1c2000000000000000004',
    titulo: 'Silicon Valley',
    subtitulo: '1x01 - Minimum Viable Product',
    descricao: 'Richard Hendricks desenvolve um revolucionário algoritmo de compressão de dados e precisa decidir entre uma oferta de compra milionária ou financiamento de risco.',
    categoria: 'TELA 04',
    imagem: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
    ano: 2014,
    temporada: 1,
    episodio: 1,
    duracao: '30 min',
    classificacao: '14+',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    _id: '65f1c2000000000000000005',
    titulo: 'Severance',
    subtitulo: '1x01 - Good News About Hell',
    descricao: 'Mark lidera uma equipe cujas memórias foram cirurgicamente divididas entre sua vida profissional e pessoal nas instalações da misteriosa Lumon Industries.',
    categoria: 'TELA 05',
    imagem: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80',
    ano: 2022,
    temporada: 1,
    episodio: 1,
    duracao: '57 min',
    classificacao: '16+',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    _id: '65f1c2000000000000000006',
    titulo: 'Dark',
    subtitulo: '1x01 - Secrets',
    descricao: 'O desaparecimento de duas crianças em uma cidade alemã expõe os relacionamentos fraturados e o passado com quatro famílias ligadas a um mistério temporal.',
    categoria: 'TELA 01',
    imagem: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
    ano: 2017,
    temporada: 1,
    episodio: 1,
    duracao: '51 min',
    classificacao: '16+',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    _id: '65f1c2000000000000000007',
    titulo: 'Westworld',
    subtitulo: '1x01 - The Original',
    descricao: 'Em um parque temático futurista onde os androides realizam os desejos dos convidados humanos, uma anomalia nos códigos dos anfitriões desencadeia consciência própria.',
    categoria: 'TELA 02',
    imagem: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80',
    ano: 2016,
    temporada: 1,
    episodio: 1,
    duracao: '68 min',
    classificacao: '18+',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  }
];

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + 'technologic_salt_2026').digest('hex');
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// Storage abstraction that seamlessly operates over real MongoDB when MONGODB_URI is provided
// or embedded MongoDB persistent JSON store when in standalone mode.
class DatabaseService {
  private isConnectedToMongo = false;
  private mongoClient: MongoClient | null = null;
  private mongoDb: Db | null = null;

  // Embedded store memory & disk fallback
  private dataDir = path.resolve(process.cwd(), 'data');
  private dbFilePath = path.resolve(process.cwd(), 'data', 'mongodb_store.json');
  private memoryStore: {
    users: UserDocument[];
    contents: ContentDocument[];
  } = {
    users: [...SEED_USERS],
    contents: [...SEED_CONTENTS],
  };

  async init() {
    this.ensureDataDir();
    this.loadFromDisk();

    const mongoUri = process.env.MONGODB_URI;
    if (mongoUri) {
      try {
        console.log('[MongoDB] Connecting to external MongoDB cluster...');
        this.mongoClient = new MongoClient(mongoUri, {
          serverSelectionTimeoutMS: 3000,
        });
        await this.mongoClient.connect();
        this.mongoDb = this.mongoClient.db('technologic_db');
        this.isConnectedToMongo = true;
        console.log('[MongoDB] Successfully connected to MongoDB Database: technologic_db');

        // Seed if empty
        const countUsers = await this.mongoDb.collection('users').countDocuments();
        if (countUsers === 0) {
          await this.mongoDb.collection('users').insertMany(SEED_USERS as any);
        }
        const countContents = await this.mongoDb.collection('contents').countDocuments();
        if (countContents === 0) {
          await this.mongoDb.collection('contents').insertMany(SEED_CONTENTS as any);
        }
        return;
      } catch (err: any) {
        console.warn('[MongoDB] Could not connect to external MongoDB URI, falling back to embedded MongoDB store:', err.message);
        this.isConnectedToMongo = false;
      }
    } else {
      console.log('[MongoDB] Operating with embedded MongoDB storage engine (data/mongodb_store.json).');
    }
  }

  private ensureDataDir() {
    if (!fs.existsSync(this.dataDir)) {
      try {
        fs.mkdirSync(this.dataDir, { recursive: true });
      } catch (err) {
        console.error('Failed to create data directory:', err);
      }
    }
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(this.dbFilePath)) {
        const raw = fs.readFileSync(this.dbFilePath, 'utf8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.users) && parsed.users.length > 0) {
          this.memoryStore.users = parsed.users;
        }
        if (Array.isArray(parsed.contents) && parsed.contents.length > 0) {
          this.memoryStore.contents = parsed.contents;
        }
        console.log(`[MongoDB Embedded] Loaded ${this.memoryStore.users.length} users and ${this.memoryStore.contents.length} contents from disk.`);
      } else {
        this.saveToDisk();
      }
    } catch (err) {
      console.warn('[MongoDB Embedded] Could not read disk store, using default seed:', err);
      this.saveToDisk();
    }
  }

  private saveToDisk() {
    try {
      this.ensureDataDir();
      fs.writeFileSync(this.dbFilePath, JSON.stringify(this.memoryStore, null, 2), 'utf8');
    } catch (err) {
      console.error('[MongoDB Embedded] Failed to write store to disk:', err);
    }
  }

  getStatus() {
    return {
      connectedToRemoteMongo: this.isConnectedToMongo,
      databaseType: this.isConnectedToMongo ? 'MongoDB Remote Cluster' : 'MongoDB Embedded Engine (JSON Persisted)',
      databaseName: 'technologic_db',
      collections: {
        users: this.memoryStore.users.length,
        contents: this.memoryStore.contents.length,
      },
    };
  }

  // ================= USERS CRUD =================
  async findUserByEmail(email: string): Promise<UserDocument | null> {
    const normalized = email.toLowerCase().trim();
    if (this.isConnectedToMongo && this.mongoDb) {
      const doc = await this.mongoDb.collection<UserDocument>('users').findOne({ email: normalized });
      return doc ? { ...doc, _id: doc._id.toString() } : null;
    }
    const found = this.memoryStore.users.find(u => u.email.toLowerCase() === normalized);
    return found ? { ...found } : null;
  }

  async findUserById(id: string): Promise<UserDocument | null> {
    if (this.isConnectedToMongo && this.mongoDb) {
      try {
        const doc = await this.mongoDb.collection<UserDocument>('users').findOne({
          $or: [{ _id: id as any }, { _id: new MongoObjectId(id) as any }]
        });
        return doc ? { ...doc, _id: doc._id.toString() } : null;
      } catch {
        return null;
      }
    }
    const found = this.memoryStore.users.find(u => u._id === id);
    return found ? { ...found } : null;
  }

  async createUser(data: Omit<UserDocument, '_id' | 'createdAt' | 'updatedAt'>): Promise<UserDocument> {
    const now = new Date().toISOString();
    const newUser: UserDocument = {
      ...data,
      email: data.email.toLowerCase().trim(),
      _id: createObjectId(),
      createdAt: now,
      updatedAt: now,
    };

    if (this.isConnectedToMongo && this.mongoDb) {
      await this.mongoDb.collection('users').insertOne(newUser as any);
    }

    this.memoryStore.users.push(newUser);
    this.saveToDisk();
    return newUser;
  }

  async updateUser(id: string, updates: Partial<UserDocument>): Promise<UserDocument | null> {
    const now = new Date().toISOString();
    const cleanUpdates = { ...updates, updatedAt: now };
    delete (cleanUpdates as any)._id;

    if (this.isConnectedToMongo && this.mongoDb) {
      try {
        await this.mongoDb.collection('users').updateOne(
          { $or: [{ _id: id as any }, { _id: new MongoObjectId(id) as any }] },
          { $set: cleanUpdates }
        );
      } catch (e) {
        console.error('Mongo updateUser error:', e);
      }
    }

    const idx = this.memoryStore.users.findIndex(u => u._id === id);
    if (idx === -1) return null;

    this.memoryStore.users[idx] = {
      ...this.memoryStore.users[idx],
      ...cleanUpdates,
    };
    this.saveToDisk();
    return { ...this.memoryStore.users[idx] };
  }

  // ================= CONTENTS CRUD =================
  async findContents(filter?: { categoria?: string; query?: string }): Promise<ContentDocument[]> {
    let results: ContentDocument[] = [];

    if (this.isConnectedToMongo && this.mongoDb) {
      const mongoFilter: any = {};
      if (filter?.categoria && filter.categoria !== 'TODAS') {
        mongoFilter.categoria = filter.categoria;
      }
      if (filter?.query && filter.query.trim()) {
        const qRegex = new RegExp(filter.query.trim(), 'i');
        mongoFilter.$or = [
          { titulo: qRegex },
          { subtitulo: qRegex },
          { descricao: qRegex },
          { categoria: qRegex },
        ];
      }
      const docs = await this.mongoDb.collection<ContentDocument>('contents').find(mongoFilter).sort({ createdAt: -1 }).toArray();
      results = docs.map(d => ({ ...d, _id: d._id.toString() }));
    } else {
      results = [...this.memoryStore.contents];
      if (filter?.categoria && filter.categoria !== 'TODAS') {
        results = results.filter(c => c.categoria.toLowerCase() === filter.categoria!.toLowerCase());
      }
      if (filter?.query && filter.query.trim()) {
        const q = filter.query.toLowerCase().trim();
        results = results.filter(c =>
          c.titulo.toLowerCase().includes(q) ||
          c.subtitulo.toLowerCase().includes(q) ||
          c.descricao.toLowerCase().includes(q) ||
          c.categoria.toLowerCase().includes(q)
        );
      }
      results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return results;
  }

  async findContentById(id: string): Promise<ContentDocument | null> {
    if (this.isConnectedToMongo && this.mongoDb) {
      try {
        const doc = await this.mongoDb.collection<ContentDocument>('contents').findOne({
          $or: [{ _id: id as any }, { _id: new MongoObjectId(id) as any }]
        });
        return doc ? { ...doc, _id: doc._id.toString() } : null;
      } catch {
        return null;
      }
    }
    const found = this.memoryStore.contents.find(c => c._id === id);
    return found ? { ...found } : null;
  }

  async createContent(data: Omit<ContentDocument, '_id' | 'createdAt' | 'updatedAt'>): Promise<ContentDocument> {
    const now = new Date().toISOString();
    const newContent: ContentDocument = {
      ...data,
      _id: createObjectId(),
      createdAt: now,
      updatedAt: now,
    };

    if (this.isConnectedToMongo && this.mongoDb) {
      await this.mongoDb.collection('contents').insertOne(newContent as any);
    }

    this.memoryStore.contents.unshift(newContent);
    this.saveToDisk();
    return newContent;
  }

  async updateContent(id: string, updates: Partial<ContentDocument>): Promise<ContentDocument | null> {
    const now = new Date().toISOString();
    const cleanUpdates = { ...updates, updatedAt: now };
    delete (cleanUpdates as any)._id;

    if (this.isConnectedToMongo && this.mongoDb) {
      try {
        await this.mongoDb.collection('contents').updateOne(
          { $or: [{ _id: id as any }, { _id: new MongoObjectId(id) as any }] },
          { $set: cleanUpdates }
        );
      } catch (e) {
        console.error('Mongo updateContent error:', e);
      }
    }

    const idx = this.memoryStore.contents.findIndex(c => c._id === id);
    if (idx === -1) return null;

    this.memoryStore.contents[idx] = {
      ...this.memoryStore.contents[idx],
      ...cleanUpdates,
    };
    this.saveToDisk();
    return { ...this.memoryStore.contents[idx] };
  }

  async updateContentImage(id: string, imageUrl: string): Promise<ContentDocument | null> {
    return this.updateContent(id, { imagem: imageUrl });
  }

  async deleteContentImage(id: string): Promise<ContentDocument | null> {
    return this.updateContent(id, { imagem: '' });
  }

  async deleteContent(id: string): Promise<boolean> {
    if (this.isConnectedToMongo && this.mongoDb) {
      try {
        const res = await this.mongoDb.collection('contents').deleteOne({
          $or: [{ _id: id as any }, { _id: new MongoObjectId(id) as any }]
        });
        if (res.deletedCount && res.deletedCount > 0) {
          // also update memory
          this.memoryStore.contents = this.memoryStore.contents.filter(c => c._id !== id);
          this.saveToDisk();
          return true;
        }
      } catch (e) {
        console.error('Mongo deleteContent error:', e);
      }
    }

    const initialLen = this.memoryStore.contents.length;
    this.memoryStore.contents = this.memoryStore.contents.filter(c => c._id !== id);
    if (this.memoryStore.contents.length !== initialLen) {
      this.saveToDisk();
      return true;
    }
    return false;
  }

  async resetSeed(): Promise<void> {
    this.memoryStore.users = [...SEED_USERS];
    this.memoryStore.contents = [...SEED_CONTENTS];
    this.saveToDisk();

    if (this.isConnectedToMongo && this.mongoDb) {
      await this.mongoDb.collection('users').deleteMany({});
      await this.mongoDb.collection('users').insertMany(SEED_USERS as any);
      await this.mongoDb.collection('contents').deleteMany({});
      await this.mongoDb.collection('contents').insertMany(SEED_CONTENTS as any);
    }
  }
}

export const dbService = new DatabaseService();
