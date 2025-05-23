// src/types.ts (このファイルに書き始めます)

// 'export' をつけると、他のファイルからこの Gender 型をインポートして使えるようになります。
export enum Gender {
  Male = "男性",       // Gender.Male は "男性" という文字列を表します
  Female = "女性",     // Gender.Female は "女性" という文字列を表します
  Other = "その他",    // Gender.Other は "その他" という文字列を表します
  Unanswered = "回答しない" // Gender.Unanswered は "回答しない" という文字列を表します
}
// src/types.ts (続き)

// フォームに入力されるデータ全体の「形」を定義します。
export interface FormDataModel {
  name: string;         // 「名前」の項目。文字列型 (例: "山田 太郎")
  age: number | '';     // 「年齢」の項目。数値型または空文字列 (詳細は後述)
  gender: Gender;       // 「性別」の項目。上で定義した Gender enum 型を使います
  postalCode: string;   // 「郵便番号」の項目。文字列型 (例: "123-4567")
  address: string;      // 「住所」の項目。文字列型 (例: "東京都新宿区...")
}
// src/types.ts (さらに続き)

// フォームの各項目に対応するエラーメッセージを保持するための「形」を定義します。
export interface FormErrors {
  name?: string;      // name項目用のエラーメッセージ (文字列)。'?' は「あってもなくても良い」という意味。
  age?: string;       // age項目用のエラーメッセージ (文字列)。
  gender?: string;    // gender項目用のエラーメッセージ (文字列)。
  postalCode?: string;// postalCode項目用のエラーメッセージ (文字列)。
  address?: string;   // address項目用のエラーメッセージ (文字列)。
}