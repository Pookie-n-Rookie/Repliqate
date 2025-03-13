package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
	"github.com/nedpals/supabase-go"
)

var supabaseClient *supabase.Client

type ClipboardEntry struct {
	ID        int    `json:"id"`
	Content   string `json:"content"`
	Type      string `json:"type"`
	CreatedAt string `json:"created_at"`
}

func main() {
	// Load environment variables
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not found, relying on environment variables")
	}

	supabaseUrl := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_KEY")

	// Ensure environment variables are loaded
	if supabaseUrl == "" || supabaseKey == "" {
		log.Fatal("❌ Missing Supabase URL or API Key. Check your .env file.")
	}

	// Initialize Supabase client
	supabaseClient = supabase.CreateClient(supabaseUrl, supabaseKey)
	if supabaseClient == nil {
		log.Fatal("❌ Failed to initialize Supabase client")
	}

	// Serve static files
	fs := http.FileServer(http.Dir("static"))
	http.Handle("/", fs)

	// API endpoints
	http.HandleFunc("/copy", copyHandler)
	http.HandleFunc("/paste", pasteHandler)
	http.HandleFunc("/history", historyHandler)
	http.HandleFunc("/delete", deleteHandler)

	// Start the server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	fmt.Printf("🚀 Server started at :%s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func copyHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	// Parse form data
	err := r.ParseForm()
	if err != nil {
		http.Error(w, "Error parsing form", http.StatusBadRequest)
		return
	}

	// Get content and type from the form
	content := r.FormValue("content")
	contentType := r.FormValue("type")

	// Validate content and type
	if content == "" || (contentType != "text" && contentType != "image") {
		http.Error(w, "Invalid content or type", http.StatusBadRequest)
		return
	}

	// Insert into Supabase
	var res []map[string]interface{}
	err = supabaseClient.DB.From("clipboard_history").Insert(map[string]interface{}{
		"content": content,
		"type":    contentType,
	}).Execute(&res)
	if err != nil {
		log.Printf("❌ Supabase Insert Error: %v", err)
		http.Error(w, "Failed to save to database", http.StatusInternalServerError)
		return
	}

	fmt.Fprintln(w, "✅ Content saved!")
}

func pasteHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	var results []ClipboardEntry
	err := supabaseClient.DB.From("clipboard_history").
		Select("*").
		OrderBy("created_at", "desc").
		Limit(1).
		Execute(&results)

	if err != nil || len(results) == 0 {
		http.Error(w, "No content found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results[0])
}

func historyHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	var results []ClipboardEntry
	err := supabaseClient.DB.From("clipboard_history").
		Select("*").
		OrderBy("created_at", "desc").
		Execute(&results)

	if err != nil {
		log.Printf("❌ Supabase History Fetch Error: %v", err)
		http.Error(w, "Failed to fetch history", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}

func deleteHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	// Extract the ID from the query parameters
	id := r.URL.Query().Get("id")
	if id == "" {
		http.Error(w, "Missing entry ID", http.StatusBadRequest)
		return
	}

	// Delete from Supabase
	var res []map[string]interface{}
	err := supabaseClient.DB.From("clipboard_history").
		Delete().
		Eq("id", id).
		Execute(&res)
	if err != nil {
		log.Printf("❌ Supabase Delete Error: %v", err)
		http.Error(w, "Failed to delete entry", http.StatusInternalServerError)
		return
	}

	fmt.Fprintln(w, "✅ Entry deleted!")
}
