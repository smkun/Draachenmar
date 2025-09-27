#!/bin/bash
# Character Portrait Generation Script
# This script provides templates for AI image generation

set -e

CHARACTERS_DIR="public/images/characters"
TEMP_DIR="temp_generated"
PROMPTS_DIR="reports/ai-prompts"

# Create directories
mkdir -p "$CHARACTERS_DIR"
mkdir -p "$TEMP_DIR"

echo "🎨 Character Portrait Generation Helper"
echo "======================================"
echo ""
echo "This script helps generate character portraits using AI tools."
echo "Prompts are available in reports/ai-prompts/"
echo ""
echo "Recommended workflow:"
echo "1. Use critical-priority.json prompts first"
echo "2. Generate images with your preferred AI tool (Midjourney, DALL-E, Stable Diffusion)"
echo "3. Save images to temp_generated/ with exact character names"
echo "4. Run the optimization script to convert to WebP"
echo ""
echo "Available prompt files:"
ls -1 "$PROMPTS_DIR"/*.json 2>/dev/null || echo "No prompt files found. Run the generation script first."
echo ""
echo "AI Generation Tips:"
echo "- Use the 'aiPrompt' field for your AI tool"
echo "- Add the 'stylePrompt' for style consistency"
echo "- Generate at least 512x512 resolution"
echo "- Aim for consistent fantasy art style"
echo ""
echo "Example usage with Stable Diffusion:"
echo "python generate_image.py --prompt 'Portrait of King Rathgar...' --output temp_generated/"
echo ""
echo "After generation, run:"
echo "npm run optimize-images"
