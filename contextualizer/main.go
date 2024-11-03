package main

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

type User struct {
	UserID       string `json:"userId"`
	Email        string `json:"email"`
	Name         string `json:"name"`
	ChatSessions []Chat `json:"chatSessions"`
}

type Chat struct {
	ChatID      string      `json:"chatId"`
	ChatContext ChatContext `json:"chatContext"`
}

type ChatContext struct {
	UserID  string           `json:"userId"`
	History []MessageHistory `json:"history"`
}

type MessageRequest struct {
	BotMessages  []string `json:"botMessages"`
	UserMessages []string `json:"userMessages"`
}

type MessageHistory struct {
	SessionTime  string   `json:"sessionTime"`
	BotMessages  []string `json:"botMessages"`
	UserMessages []string `json:"userMessages"`
}

const (
	redisAddr = "localhost:6379"
)

var (
	redisClient *redis.Client
)

func redisInit() {
	redisClient = redis.NewClient(&redis.Options{
		Addr:     redisAddr,
		Password: "somepassword",
	})
}

func baseHandler(c *gin.Context) {
	c.String(http.StatusOK, "Hello, World!")
}

func registerUserHandler(c *gin.Context) {
	var user User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	ctx := context.Background()
	if err := redisClient.HSet(ctx, "users", user.UserID, user).Err(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User registered successfully"})
}

func saveHistoryHandler(c *gin.Context) {
	userID := c.Query("userID")
	chatID := c.Query("chatID")
	sessionTime := c.Query("sessionTime")

	if userID == "" || chatID == "" || sessionTime == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing required parameters"})
		return
	}

	var messages MessageRequest
	if err := c.ShouldBindJSON(&messages); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	chatContext := createChatContext(userID)
	chat := Chat{
		ChatID:      chatID,
		ChatContext: chatContext,
	}

	history := MessageHistory{
		SessionTime:  sessionTime,
		BotMessages:  messages.BotMessages,
		UserMessages: messages.UserMessages,
	}

	ctx := context.Background()

	// Check if chat exists
	if exists := redisClient.HExists(ctx, "chats", chatID).Val(); exists {
		existingChatStr, err := redisClient.HGet(ctx, "chats", chatID).Result()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get existing chat"})
			return
		}

		var existingChat Chat
		if err := json.Unmarshal([]byte(existingChatStr), &existingChat); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse existing chat"})
			return
		}

		existingChat.ChatContext.History = append(existingChat.ChatContext.History, history)
		if err := redisClient.HSet(ctx, "chats", chatID, existingChat).Err(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update chat"})
			return
		}
	} else {
		if err := redisClient.HSet(ctx, "chats", chatID, chat).Err(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create new chat"})
			return
		}
	}

	// Update user's chat sessions if needed
	if exists := redisClient.HExists(ctx, "users", userID).Val(); exists {
		userStr, err := redisClient.HGet(ctx, "users", userID).Result()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user"})
			return
		}

		var user User
		if err := json.Unmarshal([]byte(userStr), &user); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse user data"})
			return
		}

		chatExists := false
		for _, existingChat := range user.ChatSessions {
			if existingChat.ChatID == chatID {
				chatExists = true
				break
			}
		}

		if !chatExists {
			user.ChatSessions = append(user.ChatSessions, chat)
			if err := redisClient.HSet(ctx, "users", userID, user).Err(); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user chat sessions"})
				return
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "History saved successfully"})
}

func getHistoryHandler(c *gin.Context) {
	userID := c.Query("userID")
	chatID := c.Query("chatID")

	if userID == "" || chatID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing required parameters"})
		return
	}

	ctx := context.Background()

	// Check if user exists
	if exists := redisClient.HExists(ctx, "users", userID).Val(); !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "User does not exist"})
		return
	}

	// Check if chat exists
	if exists := redisClient.HExists(ctx, "chats", chatID).Val(); !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Chat not found"})
		return
	}

	// Get chat data
	chatStr, err := redisClient.HGet(ctx, "chats", chatID).Result()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get chat data"})
		return
	}

	var existingChat Chat
	if err := json.Unmarshal([]byte(chatStr), &existingChat); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse chat data"})
		return
	}

	// Verify chat ownership
	if existingChat.ChatContext.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Unauthorized access to chat"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"chatId":  existingChat.ChatID,
		"userId":  existingChat.ChatContext.UserID,
		"history": existingChat.ChatContext.History,
	})
}

func createChatContext(userID string) ChatContext {
	return ChatContext{
		UserID:  userID,
		History: []MessageHistory{},
	}
}

func main() {
	redisInit()
	defer redisClient.Close()

	router := gin.Default()

	router.GET("/", baseHandler)

	api := router.Group("/api")
	{
		api.POST("/register", registerUserHandler)
		api.POST("/save-history", saveHistoryHandler)
		api.GET("/get-history", getHistoryHandler)
	}

	if err := router.Run(":8080"); err != nil {
		panic(err)
	}
}
