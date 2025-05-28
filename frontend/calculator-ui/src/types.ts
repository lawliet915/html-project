// frontend/calculator-ui/src/types.ts

// --- 課題8: 電卓アプリの型定義 (今回は使用しないためコメントアウト) ---
/*
export interface CalculationPayload {
  num1: number;
  num2: number;
  operation: string; // "add", "subtract", "multiply", "divide"
}

export interface CalculationResult {
  result?: number; // 結果は成功時のみ存在
  error?: string;  // エラーはエラー時のみ存在
}
*/

// --- 課題9: ユーザー登録フォームの型定義 ---
export enum UserSex { // 性別用のenum (数値で扱う)
  Unknown = 0,
  Male = 1,
  Female = 2,
  Other = 9, // 例として
}

export interface UserFormData {
  name: string;
  age: string; // 入力は文字列、送信時に数値変換
  sex: UserSex;
  description: string;
}

export interface UserCreateResponse { // バックエンドからのレスポンス型
  id?: string;
  message?: string;
  error?: string;
}
