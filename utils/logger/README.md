# @/utils/logger

A simple, context-aware logger utility.

## Usage

```typescript
import { Logger } from "@/utils/logger";

const logger = new Logger("MyComponent");

logger.info("Application started");
logger.warn("This is a warning");
logger.error("An error occurred", error);
```

## Features

- Context-aware logging with prefixes
- Standard log levels: info, warn/warning, error
- TypeScript support
- Zero dependencies
