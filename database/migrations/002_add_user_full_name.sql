ALTER TABLE users
  ADD COLUMN full_name VARCHAR(100) NULL AFTER id;

UPDATE users
SET full_name = 'Development User'
WHERE full_name IS NULL OR TRIM(full_name) = '';

ALTER TABLE users
  MODIFY COLUMN full_name VARCHAR(100) NOT NULL;