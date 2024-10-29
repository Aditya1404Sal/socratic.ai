package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/redis/go-redis/v9"
)

type User struct {
	UserID       string
	Email        string
	Name         string
	ChatSessions []Chat
}

type Chat struct {
	ChatID      string
	ChatContext ChatContext
}

const (
	redisAddr = "localhost:6379"
)

var (
	redisClient *redis.Client
)

func baseHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hello, World!")
}

func redisInit() {
	redisClient = redis.NewClient(&redis.Options{
		Addr:     redisAddr,
		Password: "somepassword",
	})
}

type ChatContext struct {
	UserID  string
	History []MessageHistory
}

type MessageRequest struct {
	BotMessages  []string `json:"botMessages"`
	UserMessages []string `json:"userMessages"`
}

type MessageHistory struct {
	SessionTime  string
	BotMessages  []string
	UserMessages []string
}

func saveHistoryHandler(w http.ResponseWriter, r *http.Request) {
	userID := r.FormValue("userID")
	chatID := r.FormValue("chatID")
	sessionTime := r.FormValue("sessionTime")

	chatContext := createChatContext(userID)
	chat := Chat{
		ChatID:      chatID,
		ChatContext: chatContext,
	}

	var messages MessageRequest
	if err := json.NewDecoder(r.Body).Decode(&messages); err != nil {
		http.Error(w, "Error decoding request body: "+err.Error(), http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	history := MessageHistory{
		SessionTime:  sessionTime,
		BotMessages:  messages.BotMessages,
		UserMessages: messages.UserMessages,
	}

	if redisClient.HExists(context.Background(), "chats", chatID).Val() {
		existingChatStr, err := redisClient.HGet(context.Background(), "chats", chatID).Result()
		if err != nil {
			http.Error(w, "Error getting existing chat: "+err.Error(), http.StatusInternalServerError)
			return
		}

		var existingChat Chat
		if err := json.Unmarshal([]byte(existingChatStr), &existingChat); err != nil {
			http.Error(w, "Error unmarshaling existing chat: "+err.Error(), http.StatusInternalServerError)
			return
		}

		existingChat.ChatContext.History = append(existingChat.ChatContext.History, history)
		redisClient.HSet(context.Background(), "chats", chatID, existingChat)
	} else {
		redisClient.HSet(context.Background(), "chats", chatID, chat)
	}

	// Now check if chatID is in the user's chatSessions, if not, append it

	if redisClient.HExists(context.Background(), "users", userID).Val() {
		userStr, err := redisClient.HGet(context.Background(), "users", userID).Result()
		if err != nil {
			http.Error(w, "Error getting user:"+err.Error(), http.StatusInternalServerError)
		}

		var user User
		if err := json.Unmarshal([]byte(userStr), &user); err != nil {
			http.Error(w, "Error unmarshaling user: "+err.Error(), http.StatusInternalServerError)
			return
		}

		chatExists := false

		for _, chat := range user.ChatSessions {
			if chat.ChatID == chatID {
				chatExists = true
				break
			}
		}

		if !chatExists {
			user.ChatSessions = append(user.ChatSessions, chat)
			redisClient.HSet(context.Background(), "users", userID, user)
		}
	}
}

func createChatContext(userID string) ChatContext {
	return ChatContext{
		UserID:  userID,
		History: []MessageHistory{},
	}
}

func registerUserHandler(w http.ResponseWriter, r *http.Request) {
	userID := r.FormValue("userID")
	email := r.FormValue("email")
	name := r.FormValue("name")

	user := User{
		UserID: userID,
		Email:  email,
		Name:   name,
	}
	ctx := context.Background()
	redisClient.HSet(ctx, "users", userID, user)
}

func main() {
	redisInit()
	defer redisClient.Close()

	http.HandleFunc("/", baseHandler)
	http.HandleFunc("RegisterUser", registerUserHandler)
	http.HandleFunc("/save-history", saveHistoryHandler)
	if err := http.ListenAndServe(":8080", nil); err != nil {
		panic(err)
	}
}
