import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

// Load backend settings before route imports, regardless of the working directory.
// Explicit environment variables (for example, Cloud Run's PORT) take precedence.
dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });
