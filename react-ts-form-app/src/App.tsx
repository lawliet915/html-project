// src/App.tsx
import React, { useState, ChangeEvent, FormEvent } from 'react';
import './App.css'; // スタイルは適宜調整してください
import { FormDataModel, Gender, FormErrors } from './types'; // 先ほど定義した型をインポート

function App() {
  const initialFormData: FormDataModel = {
    name: '',
    age: '', // 初期値は空文字
    gender: Gender.Unanswered, // Enumのデフォルト値
    postalCode: '',
    address: '',
  };

  const [formData, setFormData] = useState<FormDataModel>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});

  const validatePostalCode = (postalCode: string): boolean => {
    // 簡単な xxx-xxxx 形式のチェック (正規表現)
    const postalRegex = /^\d{3}-\d{4}$/;
    return postalRegex.test(postalCode);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // フォームのデフォルト送信動作をキャンセル

    let currentErrors: FormErrors = {};
    let formIsValid = true;

    // --- バリデーション ---
    // 名前
    if (!formData.name.trim()) {
      currentErrors.name = '名前は必須です。';
      formIsValid = false;
    }

    // 年齢
    const ageNum = Number(formData.age);
    if (formData.age === '' || isNaN(ageNum) || ageNum < 0) {
      currentErrors.age = '有効な年齢を数値で入力してください。';
      formIsValid = false;
    }

    // 郵便番号
    if (!formData.postalCode.trim()) {
      currentErrors.postalCode = '郵便番号は必須です。';
      formIsValid = false;
    } else if (!validatePostalCode(formData.postalCode)) {
      currentErrors.postalCode = '郵便番号は xxx-xxxx の形式で入力してください。';
      formIsValid = false;
    }

    // 住所
    if (!formData.address.trim()) {
      currentErrors.address = '住所は必須です。';
      formIsValid = false;
    }

    setErrors(currentErrors);

    if (formIsValid) {
      // 型に準拠したデータを作成
      const submitData: FormDataModel = {
        ...formData,
        age: ageNum, // ここで数値に変換
      };
      console.log('送信データ (FormDataModel 型):', submitData);
      // ここで実際の送信処理などを行う (今回はコンソール表示のみ)
      alert('フォームデータがコンソールに出力されました！');
      // 送信成功後、フォームをリセットする場合
      // setFormData(initialFormData);
      // setErrors({});
    } else {
      console.log('入力エラー:', currentErrors);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>情報入力フォーム (React + TypeScript)</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name">名前:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
            />
            {errors.name && <p className="error-message">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="age">年齢:</label>
            <input
              type="text" // 初期入力は文字列として受け取り、送信時に数値に変換
              id="age"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
            />
            {errors.age && <p className="error-message">{errors.age}</p>}
          </div>

          <div>
            <label htmlFor="gender">性別:</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
            >
              {/* Object.values(Gender) を使って Enum の全ての値を取得 */}
              {Object.values(Gender).map((genderValue) => (
                <option key={genderValue} value={genderValue}>
                  {genderValue}
                </option>
              ))}
            </select>
            {/* 性別はselectなので直接的な型エラーは起きにくいが、必須チェックなどは可能 */}
          </div>

          <div>
            <label htmlFor="postalCode">郵便番号 (例: 123-4567):</label>
            <input
              type="text"
              id="postalCode"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleInputChange}
              placeholder="123-4567"
            />
            {errors.postalCode && <p className="error-message">{errors.postalCode}</p>}
          </div>

          <div>
            <label htmlFor="address">住所:</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
            />
            {errors.address && <p className="error-message">{errors.address}</p>}
          </div>

          <button type="submit">送信</button>
        </form>
      </header>
    </div>
  );
}

export default App;