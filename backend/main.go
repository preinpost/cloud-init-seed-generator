package main

import (
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"time"

	"github.com/gin-gonic/gin"
)

type CloudInitRequest struct {
	UserData      string `json:"user_data" form:"user_data"`
	MetaData      string `json:"meta_data" form:"meta_data"`
	NetworkConfig string `json:"network_config" form:"network_config"`
	IncludeNetwork bool  `json:"include_network" form:"include_network"`
}

func getISOCommand() string {
	var cmd string
	switch runtime.GOOS {
	case "darwin":
		cmd = "mkisofs"
	case "linux":
		cmd = "genisoimage"
	default:
		cmd = "mkisofs"
	}

	// Check if command exists
	if _, err := exec.LookPath(cmd); err != nil {
		panic("ISO creation tool not found: " + cmd + ". Please install it first.")
	}

	return cmd
}

func main() {
	r := gin.Default()

	// Serve static files
	r.Static("/assets", "./static/assets")
	r.StaticFile("/", "./static/index.html")

	// API routes
	api := r.Group("/api")
	{
		// Generate ISO endpoint
		api.POST("/generate", generateISO)

		// Health check
		api.GET("/health", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"status": "ok"})
		})
	}

	// SPA fallback - serve index.html for any non-API routes
	r.NoRoute(func(c *gin.Context) {
		c.File("./static/index.html")
	})

	r.Run(":8080")
}

func generateISO(c *gin.Context) {
	var req CloudInitRequest
	if err := c.ShouldBind(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Create temporary directory
	tmpDir := filepath.Join("/tmp", "cloudinit-"+time.Now().Format("20060102-150405"))
	if err := os.MkdirAll(tmpDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create temp directory"})
		return
	}
	defer os.RemoveAll(tmpDir)

	// Write files
	files := map[string]string{
		"user-data": req.UserData,
		"meta-data": req.MetaData,
	}

	if req.IncludeNetwork && req.NetworkConfig != "" {
		files["network-config"] = req.NetworkConfig
	}

	for filename, content := range files {
		filePath := filepath.Join(tmpDir, filename)
		if err := os.WriteFile(filePath, []byte(content), 0644); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to write " + filename})
			return
		}
	}

	// Generate ISO
	isoPath := filepath.Join(tmpDir, "seed.iso")
	isoCmd := getISOCommand()
	var cmd *exec.Cmd

	if req.IncludeNetwork && req.NetworkConfig != "" {
		cmd = exec.Command(isoCmd, "-output", isoPath, "-volid", "cidata", "-joliet", "-rock",
			filepath.Join(tmpDir, "user-data"),
			filepath.Join(tmpDir, "meta-data"),
			filepath.Join(tmpDir, "network-config"))
	} else {
		cmd = exec.Command(isoCmd, "-output", isoPath, "-volid", "cidata", "-joliet", "-rock",
			filepath.Join(tmpDir, "user-data"),
			filepath.Join(tmpDir, "meta-data"))
	}

	if err := cmd.Run(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate ISO: " + err.Error()})
		return
	}

	// Serve the generated ISO file
	c.Header("Content-Description", "File Transfer")
	c.Header("Content-Disposition", "attachment; filename=seed.iso")
	c.Header("Content-Type", "application/octet-stream")
	c.File(isoPath)
}