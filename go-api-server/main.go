// main.go
package main

import (
	"fmt"      // 文字列のフォーマットや出力に使います
	"log"      // ログ出力に使います
	"net/http" // HTTPサーバー機能を提供します
	"strconv"  // 文字列と数値の変換に使います
)

// /hello エンドポイントの処理関数
func helloHandler(w http.ResponseWriter, r *http.Request) {
	// URLクエリパラメータから "name" を取得
	name := r.URL.Query().Get("name")

	if name == "" {
		// nameが空の場合は "Hello world" を表示
		fmt.Fprint(w, "Hello world")
	} else {
		// nameが指定されている場合は "Hello {name}!" を表示
		fmt.Fprintf(w, "Hello %s!", name)
	}
}

// /sum エンドポイントの処理関数
func sumHandler(w http.ResponseWriter, r *http.Request) {
	// URLクエリパラメータから "x" と "y" を取得
	xStr := r.URL.Query().Get("x")
	yStr := r.URL.Query().Get("y")

	// 文字列を数値 (int) に変換
	x, errX := strconv.Atoi(xStr) // Atoi は "ASCII to Integer" の略
	y, errY := strconv.Atoi(yStr)

	// 変換エラーチェック
	if errX != nil || errY != nil {
		// どちらかの変換でエラーがあれば、エラーメッセージを返して処理を中断
		http.Error(w, "Invalid parameters: x and y must be numbers.", http.StatusBadRequest)
		return
	}

	// 合計を計算して表示
	sum := x + y
	fmt.Fprintf(w, "%d", sum) // %d は数値を文字列としてフォーマットする指定子
}

func main() {
	// ルート (エンドポイント) と対応する処理関数を結びつける
	http.HandleFunc("/hello", helloHandler)
	http.HandleFunc("/sum", sumHandler)

	// サーバーを起動するポートを指定
	port := ":8000"
	fmt.Printf("Server starting on port %s\n", port)

	// HTTPサーバーを起動
	// もしエラーが発生したらログに出力してプログラムを終了
	log.Fatal(http.ListenAndServe(port, nil))
}