import { ApiDocument } from './core/config/swagger.config.js';
// Trigger resolving modules to populate the swagger docs
import './core/api/index.js';

console.log(JSON.stringify(ApiDocument.instance, null, 2));
