# Todo App Server with Supabase Auth

This is the backend server for a Todo application with Supabase authentication.

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root of the server directory with the following variables:
   ```
   PORT=5001
   JWT_SECRET=your-super-secret-key
   SUPABASE_URL=your-supabase-url
   SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. Create a Supabase account and project at [https://supabase.com](https://supabase.com)

5. Get your Supabase URL and anon key from the Supabase dashboard and add them to the `.env` file.

6. Create the following tables in your Supabase database:

   ### todos
   ```sql
   CREATE TABLE todos (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     title TEXT NOT NULL,
     description TEXT,
     completed BOOLEAN DEFAULT FALSE,
     user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
   );

   -- Create RLS policies for todos
   ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

   -- Create policy to allow users to select only their own todos
   CREATE POLICY "Users can select their own todos" ON todos
     FOR SELECT USING (auth.uid() = user_id);

   -- Create policy to allow users to insert their own todos
   CREATE POLICY "Users can insert their own todos" ON todos
     FOR INSERT WITH CHECK (auth.uid() = user_id);

   -- Create policy to allow users to update their own todos
   CREATE POLICY "Users can update their own todos" ON todos
     FOR UPDATE USING (auth.uid() = user_id);

   -- Create policy to allow users to delete their own todos
   CREATE POLICY "Users can delete their own todos" ON todos
     FOR DELETE USING (auth.uid() = user_id);
   ```

7. Configure Supabase Auth in the dashboard to enable email/password sign-ups

8. Start the server:
   ```
   npm run dev
   ```

## API Routes

### Authentication

- `POST /api/auth/register` - Register a new user
  - Body: `{ "email": "user@example.com", "password": "password", "name": "User Name" }`

- `POST /api/auth/login` - Login a user
  - Body: `{ "email": "user@example.com", "password": "password" }`

- `POST /api/auth/logout` - Logout the current user

### Todos

All todo routes require authentication. Include the token in the Authorization header:
`Authorization: Bearer YOUR_TOKEN`

- `GET /api/todos` - Get all todos for the current user
- `GET /api/todos/:id` - Get a specific todo
- `POST /api/todos` - Create a new todo
  - Body: `{ "title": "Task name", "description": "Task description", "completed": false }`
- `PUT /api/todos/:id` - Update a todo
  - Body: `{ "title": "Updated task", "description": "Updated description", "completed": true }`
- `DELETE /api/todos/:id` - Delete a todo 