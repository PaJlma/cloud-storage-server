import { BadRequestException } from "@nestjs/common";

export interface ValidationExceptionOptions {
  description?: string;
  cause?: string;
}

class ValidationException extends BadRequestException {
  constructor(options: ValidationExceptionOptions) {
    super([options]);
  }
}

export default ValidationException;
