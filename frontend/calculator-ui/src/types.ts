// frontend/calculator-ui/src/types.ts

// 課題8のものは残しても良いし、コメントアウトしても良い
// export interface CalculationPayload { ... }
// export interface CalculationResult { ... }

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