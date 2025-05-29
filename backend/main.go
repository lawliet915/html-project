// backend/main.go
package main

import (
	"database/sql"  // SQLデータベース操作用
	"encoding/json" // JSONデータのエンコード/デコード用
	"fmt"
	"log"
	"net/http"
	"os"   // 環境変数PORTの読み取り用
	"time" // UserResponseのタイムスタンプ用 (任意)

	_ "github.com/go-sql-driver/mysql" // MySQLドライバ (直接は使わないが初期化のために必要)
	"github.com/google/uuid"           // UUID生成用
)

// --- グローバル変数 ---
var db *sql.DB // DB接続情報を保持

// --- 課題9: ユーザー登録関連の型定義 ---
type UserCreateRequest struct {
	Name        string `json:"name"`
	Age         int    `json:"age"`
	Sex         int    `json:"sex"`
	Description string `json:"description"`
}

type UserResponse struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Age         int       `json:"age"`
	Sex         int       `json:"sex"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"` // (任意)
	UpdatedAt   time.Time `json:"updated_at"` // (任意)
}

// --- 課題8: 電卓関連の型定義 ---
type CalculationRequest struct {
	Num1      float64 `json:"num1"`
	Num2      float64 `json:"num2"`
	Operation string  `json:"operation"` // "add", "subtract", "multiply", "divide"
}

type CalculationResponse struct {
	Result float64 `json:"result"`
	Error  string  `json:"error,omitempty"` // エラーがある場合のみ含まれる
}

// --- 課題9: ユーザー登録用ハンドラ ---
func createUserHandler(w http.ResponseWriter, r *http.Request) {
	// CORS対応
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	var req UserCreateRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid request body: "+err.Error(), http.StatusBadRequest)
		return
	}

	userID := uuid.New().String()

	stmt, err := db.Prepare("INSERT INTO Users(id, name, age, sex, description) VALUES(?, ?, ?, ?, ?)")
	if err != nil {
		log.Printf("Error preparing statement: %v", err)
		http.Error(w, "Server error: could not prepare statement", http.StatusInternalServerError)
		return
	}
	defer stmt.Close()

	_, err = stmt.Exec(userID, req.Name, req.Age, req.Sex, req.Description)
	if err != nil {
		log.Printf("Error executing statement: %v", err)
		http.Error(w, "Server error: could not create user", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"id": userID, "message": "User created successfully"})
}

// --- 課題8: 電卓用ハンドラ ---
func calculateHandler(w http.ResponseWriter, r *http.Request) {
	// CORS対応
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	var req CalculationRequest
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
		w.WriteHeader(http.StatusBadRequest)
	} else {
		res.Result = result
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
}

// --- main関数 ---
func main() {
	// データベース接続設定
	// ローカルからDockerコンテナのMySQLに接続するため、ホスト名を "localhost" に設定
	dsn := "dbuser:dbpassword@tcp(localhost:3306)/user_db?parseTime=true"
	var err error
	db, err = sql.Open("mysql", dsn)
	if err != nil {
		log.Fatalf("Error opening database: %v", err)
	}
	defer db.Close()

	// DB接続テスト
	err = db.Ping()
	if err != nil {
		log.Fatalf("Error connecting to database: %v", err)
	}
	fmt.Println("Successfully connected to the database!")

	// エンドポイントのルーティング設定
	http.HandleFunc("/users", createUserHandler)     // 課題9のユーザー登録API
	http.HandleFunc("/calculate", calculateHandler) // 課題8の電卓API

	// サーバーポート設定と起動
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" // デプロイ環境以外でのデフォルトポート
	}
	fmt.Printf("Backend server starting on port %s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}