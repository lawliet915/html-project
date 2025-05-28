// frontend/calculator-ui/src/App.tsx
import React, { useState, FormEvent, ChangeEvent } from 'react';
import './App.css';
import { UserFormData, UserSex, UserCreateResponse } from './types'; // 課題9の型をインポート

function App() {
  // 課題9のユーザー登録フォームの状態管理
  const initialFormData: UserFormData = {
    name: '',
    age: '',
    sex: UserSex.Unknown,
    description: '',
  };

  const [formData, setFormData] = useState<UserFormData>(initialFormData);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 課題9のユーザー登録フォームの入力ハンドラ
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      // 'sex'フィールドの場合は値を数値に変換し、それ以外はそのまま文字列として設定
      [name]: name === 'sex' ? parseInt(value, 10) : value,
    });
  };

  // 課題9のユーザー登録フォームの送信ハンドラ
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null); // 前回のメッセージをクリア
    setError(null);   // 前回のエラーをクリア

    // 年齢を数値に変換し、バリデーション
    const ageNum = parseInt(formData.age, 10);
    if (isNaN(ageNum) || ageNum <= 0) {
      setError('有効な年齢を入力してください。');
      return;
    }
    // 名前の必須チェック
    if (!formData.name.trim()) {
        setError('名前は必須です。');
        return;
    }

    // バックエンドに送信するペイロードを作成
    const payload = {
      name: formData.name,
      age: ageNum,
      sex: formData.sex, // UserSex enumの値 (数値)
      description: formData.description,
    };

    try {
      // 環境変数からAPIのURLを取得、なければローカルの8080ポートをデフォルトとする
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
      // /users エンドポイントにPOSTリクエストを送信
      const response = await fetch(`${apiUrl}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // レスポンスをJSONとしてパース
      const data: UserCreateResponse = await response.json();

      // レスポンスのステータスやエラー内容を確認
      if (!response.ok || data.error) {
        setError(data.error || data.message || `エラー (HTTP: ${response.status})`);
      } else {
        setMessage(data.message || 'ユーザーが正常に登録されました。ID: ' + data.id);
        setFormData(initialFormData); // 成功したらフォームをリセット
      }
    } catch (err) {
      console.error('APIリクエストエラー:', err);
      setError('サーバーとの通信に失敗しました。バックエンドサーバーが起動しているか確認してください。');
    }
  };

  // ユーザー登録フォームのJSX
  return (
    <div className="App">
      <header className="App-header">
        <h1>ユーザー登録フォーム</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name">名前:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor="age">年齢:</label>
            <input
              type="number" // 年齢入力なので type="number" が適切
              id="age"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor="sex">性別:</label>
            <select
              id="sex"
              name="sex"
              value={formData.sex}
              onChange={handleInputChange}
            >
              {/* UserSex enum から選択肢を動的に生成 */}
              {Object.entries(UserSex)
                // enumの数値キーを除外 (TypeScriptのenumは逆マッピングも持つため)
                .filter(([key, value]) => !isNaN(Number(value)))
                .map(([key, value]) => (
                  <option key={value as number} value={value as number}>
                    {key} {/* ここはUserSexのキー名 (Male, Femaleなど) が表示される */}
                    {/* もし日本語で表示したい場合は、別途ラベルのマッピングを用意する */}
                  </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="description">自己紹介文:</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
            />
          </div>
          <button type="submit">登録する</button>
        </form>
        {/* 成功メッセージの表示 */}
        {message && <div className="message success">{message}</div>}
        {/* エラーメッセージの表示 */}
        {error && <div className="message error">{error}</div>}
      </header>
    </div>
  );
}

export default App;
