import express, { Request, Response } from 'express';
import { check, validationResult } from 'express-validator';
import DynamoDbService from '../services/dynamoDbService';

const router = express.Router();

// GET /tasks - Retrieve all tasks
/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Retrieve all tasks
 *     responses:
 *       200:
 *         description: List of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 */
router.get('/tasks', async (req: Request, res: Response) => {
  try {

		// actual codes but pending verification from AWS
    const tasks = await DynamoDbService.getAllTasks();
		console.log(tasks);
    // res.json(tasks);

		// Sample Format
    // res.json(
		// 	[
		// 		{ id: 1, task: 'Task 1', description: 'Description 1', status: 'Todo' },
		// 		{ id: 2, task: 'Task 2', description: 'Description 2', status: 'In Progress' },
		// 		{ id: 3, task: 'Task 3', description: 'Description 3', status: 'Completed' },
		// 	]
		// );

		// temporary mock data for testing while DynamoDB API call is in progress
		// const mockData = Array.from({ length: 25 }, (_, i) => ({
		// 	id: i + 1,
		// 	task: `Task ${i + 1}`,
		// 	description: `Description for Task ${i + 1}`,
		// 	status: ['Todo', 'In Progress', 'Completed'][Math.floor(Math.random() * 3)] as 'Todo' | 'In Progress' | 'Completed',
		// }));
		// res.json(mockData);

		res.json(tasks);


  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tasks', error });
  }
});

// GET /tasks/:id - Retrieve a specific task
/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Retrieve a task by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A task
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task not found
 */
router.get(
  '/tasks/:id',
  [check('id').isInt().withMessage('ID must be an integer')],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const id = parseInt(req.params.id, 10);
    try {
      const task = await DynamoDbService.getTaskById(id);
      if (!task) return res.status(404).json({ message: 'Task not found' });
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch task', error });
    }
  }
);

// POST /tasks - Add a new task
/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create a new task
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               task:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Todo, In Progress, Completed]
 *             required:
 *               - task
 *               - description
 *               - status
 *     responses:
 *       201:
 *         description: Task created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 */
router.post(
  '/tasks',
  [
    check('task').notEmpty().withMessage('Task is required'),
    // check('description').notEmpty().withMessage('Description is required'),
    check('status')
      .isIn(['Todo', 'In Progress', 'Completed'])
      .withMessage('Status must be Todo, In Progress, or Completed'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { task, description, status } = req.body;
    try {
      const newTask = await DynamoDbService.createTask({ task, description, status });
      res.status(201).json(newTask);

			// sample API POST return only for testing purporses before the actual DynamoDB API call is in place
			// res.status(201).json([{ message: 'Task created', task, description, status }]);

    } catch (error) {
      res.status(500).json({ message: 'Failed to create task', error });
    }
  }
);

// PUT /tasks/:id - Update an existing task
/**
 * @swagger
 * /tasks/{id}:
 *   put:
 *     summary: Update a task
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               task:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Todo, In Progress, Completed]
 *     responses:
 *       200:
 *         description: Task updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task not found
 */
router.put(
  '/tasks/:id',
  [
    check('id').isInt().withMessage('ID must be an integer'),
    check('task').optional().notEmpty().withMessage('Task cannot be empty'),
    check('description').optional().notEmpty().withMessage('Description cannot be empty'),
    check('status')
      .optional()
      .isIn(['Todo', 'In Progress', 'Completed'])
      .withMessage('Status must be Todo, In Progress, or Completed'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const id = parseInt(req.params.id, 10);
    const { task, description, status } = req.body;
    try {
      const updatedTask = await DynamoDbService.updateTask(id, { task, description, status });
      if (!updatedTask) return res.status(404).json({ message: 'Task not found' });
      res.json(updatedTask);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update task', error });
    }
  }
);

// DELETE /tasks/:id - Delete a task
/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Task deleted
 *       404:
 *         description: Task not found
 */
router.delete(
  '/tasks/:id',
  [check('id').isInt().withMessage('ID must be an integer')],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const id = parseInt(req.params.id, 10);
    try {
      const success = await DynamoDbService.deleteTask(id);
      if (!success) return res.status(404).json({ message: 'Task not found' });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete task', error });
    }
  }
);

export default router;