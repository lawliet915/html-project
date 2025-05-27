// backend/main.go
package main

import (
	"database/sql" // SQLデータベース操作用
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time" // (任意) created_at/updated_at用

	_ "github.com/go-sql-driver/mysql" // MySQLドライバ (直接は使わないが初期化のために必要)
	"github.com/google/uuid"           // UUID生成用
)

// DB接続情報を保持するグローバル変数
var db *sql.DB

// ユーザー登録リクエストの型
type UserCreateRequest struct {
	Name        string `json:"name"`
	Age         int    `json:"age"`
	Sex         int    `json:"sex"`
	Description string `json:"description"`
}

// ユーザー情報レスポンスの型 (例として)
type UserResponse struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Age         int       `json:"age"`
	Sex         int       `json:"sex"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"` // (任意)
	UpdatedAt   time.Time `json:"updated_at"` // (任意)
}

func createUserHandler(w http.ResponseWriter, r *http.Request) {
	// CORS対応 (課題8と同様)
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

	// UUIDを生成
	userID := uuid.New().String()

	// SQLインジェクション対策のため、プリペアドステートメントを使用
	stmt, err := db.Prepare("INSERT INTO Users(id, name, age, sex, description) VALUES(?, ?, ?, ?, ?)")
	if err != nil {
		log.Printf("Error preparing statement: %v", err)
		http.Error(w, "Server error: could not prepare statement", http.StatusInternalServerError)
		return
	}
	defer stmt.Close() // 関数終了時にステートメントをクローズ

	_, err = stmt.Exec(userID, req.Name, req.Age, req.Sex, req.Description)
	if err != nil {
		log.Printf("Error executing statement: %v", err)
		http.Error(w, "Server error: could not create user", http.StatusInternalServerError)
		return
	}

	// 登録成功のレスポンス (例としてIDを返す)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated) // 201 Created
	json.NewEncoder(w).Encode(map[string]string{"id": userID, "message": "User created successfully"})
}

// 課題8の calculateHandler は削除しても、残しておいても良い
// func calculateHandler(w http.ResponseWriter, r *http.Request) { ... }

func main() {
	// データベース接続文字列 (DSN: Data Source Name)
	// docker-compose.yml で設定したユーザー名、パスワード、データベース名を使用
	// "db" は docker-compose.yml で定義したMySQLサービスのホスト名
	dsn := "dbuser:dbpassword@tcp(localhost:3306)/user_db?parseTime=true"
	var err error
	db, err = sql.Open("mysql", dsn)
	if err != nil {
		log.Fatalf("Error opening database: %v", err)
	}
	defer db.Close() // main関数終了時にDB接続をクローズ

	// 接続テスト
	err = db.Ping()
	if err != nil {
		log.Fatalf("Error connecting to database: %v", err)
	}
	fmt.Println("Successfully connected to the database!")

	http.HandleFunc("/users", createUserHandler) // 新しいエンドポイント
	// http.HandleFunc("/calculate", calculateHandler) // 課題8のものを残す場合

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	fmt.Printf("Backend server starting on port %s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}