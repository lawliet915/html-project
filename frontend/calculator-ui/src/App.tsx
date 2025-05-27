// frontend/calculator-ui/src/App.tsx
import React, { useState, FormEvent, ChangeEvent } from 'react';
import './App.css';
import { UserFormData, UserSex, UserCreateResponse } from './types'; // 新しい型をインポート

function App() {
  const initialFormData: UserFormData = {
    name: '',
    age: '',
    sex: UserSex.Unknown,
    description: '',
  };

  const [formData, setFormData] = useState<UserFormData>(initialFormData);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'sex' ? parseInt(value, 10) : value, // sexは数値に変換
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    const ageNum = parseInt(formData.age, 10);
    if (isNaN(ageNum) || ageNum <= 0) {
      setError('有効な年齢を入力してください。');
      return;
    }
    if (!formData.name.trim()) {
        setError('名前は必須です。');
        return;
    }


    const payload = {
      name: formData.name,
      age: ageNum,
      sex: formData.sex, // UserSex enumの値 (数値)
      description: formData.description,
    };

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080'; // 課題8と同様
      const response = await fetch(`${apiUrl}/users`, { // エンドポイントを /users に変更
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data: UserCreateResponse = await response.json();

      if (!response.ok || data.error) {
        setError(data.error || data.message || `エラー (HTTP: ${response.status})`);
      } else {
        setMessage(data.message || 'ユーザーが正常に登録されました。ID: ' + data.id);
        setFormData(initialFormData); // フォームをリセット
      }
    } catch (err) {
      console.error('APIリクエストエラー:', err);
      setError('サーバーとの通信に失敗しました。');
    }
  };

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
              type="number" // type="number" に変更
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
                .filter(([key, value]) => !isNaN(Number(value))) // 数値のキーを除外 (enumの逆マッピング対策)
                .map(([key, value]) => (
                  <option key={value as number} value={value as number}>
                    {key} {/* または日本語のラベルを別途用意 */}
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
        {message && <div className="message success">{message}</div>}
        {error && <div className="message error">{error}</div>}
      </header>
    </div>
  );
}

export default App;