import { Injectable } from '@nestjs/common';
import { Client, Databases, Storage, Functions } from 'appwrite';

@Injectable()
export class AppwriteService {
  private client: Client;
  public databases: Databases;
  public storage: Storage;
  public functions: Functions;

  constructor() {
    this.client = new Client();

    const endpoint = process.env.APPWRITE_ENDPOINT;
    const projectId = process.env.APPWRITE_PROJECT_ID;

    if (!endpoint) {
      throw new Error('APPWRITE_ENDPOINT environment variable is required');
    }

    if (!projectId) {
      throw new Error('APPWRITE_PROJECT_ID environment variable is required');
    }

    this.client.setEndpoint(endpoint).setProject(projectId);

    this.databases = new Databases(this.client);
    this.storage = new Storage(this.client);
    this.functions = new Functions(this.client);
  }

  getClient(): Client {
    return this.client;
  }
}
