import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

// Thêm method .openapi() cho mọi Zod schema. Các file schema phải import `z` từ đây.
extendZodWithOpenApi(z);

export { z };
