import React, { useState } from 'react';
import './App.css';

function App() {
  // useStateフックを使って、各入力値、積の結果、エラーメッセージの状態を管理します
  const [input1, setInput1] = useState(''); // 1つ目の入力値
  const [input2, setInput2] = useState(''); // 2つ目の入力値
  const [product, setProduct] = useState(null); // 積の結果
  const [error, setError] = useState('');     // エラーメッセージ

  // ボタンがクリックされたときの処理
  const handleCalculate = () => {
    // まずエラーメッセージと前の結果をリセット
    setError('');
    setProduct(null);

    // input1とinput2が空でないか、かつ、数値であるかを確認
    const num1 = parseFloat(input1);
    const num2 = parseFloat(input2);

    if (input1.trim() === '' || input2.trim() === '') {
      setError('両方の入力欄に値を入力してください。');
      return;
    }

    if (isNaN(num1) || isNaN(num2)) {
      setError('数字以外の文字列が入力されています。数字を入力してください。');
    } else {
      setProduct(num1 * num2); // 積を計算して結果を更新
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>積計算アプリ</h1>
        <div>
          <input
            type="text" // type="number" にすると入力制限ができるが、今回はエラー処理の練習のためtext
            value={input1}
            onChange={(e) => setInput1(e.target.value)} // 入力値が変わったらinput1の状態を更新
            placeholder="数字1"
          />
          <input
            type="text"
            value={input2}
            onChange={(e) => setInput2(e.target.value)} // 入力値が変わったらinput2の状態を更新
            placeholder="数字2"
          />
          <button onClick={handleCalculate}>計算する</button>
        </div>

        {/* エラーがある場合にエラーメッセージを表示 */}
        {error && <p style={{ color: 'red' }}>エラー: {error}</p>}

        {/* 積の結果が計算されたら表示 */}
        {product !== null && <p>2つの数字の積は {product} です</p>}
      </header>
    </div>
  );
}

export default App;