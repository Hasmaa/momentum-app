-- Add new columns to todos table

-- Add status column with enum type
ALTER TABLE todos ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
-- Add constraint to ensure valid status values
ALTER TABLE todos ADD CONSTRAINT status_check CHECK (status IN ('pending', 'in-progress', 'completed'));

-- Add priority column
ALTER TABLE todos ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';
-- Add constraint to ensure valid priority values
ALTER TABLE todos ADD CONSTRAINT priority_check CHECK (priority IN ('low', 'medium', 'high'));

-- Add due_date column
ALTER TABLE todos ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE;

-- Add tags column (JSON array)
ALTER TABLE todos ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb; 