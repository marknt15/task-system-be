import { DynamoDB } from 'aws-sdk';
import { config } from '../config/env';
import { Task } from '../types/task';

const dynamoDb = new DynamoDB.DocumentClient({
  region: config.aws.region,
  accessKeyId: config.aws.accessKeyId,
  secretAccessKey: config.aws.secretAccessKey,
});

export class DynamoDbService {
  async getAllTasks(): Promise<Task[]> {
    const params = {
      TableName: config.dynamoDbTable!,
    };
    const result = await dynamoDb.scan(params).promise();
    return (result.Items || []) as Task[];
  }

  async getTaskById(id: number): Promise<Task | null> {
    const params = {
      TableName: config.dynamoDbTable!,
      Key: { id },
    };
    const result = await dynamoDb.get(params).promise();
    return (result.Item || null) as Task | null;
  }

  async createTask(task: Omit<Task, 'id' | 'created_at'>): Promise<Task> {
    const newTask = {
      id: Date.now(), // Use UUID in production
      created_at: new Date().toISOString(),
      ...task,
    };
    const params = {
      TableName: config.dynamoDbTable!,
      Item: newTask,
    };
    await dynamoDb.put(params).promise();
    return newTask;
  }

  async updateTask(id: number, task: Partial<Task>): Promise<Task | null> {
    const existingTask = await this.getTaskById(id);
    if (!existingTask) return null;

    const updatedTask = { ...existingTask, ...task };
    const params = {
      TableName: config.dynamoDbTable!,
      Item: updatedTask,
    };
    await dynamoDb.put(params).promise();
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    const params = {
      TableName: config.dynamoDbTable!,
      Key: { id },
    };
    await dynamoDb.delete(params).promise();
    return true;
  }
}

export default new DynamoDbService();