"""
List all available Google Gemini AI models
"""
import requests
import os

# Your API key
API_KEY = "AIzaSyDLBTkOIytz8yMZ_aDIYj9aEuV0k4JaSXE"

print("="*80)
print("Listing all available Google Gemini AI models".center(80))
print("="*80)

# List models endpoint
url = f"https://generativelanguage.googleapis.com/v1beta/models?key={API_KEY}"

try:
    response = requests.get(url)
    
    if response.status_code == 200:
        data = response.json()
        models = data.get('models', [])
        
        print(f"\n✅ Found {len(models)} models\n")
        print("="*80)
        
        # Filter for generative models
        generative_models = []
        
        for model in models:
            name = model.get('name', '')
            display_name = model.get('displayName', '')
            description = model.get('description', '')
            supported_methods = model.get('supportedGenerationMethods', [])
            
            # Check if it supports generateContent
            if 'generateContent' in supported_methods:
                model_id = name.replace('models/', '')
                generative_models.append({
                    'id': model_id,
                    'display_name': display_name,
                    'description': description,
                    'methods': supported_methods
                })
        
        print(f"📋 MODELS THAT SUPPORT 'generateContent' ({len(generative_models)} found):")
        print("="*80)
        
        for i, model in enumerate(generative_models, 1):
            print(f"\n{i}. MODEL ID: {model['id']}")
            print(f"   Display Name: {model['display_name']}")
            print(f"   Description: {model['description'][:100]}...")
            print(f"   Supported Methods: {', '.join(model['methods'])}")
        
        print("\n" + "="*80)
        print("💡 RECOMMENDED MODELS FOR YOUR PROJECT:")
        print("="*80)
        
        # Highlight key models
        recommended = [
            'gemini-pro',
            'gemini-1.5-pro',
            'gemini-1.5-flash',
            'gemini-2.0-flash-exp'
        ]
        
        for rec in recommended:
            found = next((m for m in generative_models if rec in m['id']), None)
            if found:
                print(f"\n✅ {found['id']}")
                print(f"   {found['display_name']}: {found['description'][:80]}...")
        
        print("\n" + "="*80)
        print("📝 TO USE A MODEL, UPDATE aiService.js:")
        print("="*80)
        print("\nChange the default model in backend/services/aiService.js:")
        print("   export function getAIModel(modelName = 'YOUR-MODEL-HERE')")
        print("\n" + "="*80)
        
    else:
        print(f"\n❌ Error: {response.status_code}")
        print(f"Response: {response.text}")
        
except Exception as e:
    print(f"\n❌ Error: {e}")
