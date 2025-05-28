// backend/main.go
package main

import (
	"encoding/json" // JSONデータのエンコード/デコード用
	"fmt"
	"log"
	"net/http"
)

// リクエストボディの型定義 (フロントエンドから送られてくるデータ)
type CalculationRequest struct {
	Num1      float64 `json:"num1"`
	Num2      float64 `json:"num2"`
	Operation string  `json:"operation"` // "add", "subtract", "multiply", "divide"
}

// レスポンスボディの型定義 (バックエンドから返すデータ)
type CalculationResponse struct {
	Result float64 `json:"result"`
	Error  string  `json:"error,omitempty"` // エラーがある場合のみ含まれる
}

func calculateHandler(w http.ResponseWriter, r *http.Request) {
	// CORS対応: 異なるポートで動作するフロントエンドからのリクエストを許可
	w.Header().Set("Access-Control-Allow-Origin", "*") // 本番環境では具体的なドメインを指定
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	// OPTIONSリクエストへの対応 (プリフライトリクエスト)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	var req CalculationRequest
	// リクエストボディのJSONをデコードして req 構造体にマッピング
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&req)
	if err != nil {
		http.Error(w, "Invalid request body: "+err.Error(), http.StatusBadRequest)
		return
	}

	var result float64
	var errorMsg string

	switch req.Operation {
	case "add":
		result = req.Num1 + req.Num2
	case "subtract":
		result = req.Num1 - req.Num2
	case "multiply":
		result = req.Num1 * req.Num2
	case "divide":
		if req.Num2 == 0 {
			errorMsg = "Error: Division by zero"
		} else {
			result = req.Num1 / req.Num2
		}
	default:
		errorMsg = "Error: Invalid operation"
	}

	res := CalculationResponse{}
	if errorMsg != "" {
		res.Error = errorMsg
		w.WriteHeader(http.StatusBadRequest) // エラーがある場合は400エラー
	} else {
		res.Result = result
	}

	w.Header().Set("Content-Type", "application/json") // レスポンスの型をJSONに指定
	json.NewEncoder(w).Encode(res) // 結果をJSON形式でレスポンスとして送信
}

func main() {
	http.HandleFunc("/calculate", calculateHandler)

	port := ":8080" // フロントエンドと区別するため、8080番ポートを使用
	fmt.Printf("Backend server starting on port %s\n", port)
	log.Fatal(http.ListenAndServe(port, nil))
}