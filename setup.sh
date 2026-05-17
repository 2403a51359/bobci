#!/bin/bash

echo "🤖 BobCI Setup Script"
echo "===================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Python is installed
echo -e "${BLUE}Checking Python installation...${NC}"
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is not installed. Please install Python 3.9 or higher.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Python 3 found${NC}"

# Check if Node.js is installed
echo -e "${BLUE}Checking Node.js installation...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18 or higher.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js found${NC}"

# Check if Bob is installed
echo -e "${BLUE}Checking IBM Bob installation...${NC}"
if ! command -v bob &> /dev/null; then
    echo -e "${YELLOW}⚠️  IBM Bob Shell not found in PATH${NC}"
    echo -e "${YELLOW}   You'll need to configure BOB_SHELL_PATH in .env${NC}"
else
    echo -e "${GREEN}✓ IBM Bob Shell found${NC}"
fi

echo ""
echo -e "${BLUE}Setting up Backend...${NC}"
echo "====================="

# Navigate to backend directory
cd backend

# Create virtual environment
echo -e "${BLUE}Creating Python virtual environment...${NC}"
python3 -m venv venv
echo -e "${GREEN}✓ Virtual environment created${NC}"

# Activate virtual environment
echo -e "${BLUE}Activating virtual environment...${NC}"
source venv/bin/activate
echo -e "${GREEN}✓ Virtual environment activated${NC}"

# Install Python dependencies
echo -e "${BLUE}Installing Python dependencies...${NC}"
pip install --upgrade pip
pip install -r requirements.txt
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Python dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install Python dependencies${NC}"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${BLUE}Creating .env file...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ .env file created${NC}"
    echo -e "${YELLOW}⚠️  Please edit backend/.env and configure your settings${NC}"
else
    echo -e "${YELLOW}⚠️  .env file already exists, skipping...${NC}"
fi

# Go back to root
cd ..

echo ""
echo -e "${BLUE}Setting up Frontend...${NC}"
echo "======================"

# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
echo -e "${BLUE}Installing Node.js dependencies...${NC}"
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Node.js dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install Node.js dependencies${NC}"
    exit 1
fi

# Go back to root
cd ..

# Create bob_sessions directory
echo -e "${BLUE}Creating bob_sessions directory...${NC}"
mkdir -p bob_sessions
echo -e "${GREEN}✓ bob_sessions directory created${NC}"

# Create a .gitkeep file
touch bob_sessions/.gitkeep

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo ""
echo "1. Configure environment variables:"
echo "   ${YELLOW}nano backend/.env${NC}"
echo ""
echo "2. Start the backend server:"
echo "   ${YELLOW}cd backend${NC}"
echo "   ${YELLOW}source venv/bin/activate${NC}"
echo "   ${YELLOW}python main.py${NC}"
echo ""
echo "3. In a new terminal, start the frontend:"
echo "   ${YELLOW}cd frontend${NC}"
echo "   ${YELLOW}npm run dev${NC}"
echo ""
echo "4. Open your browser:"
echo "   ${YELLOW}http://localhost:3000${NC}"
echo ""
echo -e "${BLUE}For more information, see README.md${NC}"
echo ""

# Made with Bob
