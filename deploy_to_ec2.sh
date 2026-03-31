#!/bin/bash

# Configuration
EC2_IP="3.27.67.51"
KEY_FILE="Akshata.pem"
REMOTE_USER="ec2-user"

echo "🚀 Starting Deployment to $EC2_IP..."

# 1. Ensure the key file has the correct permissions
echo "🔒 Setting permissions for $KEY_FILE..."
chmod 400 "$KEY_FILE" 2>/dev/null || true

# 2. Package the application
echo "📦 Packaging the application..."
tar -cf deployment.tar backend frontend database docker-compose.yml 2>/dev/null

# 3. Upload and Deploy on EC2
echo "🏗 Connecting to EC2 and Deploying..."
# Using SSH to run commands directly
ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 -i "$KEY_FILE" "$REMOTE_USER@$EC2_IP" "mkdir -p ~/notes-app"

if [ $? -ne 0 ]; then
    echo "❌ ERROR: Cannot connect to EC2 instance at $EC2_IP."
    echo "   Ensure your AWS Security Group allows SSH (Port 22) for your current IP."
    rm deployment.tar
    exit 1
fi

scp -o StrictHostKeyChecking=no -i "$KEY_FILE" deployment.tar "$REMOTE_USER@$EC2_IP":/home/$REMOTE_USER/

ssh -o StrictHostKeyChecking=no -i "$KEY_FILE" "$REMOTE_USER@$EC2_IP" << 'EOF'
    set -e
    
    # Identify OS and install Docker
    if ! command -v docker &> /dev/null; then
        echo "🐳 Installing Docker..."
        sudo yum update -y
        # Try both AL2 and AL2023 methods
        sudo yum install -y docker || sudo amazon-linux-extras install docker -y
        sudo service docker start
        sudo usermod -a -G docker ec2-user
    fi

    # Install Docker Compose if missing
    if ! docker compose version &> /dev/null; then
        echo "🐙 Installing Docker Compose v2..."
        sudo mkdir -p /usr/local/lib/docker/cli-plugins/
        sudo curl -SL https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-linux-x86_64 -o /usr/local/lib/docker/cli-plugins/docker-compose
        sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
    fi

    # Extract project
    echo "📂 Extracting files..."
    tar -xf ~/deployment.tar -C ~/notes-app
    cd ~/notes-app

    # Build and Start
    echo "🚢 Starting Docker Containers..."
    export DOCKER_CLIENT_TIMEOUT=120
    export COMPOSE_HTTP_TIMEOUT=120
    sudo docker compose down || true
    sudo docker compose up --build -d
    
    echo "✅ DEPLOYMENT SUCCESSFUL!"
EOF

# Clean up
rm deployment.tar
echo "🏁 Done!"
