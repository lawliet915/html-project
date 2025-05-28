// frontend/calculator-ui/src/App.tsx
import React, { useState, FormEvent, ChangeEvent } from 'react';
import './App.css';
import { CalculationPayload, CalculationResult } from './types';

function App() {
  const [num1, setNum1] = useState<string>('');
  const [num2, setNum2] = useState<string>('');
  const [operation, setOperation] = useState<string>('add');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResult(null); // 前回の結果をクリア
    setError(null);  // 前回のエラーをクリア

    const n1 = parseFloat(num1);
    const n2 = parseFloat(num2);

    if (isNaN(n1) || isNaN(n2)) {
      setError('有効な数値を入力してください。');
      return;
    }

    const payload: CalculationPayload = {
      num1: n1,
      num2: n2,
      operation: operation,
    };

    try {
      // バックエンドAPI (Goサーバー) のURLを指定
      // Goサーバーが8080番ポートで動いていることを想定
      const response = await fetch('http://localhost:8080/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data: CalculationResult = await response.json();

      if (!response.ok || data.error) { // HTTPエラーまたはAPIからのエラーメッセージ
        setError(data.error || `エラーが発生しました (HTTP Status: ${response.status})`);
        setResult(null);
      } else {
        setResult(data.result !== undefined ? data.result.toString() : '計算結果なし');
        setError(null);
      }
    } catch (err) {
      console.error('APIリクエストエラー:', err);
      setError('サーバーとの通信に失敗しました。バックエンドサーバーが起動しているか確認してください。');
      setResult(null);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>React + Go 電卓</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <input
              type="text" // textのまま扱い、送信時に数値変換
              value={num1}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setNum1(e.target.value)}
              placeholder="数値1"
              required
            />
          </div>
          <div>
            <select
              value={operation}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setOperation(e.target.value)}
            >
              <option value="add">足し算 (+)</option>
              <option value="subtract">引き算 (-)</option>
              <option value="multiply">掛け算 (×)</option>
              <option value="divide">割り算 (÷)</option>
            </select>
          </div>
          <div>
            <input
              type="text"
              value={num2}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setNum2(e.target.value)}
              placeholder="数値2"
              required
            />
          </div>
          <button type="submit">計算する</button>
        </form>
        {result !== null && (
          <div className="result">
            <h2>計算結果: {result}</h2>
          </div>
        )}
        {error && (
          <div className="error">
            <p>エラー: {error}</p>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;