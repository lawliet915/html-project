// backend/main_test.go
package main // テスト対象と同じパッケージ名を指定

import (
	"bytes"         // HTTPリクエストボディの作成用
	"encoding/json" // JSONデータのエンコード/デコード用
	"net/http"
	"net/http/httptest" // HTTPテスト用のユーティリティ
	"testing"           // Goのテストフレームワーク
)

// TestCalculateHandler は calculateHandler のテスト関数です。
// テスト関数名は TestXxx の形式にする必要があります (Xxx はテスト対象の関数名など)。
func TestCalculateHandler(t *testing.T) {
	// テストケースを定義します。
	// 各テストケースは、入力(リクエスト)、期待される出力(レスポンスのステータスコード、結果、エラーメッセージ)を持ちます。
	testCases := []struct {
		name             string               // テストケースの名前
		input            CalculationRequest   // ハンドラへの入力 (リクエストボディ)
		expectedStatus   int                  // 期待されるHTTPステータスコード
		expectedResult   float64              // 期待される計算結果 (エラーがない場合)
		expectedErrorMsg string               // 期待されるエラーメッセージ (エラーがある場合)
		checkResult      bool                 // 計算結果の数値をチェックするかどうか
	}{
		{
			name:           "足し算_正常系",
			input:          CalculationRequest{Num1: 5, Num2: 3, Operation: "add"},
			expectedStatus: http.StatusOK, // 200 OK
			expectedResult: 8,
			checkResult:    true,
		},
		{
			name:           "引き算_正常系",
			input:          CalculationRequest{Num1: 10, Num2: 4, Operation: "subtract"},
			expectedStatus: http.StatusOK,
			expectedResult: 6,
			checkResult:    true,
		},
		{
			name:           "掛け算_正常系",
			input:          CalculationRequest{Num1: 7, Num2: 3, Operation: "multiply"},
			expectedStatus: http.StatusOK,
			expectedResult: 21,
			checkResult:    true,
		},
		{
			name:           "割り算_正常系",
			input:          CalculationRequest{Num1: 10, Num2: 2, Operation: "divide"},
			expectedStatus: http.StatusOK,
			expectedResult: 5,
			checkResult:    true,
		},
		{
			name:             "割り算_ゼロ除算エラー", // エラーの生じるテストケース
			input:            CalculationRequest{Num1: 5, Num2: 0, Operation: "divide"},
			expectedStatus:   http.StatusBadRequest, // 400 Bad Request
			expectedErrorMsg: "Error: Division by zero",
			checkResult:      false,
		},
		{
			name:             "無効な演算子エラー", // エラーの生じるテストケース
			input:            CalculationRequest{Num1: 5, Num2: 3, Operation: "unknown"},
			expectedStatus:   http.StatusBadRequest,
			expectedErrorMsg: "Error: Invalid operation",
			checkResult:      false,
		},
		{
			name:           "負の数の足し算",
			input:          CalculationRequest{Num1: -5, Num2: 3, Operation: "add"},
			expectedStatus: http.StatusOK,
			expectedResult: -2,
			checkResult:    true,
		},
		{
			name:           "小数点の掛け算",
			input:          CalculationRequest{Num1: 2.5, Num2: 2, Operation: "multiply"},
			expectedStatus: http.StatusOK,
			expectedResult: 5.0,
			checkResult:    true,
		},
	}

	// 各テストケースを実行します。
	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			// リクエストボディをJSONにエンコードします。
			payloadBytes, err := json.Marshal(tc.input)
			if err != nil {
				t.Fatalf("テストケース'%s': リクエストボディのJSONエンコードに失敗しました: %v", tc.name, err)
			}
			bodyReader := bytes.NewReader(payloadBytes)

			// HTTPリクエストを作成します。
			// 第2引数のURLは、ハンドラがURLパス自体を解釈しない場合は何でも良いですが、
			// 実際のパスに合わせておくとより現実に近くなります。
			req, err := http.NewRequest("POST", "/calculate", bodyReader)
			if err != nil {
				t.Fatalf("テストケース'%s': HTTPリクエストの作成に失敗しました: %v", tc.name, err)
			}
			req.Header.Set("Content-Type", "application/json")

			// レスポンスレコーダーを作成します (実際のHTTPレスポンスをキャプチャするため)。
			rr := httptest.NewRecorder()

			// テスト対象のハンドラ関数 (calculateHandler) を取得または直接呼び出します。
			// calculateHandler が main.go で定義されていることを前提とします。
			// このテストではDB接続は不要なので、calculateHandler がDBに依存しないことを確認してください。
			// (課題8の電卓はDBに依存していませんでした)
			handler := http.HandlerFunc(calculateHandler)
			handler.ServeHTTP(rr, req) // ハンドラを実行

			// ステータスコードをチェックします。
			if status := rr.Code; status != tc.expectedStatus {
				t.Errorf("テストケース'%s': 期待するステータスコード %v, しかし得られたのは %v. レスポンスボディ: %s",
					tc.name, tc.expectedStatus, status, rr.Body.String())
			}

			// レスポンスボディをデコードします。
			var responseBody CalculationResponse
			// レスポンスボディが空でない場合のみデコードを試みます。
			if rr.Body.Len() > 0 {
				if err := json.NewDecoder(rr.Body).Decode(&responseBody); err != nil {
					// JSONデコードエラーは、エラーメッセージを期待していない場合のみテスト失敗とします。
					if tc.expectedErrorMsg == "" {
						t.Errorf("テストケース'%s': レスポンスボディのJSONデコードに失敗しました: %v. ボディ: %s", tc.name, err, rr.Body.String())
					}
				}
			}

			// エラーメッセージをチェックします (エラーが期待される場合)。
			if tc.expectedErrorMsg != "" {
				if responseBody.Error != tc.expectedErrorMsg {
					t.Errorf("テストケース'%s': 期待するエラーメッセージ '%s', しかし得られたのは '%s'",
						tc.name, tc.expectedErrorMsg, responseBody.Error)
				}
			} else {
				// エラーが期待されない場合は、レスポンスにエラーメッセージがないことを確認します。
				if responseBody.Error != "" {
					t.Errorf("テストケース'%s': エラーは期待されていませんでしたが、エラーメッセージ '%s' を受信しました", tc.name, responseBody.Error)
				}
			}

			// 計算結果をチェックします (エラーがなく、結果チェックフラグがtrueの場合)。
			if tc.checkResult && responseBody.Error == "" {
				if responseBody.Result != tc.expectedResult {
					t.Errorf("テストケース'%s': 期待する結果 %v, しかし得られたのは %v",
						tc.name, tc.expectedResult, responseBody.Result)
				}
			}
		})
	}
}
