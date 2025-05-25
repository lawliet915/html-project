// frontend/calculator-ui/src/types.ts
export interface CalculationPayload {
  num1: number;
  num2: number;
  operation: string; // "add", "subtract", "multiply", "divide"
}

export interface CalculationResult {
  result?: number; // 結果は成功時のみ存在
  error?: string;  // エラーはエラー時のみ存在
}