#!/usr/bin/env python3
"""
Deployment Script for Inventory Management System
This script helps deploy the application to various cloud platforms.
"""

import os
import subprocess
import sys
import json
from pathlib import Path

def create_heroku_files():
    """Create Heroku deployment files."""
    
    # Create Procfile
    with open('Procfile', 'w') as f:
        f.write('web: gunicorn server:app\n')
    
    # Create runtime.txt
    with open('runtime.txt', 'w') as f:
        f.write('python-3.11.7\n')
    
    # Update requirements.txt for production
    requirements = [
        'Flask==2.3.3',
        'gunicorn==21.2.0',
        'Werkzeug==2.3.7',
        'Jinja2==3.1.2',
        'MarkupSafe==2.1.3',
        'itsdangerous==2.1.2',
        'click==8.1.7',
        'blinker==1.6.3'
    ]
    
    with open('requirements.txt', 'w') as f:
        f.write('\n'.join(requirements))
    
    print("✅ Heroku files created successfully!")

def create_railway_files():
    """Create Railway deployment files."""
    
    # Create railway.json
    railway_config = {
        "build": {
            "builder": "nixpacks"
        },
        "deploy": {
            "startCommand": "gunicorn server:app",
            "healthcheckPath": "/",
            "healthcheckTimeout": 300,
            "restartPolicyType": "ON_FAILURE",
            "restartPolicyMaxRetries": 10
        }
    }
    
    with open('railway.json', 'w') as f:
        json.dump(railway_config, f, indent=2)
    
    print("✅ Railway files created successfully!")

def create_render_files():
    """Create Render deployment files."""
    
    # Create render.yaml
    render_config = """
services:
  - type: web
    name: inventory-system
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn server:app
    envVars:
      - key: PYTHON_VERSION
        value: 3.11.7
    healthCheckPath: /
    autoDeploy: true
"""
    
    with open('render.yaml', 'w') as f:
        f.write(render_config.strip())
    
    print("✅ Render files created successfully!")

def create_docker_files():
    """Create Docker deployment files."""
    
    # Create Dockerfile
    dockerfile = """FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "server:app"]
"""
    
    with open('Dockerfile', 'w') as f:
        f.write(dockerfile)
    
    # Create .dockerignore
    dockerignore = """venv/
__pycache__/
*.pyc
*.pyo
*.pyd
.Python
env/
.env
.venv
pip-log.txt
pip-delete-this-directory.txt
.tox/
.coverage
.coverage.*
.cache
nosetests.xml
coverage.xml
*.cover
*.log
.git
.mypy_cache
.pytest_cache
.hypothesis
"""
    
    with open('.dockerignore', 'w') as f:
        f.write(dockerignore)
    
    print("✅ Docker files created successfully!")

def create_vercel_files():
    """Create Vercel deployment files."""
    
    # Create vercel.json
    vercel_config = {
        "version": 2,
        "builds": [
            {
                "src": "server.py",
                "use": "@vercel/python"
            }
        ],
        "routes": [
            {
                "src": "/(.*)",
                "dest": "server.py"
            }
        ]
    }
    
    with open('vercel.json', 'w') as f:
        json.dump(vercel_config, f, indent=2)
    
    print("✅ Vercel files created successfully!")

def main():
    """Main deployment setup function."""
    
    print("🚀 Inventory System Deployment Setup")
    print("=" * 40)
    
    print("\nChoose your deployment platform:")
    print("1. Heroku (Free tier available)")
    print("2. Railway (Free tier available)")
    print("3. Render (Free tier available)")
    print("4. Vercel (Free tier available)")
    print("5. Docker (Self-hosted)")
    print("6. All platforms")
    
    choice = input("\nEnter your choice (1-6): ").strip()
    
    if choice == "1":
        create_heroku_files()
    elif choice == "2":
        create_railway_files()
    elif choice == "3":
        create_render_files()
    elif choice == "4":
        create_vercel_files()
    elif choice == "5":
        create_docker_files()
    elif choice == "6":
        create_heroku_files()
        create_railway_files()
        create_render_files()
        create_vercel_files()
        create_docker_files()
    else:
        print("❌ Invalid choice!")
        return
    
    print("\n📋 Deployment Instructions:")
    print("=" * 40)
    
    if choice in ["1", "6"]:
        print("\n🌐 Heroku Deployment:")
        print("1. Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli")
        print("2. Run: heroku login")
        print("3. Run: heroku create your-app-name")
        print("4. Run: git add . && git commit -m 'Deploy to Heroku'")
        print("5. Run: git push heroku main")
        print("6. Your app will be available at: https://your-app-name.herokuapp.com")
    
    if choice in ["2", "6"]:
        print("\n🚂 Railway Deployment:")
        print("1. Go to: https://railway.app")
        print("2. Connect your GitHub repository")
        print("3. Railway will automatically detect and deploy your app")
        print("4. Your app will be available at the provided URL")
    
    if choice in ["3", "6"]:
        print("\n🎨 Render Deployment:")
        print("1. Go to: https://render.com")
        print("2. Connect your GitHub repository")
        print("3. Create a new Web Service")
        print("4. Select Python environment")
        print("5. Your app will be available at the provided URL")
    
    if choice in ["4", "6"]:
        print("\n⚡ Vercel Deployment:")
        print("1. Install Vercel CLI: npm i -g vercel")
        print("2. Run: vercel login")
        print("3. Run: vercel")
        print("4. Your app will be available at the provided URL")
    
    if choice in ["5", "6"]:
        print("\n🐳 Docker Deployment:")
        print("1. Build image: docker build -t inventory-system .")
        print("2. Run container: docker run -p 8000:8000 inventory-system")
        print("3. Your app will be available at: http://localhost:8000")
    
    print("\n✅ Deployment files created successfully!")
    print("📁 Check the generated files in your project directory.")

if __name__ == "__main__":
    main() 