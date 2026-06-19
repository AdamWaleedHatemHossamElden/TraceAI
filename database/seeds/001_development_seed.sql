INSERT INTO users (email, password_hash, role)
VALUES
  ('reviewer@example.test', '$2b$12$replaceWithLocalDevelopmentHashOnly', 'reviewer')
ON DUPLICATE KEY UPDATE email = email;

INSERT INTO projects (owner_user_id, name, description)
SELECT id, 'Sample Verification Project', 'Safe sample project for local development.'
FROM users
WHERE email = 'reviewer@example.test'
ON DUPLICATE KEY UPDATE name = name;
